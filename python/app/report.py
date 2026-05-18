"""Generación de PDF profesional de informe de sesión.

Stack: matplotlib (gráficos científicos) + reportlab (composición PDF).
Resultado: informe técnico tipo "race engineer" con:
  - Cabecera con metadatos
  - KPIs en tarjetas
  - Gráfico tiempos por vuelta + degradación
  - Box plot de distribución
  - Heatmap sector × vuelta
  - Tabla detallada de vueltas
"""
from __future__ import annotations

import io
from datetime import datetime
from typing import Optional

import matplotlib

matplotlib.use("Agg")  # backend sin display, obligatorio en server
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import (
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from .analytics import compute_stats, compute_degradation, compute_heatmap
from .schemas import LapInput


RACING_RED = colors.HexColor("#d32f2f")
RACING_DARK = colors.HexColor("#9a0007")
GRAY = colors.HexColor("#616161")
LIGHT_GRAY = colors.HexColor("#eeeeee")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def format_lap_time(ms: Optional[float]) -> str:
    if ms is None:
        return "—"
    total_s = ms / 1000
    m = int(total_s // 60)
    s = total_s - m * 60
    return f"{m}:{s:06.3f}" if m else f"{s:.3f}"


def _df(laps: list[LapInput]) -> pd.DataFrame:
    df = pd.DataFrame([lap.model_dump(by_alias=False) for lap in laps])
    return df.sort_values("lap_number").reset_index(drop=True)


# ─── Gráficos matplotlib ──────────────────────────────────────────────────────

def _lap_time_chart(df: pd.DataFrame, deg: dict) -> io.BytesIO:
    fig, ax = plt.subplots(figsize=(8, 3.5))
    valid = df[df["valid"]]
    invalid = df[~df["valid"]]

    ax.plot(valid["lap_number"], valid["lap_time_ms"] / 1000,
            marker="o", color="#d32f2f", linewidth=2, label="Vueltas válidas")
    if len(invalid) > 0:
        ax.scatter(invalid["lap_number"], invalid["lap_time_ms"] / 1000,
                   color="#9e9e9e", marker="x", s=80, label="Inválidas")

    # Curva polinómica de degradación
    poly = deg.get("polynomial") or {}
    coeffs = poly.get("coefficients")
    if coeffs and len(valid) >= 3:
        xs = np.linspace(valid["lap_number"].min(), valid["lap_number"].max(), 100)
        ys = np.polyval(coeffs, xs) / 1000
        ax.plot(xs, ys, color="#1976d2", linestyle="--", linewidth=1.5,
                label=f"Degradación g{poly.get('degree')} (R² {poly.get('r_squared', 0):.2f})")

    if len(valid) > 0:
        ax.axhline(valid["lap_time_ms"].min() / 1000, color="#4caf50",
                   linestyle=":", linewidth=1, label="Best lap")

    ax.set_xlabel("Vuelta")
    ax.set_ylabel("Segundos")
    ax.set_title("Tiempos por vuelta y modelo de degradación", fontweight="bold")
    ax.grid(alpha=0.3)
    ax.legend(loc="best", fontsize=8)
    plt.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=140)
    plt.close(fig)
    buf.seek(0)
    return buf


def _distribution_chart(df: pd.DataFrame) -> io.BytesIO:
    valid = df[df["valid"]]["lap_time_ms"] / 1000
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(8, 2.8))

    ax1.boxplot(valid, vert=True, patch_artist=True,
                boxprops=dict(facecolor="#d32f2f", alpha=0.6),
                medianprops=dict(color="black", linewidth=2),
                showmeans=True, meanprops=dict(marker="D", markeredgecolor="black",
                                               markerfacecolor="#ffeb3b"))
    ax1.set_title("Box plot", fontweight="bold")
    ax1.set_ylabel("Segundos")
    ax1.grid(alpha=0.3, axis="y")

    ax2.hist(valid, bins=max(5, int(np.sqrt(len(valid)))),
             color="#d32f2f", edgecolor="#9a0007", alpha=0.75)
    ax2.set_title("Histograma", fontweight="bold")
    ax2.set_xlabel("Segundos")
    ax2.set_ylabel("Frecuencia")
    ax2.grid(alpha=0.3, axis="y")

    plt.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=140)
    plt.close(fig)
    buf.seek(0)
    return buf


def _heatmap_chart(heatmap: dict) -> Optional[io.BytesIO]:
    gap = heatmap.get("gap_ms")
    if not gap or not any(any(v is not None for v in row) for row in gap):
        return None

    matrix = np.array([[(v / 1000 if v is not None else np.nan) for v in row] for row in gap])
    fig, ax = plt.subplots(figsize=(8, 2.2))
    im = ax.imshow(matrix, aspect="auto", cmap="RdYlGn_r", interpolation="nearest")
    ax.set_yticks(range(len(heatmap["sectors"])))
    ax.set_yticklabels(heatmap["sectors"])
    ax.set_xticks(range(len(heatmap["lap_numbers"])))
    ax.set_xticklabels(heatmap["lap_numbers"], fontsize=8)
    ax.set_title("Gap por sector respecto al mejor sector (s)", fontweight="bold")
    fig.colorbar(im, ax=ax, label="Gap (s)", shrink=0.7)
    plt.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=140)
    plt.close(fig)
    buf.seek(0)
    return buf


# ─── Composición del PDF ──────────────────────────────────────────────────────

def _header_footer(canvas: Canvas, doc: SimpleDocTemplate) -> None:
    canvas.saveState()
    # Header band
    canvas.setFillColor(RACING_RED)
    canvas.rect(0, A4[1] - 1.4 * cm, A4[0], 1.4 * cm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawString(1.5 * cm, A4[1] - 0.95 * cm, "RACING TEAM MANAGEMENT")
    canvas.setFont("Helvetica", 9)
    canvas.drawRightString(A4[0] - 1.5 * cm, A4[1] - 0.95 * cm, "Informe de sesión")
    # Footer
    canvas.setFillColor(GRAY)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(1.5 * cm, 1 * cm,
                      f"Generado el {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    canvas.drawRightString(A4[0] - 1.5 * cm, 1 * cm, f"Página {doc.page}")
    canvas.restoreState()


def generate_pdf(session_meta: dict, laps: list[LapInput]) -> bytes:
    """Genera el PDF y lo devuelve como bytes."""
    df = _df(laps)
    stats = compute_stats(df)
    deg = compute_degradation(df)
    heatmap = compute_heatmap(df)

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=1.5 * cm, rightMargin=1.5 * cm,
        topMargin=2 * cm, bottomMargin=1.5 * cm,
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("title", parent=styles["Title"],
                                 fontSize=18, textColor=RACING_DARK, spaceAfter=4)
    subtitle_style = ParagraphStyle("subtitle", parent=styles["Normal"],
                                    fontSize=11, textColor=GRAY, spaceAfter=12)
    h2_style = ParagraphStyle("h2", parent=styles["Heading2"],
                              fontSize=13, textColor=RACING_DARK,
                              spaceAfter=6, spaceBefore=14)
    normal = styles["Normal"]

    elements = []
    elements.append(Paragraph(session_meta.get("name", "Sesión"), title_style))

    subtitle_parts = []
    if session_meta.get("circuit"):
        subtitle_parts.append(session_meta["circuit"])
    if session_meta.get("session_date"):
        subtitle_parts.append(session_meta["session_date"])
    if session_meta.get("session_type"):
        subtitle_parts.append(session_meta["session_type"])
    if session_meta.get("track_condition"):
        subtitle_parts.append(session_meta["track_condition"])
    elements.append(Paragraph(" · ".join(subtitle_parts), subtitle_style))

    # Tabla de metadatos
    meta_rows = []
    if session_meta.get("driver_name"):
        meta_rows.append(["Piloto", session_meta["driver_name"]])
    if session_meta.get("vehicle_name"):
        meta_rows.append(["Vehículo", session_meta["vehicle_name"]])
    if session_meta.get("team_name"):
        meta_rows.append(["Equipo", session_meta["team_name"]])
    if session_meta.get("duration_minutes"):
        meta_rows.append(["Duración", f"{session_meta['duration_minutes']} min"])
    if session_meta.get("notes"):
        meta_rows.append(["Notas", session_meta["notes"]])
    if meta_rows:
        meta_table = Table(meta_rows, colWidths=[3.5 * cm, 14 * cm])
        meta_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("TEXTCOLOR", (0, 0), (0, -1), GRAY),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BACKGROUND", (0, 0), (-1, -1), colors.whitesmoke),
            ("LINEBELOW", (0, 0), (-1, -2), 0.3, colors.lightgrey),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 8))

    # ── KPIs en grid 4×2 ──
    elements.append(Paragraph("Indicadores clave", h2_style))
    kpi_data = [
        ["Mejor vuelta", "Media", "Mediana", "Consistencia"],
        [
            format_lap_time(stats.get("best_lap_ms")),
            format_lap_time(stats.get("average_ms")),
            format_lap_time(stats.get("median_ms")),
            f"±{(stats['std_dev_ms'] / 1000):.3f}s" if stats.get("std_dev_ms") else "—",
        ],
        ["Mejor sector", "Vueltas válidas", "Inválidas", "Coef. variación"],
        [
            (f"{(deg['polynomial']['r_squared']):.2f}"
             if deg.get("polynomial", {}).get("r_squared") else "—"),
            str(stats.get("valid_laps", 0)),
            str(stats.get("invalid_laps", 0)),
            (f"{stats['coefficient_of_variation']*100:.2f}%"
             if stats.get("coefficient_of_variation") else "—"),
        ],
    ]
    # corrige fila 3 col 0: era el R² mal etiquetado. Reemplazo por theoretical best
    # del heatmap (suma de mejores sectores).
    best_per_sector = heatmap.get("best_ms_per_sector") or []
    valid_secs = [s for s in best_per_sector if s is not None]
    theoretical = sum(valid_secs) if len(valid_secs) == 3 else None
    kpi_data[2][0] = "Theoretical best"
    kpi_data[3][0] = format_lap_time(theoretical)

    kpi_table = Table(kpi_data, colWidths=[4.4 * cm] * 4, rowHeights=[0.6 * cm, 0.9 * cm, 0.6 * cm, 0.9 * cm])
    kpi_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), LIGHT_GRAY),
        ("BACKGROUND", (0, 2), (-1, 2), LIGHT_GRAY),
        ("TEXTCOLOR", (0, 0), (-1, 0), GRAY),
        ("TEXTCOLOR", (0, 2), (-1, 2), GRAY),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 2), (-1, 2), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
        ("FONTNAME", (0, 3), (-1, 3), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTSIZE", (0, 1), (-1, 1), 14),
        ("FONTSIZE", (0, 3), (-1, 3), 14),
        ("TEXTCOLOR", (0, 1), (-1, 1), RACING_DARK),
        ("TEXTCOLOR", (0, 3), (-1, 3), RACING_DARK),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.lightgrey),
        ("LINEBELOW", (0, 2), (-1, 2), 0.5, colors.lightgrey),
    ]))
    elements.append(kpi_table)

    # ── Gráficos ──
    elements.append(Paragraph("Análisis gráfico", h2_style))
    lap_chart = _lap_time_chart(df, deg)
    elements.append(Image(lap_chart, width=18 * cm, height=7.7 * cm))

    dist_chart = _distribution_chart(df)
    elements.append(Spacer(1, 4))
    elements.append(Image(dist_chart, width=18 * cm, height=6.2 * cm))

    hm = _heatmap_chart(heatmap)
    if hm is not None:
        elements.append(Spacer(1, 4))
        elements.append(Image(hm, width=18 * cm, height=4.8 * cm))

    # ── Tabla de vueltas ──
    elements.append(Paragraph("Detalle por vuelta", h2_style))
    rows = [["Vuelta", "Tiempo", "S1", "S2", "S3", "Compound", "Válida"]]
    best_lap_ms = stats.get("best_lap_ms")
    for lap in laps:
        row = [
            str(lap.lap_number),
            format_lap_time(lap.lap_time_ms),
            format_lap_time(lap.sector1_ms),
            format_lap_time(lap.sector2_ms),
            format_lap_time(lap.sector3_ms),
            lap.compound or "—",
            "✓" if lap.valid else "✗",
        ]
        rows.append(row)

    lap_table = Table(rows, colWidths=[1.6 * cm, 2.4 * cm, 2.4 * cm, 2.4 * cm, 2.4 * cm, 2.4 * cm, 1.5 * cm])
    style = [
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BACKGROUND", (0, 0), (-1, 0), RACING_RED),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("FONTNAME", (1, 1), (4, -1), "Courier"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.whitesmoke]),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.lightgrey),
    ]
    # Resalta best lap y vueltas inválidas
    for i, lap in enumerate(laps, start=1):
        if lap.lap_time_ms == best_lap_ms:
            style.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#c8e6c9")))
            style.append(("FONTNAME", (0, i), (-1, i), "Helvetica-Bold"))
        elif not lap.valid:
            style.append(("TEXTCOLOR", (0, i), (-1, i), colors.HexColor("#b71c1c")))
    lap_table.setStyle(TableStyle(style))
    elements.append(lap_table)

    doc.build(elements, onFirstPage=_header_footer, onLaterPages=_header_footer)
    buf.seek(0)
    return buf.getvalue()
