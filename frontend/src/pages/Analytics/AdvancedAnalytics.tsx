import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import Plot from 'react-plotly.js';
import { sessionsApi, formatLapTime } from '../../api/sessions';
import {
  AnomaliesAnalysis,
  DegradationAnalysis,
  HeatmapAnalysis,
  SessionAnalytics,
  StintsAnalysis,
} from '../../types';
import { colors, fonts } from '../../theme/tokens';
import {
  apexPlotlyLayout,
  apexPlotlyConfig,
  apexPaletteSeries,
} from '../../theme/apexPlotly';
import { Panel, Mono, Pill } from '../../components/apex';

interface Props {
  sessionId: number;
  base: SessionAnalytics;
}

type TabKey = 'distribution' | 'heatmap' | 'stints' | 'anomalies' | 'degradation';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'distribution', label: 'Distribution' },
  { key: 'heatmap', label: 'Sector heatmap' },
  { key: 'stints', label: 'Stints' },
  { key: 'anomalies', label: 'Anomalies' },
  { key: 'degradation', label: 'Degradation' },
];

const AdvancedAnalytics: React.FC<Props> = ({ sessionId, base }) => {
  const [tab, setTab] = useState<TabKey>('distribution');

  const [stints, setStints] = useState<StintsAnalysis | null>(null);
  const [anomalies, setAnomalies] = useState<AnomaliesAnalysis | null>(null);
  const [degradation, setDegradation] = useState<DegradationAnalysis | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapAnalysis | null>(null);

  const [loading, setLoading] = useState<Record<TabKey, boolean>>({
    distribution: false,
    heatmap: false,
    stints: false,
    anomalies: false,
    degradation: false,
  });
  const [error, setError] = useState<Record<TabKey, string | null>>({
    distribution: null,
    heatmap: null,
    stints: null,
    anomalies: null,
    degradation: null,
  });

  const fetchWith = async <T,>(
    key: TabKey,
    fn: () => Promise<T>,
    setter: (v: T) => void,
  ) => {
    setLoading((s) => ({ ...s, [key]: true }));
    setError((s) => ({ ...s, [key]: null }));
    try {
      setter(await fn());
    } catch (e: any) {
      setError((s) => ({
        ...s,
        [key]: e?.response?.data?.message || 'Analytics service unavailable',
      }));
    } finally {
      setLoading((s) => ({ ...s, [key]: false }));
    }
  };

  useEffect(() => {
    setStints(null);
    setAnomalies(null);
    setDegradation(null);
    setHeatmap(null);
  }, [sessionId]);

  useEffect(() => {
    if (tab === 'stints' && !stints && !loading.stints) {
      fetchWith('stints', () => sessionsApi.stints(sessionId), setStints);
    } else if (tab === 'anomalies' && !anomalies && !loading.anomalies) {
      fetchWith('anomalies', () => sessionsApi.anomalies(sessionId), setAnomalies);
    } else if (tab === 'degradation' && !degradation && !loading.degradation) {
      fetchWith('degradation', () => sessionsApi.degradationAdvanced(sessionId), setDegradation);
    } else if (tab === 'heatmap' && !heatmap && !loading.heatmap) {
      fetchWith('heatmap', () => sessionsApi.heatmap(sessionId), setHeatmap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, sessionId]);

  return (
    <Panel
      title="Advanced analytics"
      right={
        <Mono style={{ color: colors.textMute }}>pandas · sklearn · scipy</Mono>
      }
      padding={0}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${colors.border}`,
          background: colors.surface,
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
        }}
      >
        {TABS.map((t) => (
          <Pill key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </Pill>
        ))}
      </div>

      <div style={{ padding: 16 }}>
        {tab === 'distribution' && <DistributionPanel analytics={base} />}
        {tab === 'heatmap' && (
          <Loader loading={loading.heatmap} error={error.heatmap}>
            {heatmap && <HeatmapPanel data={heatmap} />}
          </Loader>
        )}
        {tab === 'stints' && (
          <Loader loading={loading.stints} error={error.stints}>
            {stints && <StintsPanel data={stints} base={base} />}
          </Loader>
        )}
        {tab === 'anomalies' && (
          <Loader loading={loading.anomalies} error={error.anomalies}>
            {anomalies && <AnomaliesPanel data={anomalies} base={base} />}
          </Loader>
        )}
        {tab === 'degradation' && (
          <Loader loading={loading.degradation} error={error.degradation}>
            {degradation && <DegradationPanel data={degradation} base={base} />}
          </Loader>
        )}
      </div>
    </Panel>
  );
};

/* ─── Loader ──────────────────────────────────────────────────────────── */

const Loader: React.FC<{
  loading: boolean;
  error: string | null;
  children?: React.ReactNode;
}> = ({ loading, error, children }) => {
  if (loading) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <CircularProgress size={20} />
      </div>
    );
  }
  if (error) {
    return (
      <div
        style={{
          padding: '10px 14px',
          border: `1px solid ${colors.yellow}`,
          color: colors.yellow,
          fontFamily: fonts.mono,
          fontSize: 11,
          letterSpacing: '0.6px',
        }}
      >
        {error}
      </div>
    );
  }
  return <>{children}</>;
};

const InfoNote: React.FC<{
  tone?: 'info' | 'warn' | 'good';
  children: React.ReactNode;
}> = ({ tone = 'info', children }) => {
  const accent =
    tone === 'warn' ? colors.yellow : tone === 'good' ? colors.green : colors.accent;
  const bg =
    tone === 'warn'
      ? 'rgba(255, 194, 51, 0.06)'
      : tone === 'good'
        ? 'rgba(38, 208, 124, 0.06)'
        : 'rgba(62, 197, 209, 0.04)';
  return (
    <div
      style={{
        border: `1px solid ${colors.border}`,
        borderLeft: `3px solid ${accent}`,
        background: bg,
        padding: '10px 14px',
        fontSize: 12,
        color: colors.text,
        lineHeight: 1.5,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
};

/* ─── Distribution ────────────────────────────────────────────────────── */

const DistributionPanel: React.FC<{ analytics: SessionAnalytics }> = ({ analytics }) => {
  const validTimes = analytics.perLap
    .filter((l) => l.valid)
    .map((l) => l.lapTimeMs / 1000);

  if (validTimes.length === 0) {
    return <InfoNote>No valid laps to show distribution.</InfoNote>;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}
    >
      <Plot
        data={
          [
            {
              y: validTimes,
              type: 'box' as const,
              name: 'Time',
              boxpoints: 'all' as const,
              jitter: 0.4,
              pointpos: 0,
              marker: { color: colors.accent, size: 5 },
              line: { color: colors.accent },
              fillcolor: 'rgba(62, 197, 209, 0.10)',
              boxmean: 'sd' as const,
            },
          ] as never
        }
        layout={
          apexPlotlyLayout({
            height: 320,
            margin: { l: 50, r: 14, t: 30, b: 30 },
            title: {
              text: 'Box plot',
              font: { family: fonts.mono, size: 11, color: colors.textDim },
            },
            yaxis: {
              ...(apexPlotlyLayout().yaxis as object),
              title: {
                text: 'Seconds',
                font: { family: fonts.mono, size: 10, color: colors.textMute },
              },
            },
          }) as never
        }
        useResizeHandler
        style={{ width: '100%', height: 320 }}
        config={apexPlotlyConfig as never}
      />
      <Plot
        data={
          [
            {
              x: validTimes,
              type: 'histogram' as const,
              name: 'Laps',
              marker: {
                color: colors.accent,
                opacity: 0.7,
                line: { color: colors.bg, width: 1 },
              },
              autobinx: true,
            },
          ] as never
        }
        layout={
          apexPlotlyLayout({
            height: 320,
            margin: { l: 50, r: 14, t: 30, b: 40 },
            title: {
              text: 'Histogram',
              font: { family: fonts.mono, size: 11, color: colors.textDim },
            },
            xaxis: {
              ...(apexPlotlyLayout().xaxis as object),
              title: {
                text: 'Seconds',
                font: { family: fonts.mono, size: 10, color: colors.textMute },
              },
            },
            yaxis: {
              ...(apexPlotlyLayout().yaxis as object),
              title: {
                text: 'Frequency',
                font: { family: fonts.mono, size: 10, color: colors.textMute },
              },
            },
          }) as never
        }
        useResizeHandler
        style={{ width: '100%', height: 320 }}
        config={apexPlotlyConfig as never}
      />
    </div>
  );
};

/* ─── Heatmap ─────────────────────────────────────────────────────────── */

const HeatmapPanel: React.FC<{ data: HeatmapAnalysis }> = ({ data }) => {
  const z = data.gapMs.map((row) => row.map((v) => (v == null ? null : v / 1000)));
  return (
    <div>
      <Plot
        data={
          [
            {
              z,
              x: data.lapNumbers,
              y: data.sectors,
              type: 'heatmap' as const,
              colorscale: [
                [0, colors.green],
                [0.3, colors.green],
                [0.55, colors.yellow],
                [0.8, colors.orange],
                [1, colors.red],
              ],
              zmin: 0,
              colorbar: {
                title: {
                  text: 'Gap (s)',
                  font: { family: fonts.mono, size: 10, color: colors.textMute },
                },
                tickfont: { family: fonts.mono, size: 10, color: colors.textMute },
                outlinecolor: colors.border,
                bordercolor: colors.border,
              },
              hovertemplate:
                'Lap %{x}<br>%{y}<br>Gap: %{z:.3f}s<extra></extra>',
            },
          ] as never
        }
        layout={
          apexPlotlyLayout({
            height: 280,
            margin: { l: 50, r: 14, t: 10, b: 40 },
            xaxis: {
              ...(apexPlotlyLayout().xaxis as object),
              title: {
                text: 'Lap',
                font: { family: fonts.mono, size: 10, color: colors.textMute },
              },
              dtick: 1,
            },
            yaxis: {
              ...(apexPlotlyLayout().yaxis as object),
              autorange: 'reversed' as const,
            },
          }) as never
        }
        useResizeHandler
        style={{ width: '100%', height: 280 }}
        config={apexPlotlyConfig as never}
      />
      <Mono
        style={{
          fontSize: 10,
          color: colors.textMute,
          letterSpacing: '0.3px',
          lineHeight: 1.5,
          marginTop: 10,
          display: 'block',
        }}
      >
        Each cell shows how much you lose in that sector versus the best sector you achieved
        in the whole session. Green = perfect lap for that sector.
      </Mono>
    </div>
  );
};

/* ─── Stints ──────────────────────────────────────────────────────────── */

const StintsPanel: React.FC<{
  data: StintsAnalysis;
  base: SessionAnalytics;
}> = ({ data, base }) => {
  if (data.nStints === 0) {
    return <InfoNote>Session too short to detect stints.</InfoNote>;
  }

  const stintColors = (idx: number) => apexPaletteSeries[idx % apexPaletteSeries.length];

  const traces = data.stints.map((stint, idx) => {
    const color = stintColors(idx);
    const stintLaps = base.perLap.filter((l) => stint.lapNumbers.includes(l.lapNumber));
    return {
      x: stintLaps.map((l) => l.lapNumber),
      y: stintLaps.map((l) => l.lapTimeMs / 1000),
      type: 'scatter' as const,
      mode: 'lines+markers' as const,
      name: `Stint ${idx + 1}${stint.dominantCompound ? ` (${stint.dominantCompound})` : ''}`,
      line: { color, width: 2 },
      marker: {
        color,
        size: 6,
        line: { color: colors.bg, width: 1 },
      },
    };
  });

  return (
    <div>
      <InfoNote>
        {data.nStints} stints detected — method:{' '}
        <strong style={{ color: colors.accent }}>
          {data.method === 'compound-based' ? 'by compound' : 'KMeans 1D on lap_time'}
        </strong>
        .
      </InfoNote>
      <Plot
        data={traces as never}
        layout={
          apexPlotlyLayout({
            height: 360,
            margin: { l: 50, r: 14, t: 10, b: 40 },
            xaxis: {
              ...(apexPlotlyLayout().xaxis as object),
              title: {
                text: 'Lap',
                font: { family: fonts.mono, size: 10, color: colors.textMute },
              },
              dtick: 1,
            },
            yaxis: {
              ...(apexPlotlyLayout().yaxis as object),
              title: {
                text: 'Seconds',
                font: { family: fonts.mono, size: 10, color: colors.textMute },
              },
            },
            showlegend: true,
            legend: {
              orientation: 'h' as const,
              y: -0.18,
              font: { family: fonts.mono, size: 10, color: colors.textDim },
            },
          }) as never
        }
        useResizeHandler
        style={{ width: '100%', height: 360 }}
        config={apexPlotlyConfig as never}
      />

      <div
        style={{
          marginTop: 14,
          border: `1px solid ${colors.border}`,
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Stint', 'Compound', 'Laps', 'Best', 'Average', 'Degradation'].map((h, i) => (
                <th
                  key={h}
                  style={{
                    textAlign: i >= 2 ? 'right' : 'left',
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    color: colors.textMute,
                    fontWeight: 600,
                    padding: '8px 12px',
                    background: colors.surface2,
                    borderBottom: `1px solid ${colors.borderHi}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.stints.map((s, idx) => {
              const c = stintColors(idx);
              const degColor =
                s.degradationMsPerLap == null
                  ? colors.textMute
                  : s.degradationMsPerLap > 0
                    ? colors.yellow
                    : colors.green;
              return (
                <tr key={s.stintIndex}>
                  <TD>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          background: c,
                          flexShrink: 0,
                        }}
                      />
                      <Mono style={{ color: colors.text, fontWeight: 600 }}>
                        Stint {idx + 1}
                      </Mono>
                    </span>
                  </TD>
                  <TD>
                    <Mono style={{ color: colors.textDim }}>
                      {s.dominantCompound || '—'}
                    </Mono>
                  </TD>
                  <TD align="right">{s.lapsCount}</TD>
                  <TD align="right" mono bold>
                    {formatLapTime(s.bestMs)}
                  </TD>
                  <TD align="right" mono>
                    {formatLapTime(Math.round(s.meanMs))}
                  </TD>
                  <TD align="right" mono color={degColor}>
                    {s.degradationMsPerLap != null
                      ? `${s.degradationMsPerLap > 0 ? '+' : ''}${(
                          s.degradationMsPerLap / 1000
                        ).toFixed(3)} s/lap`
                      : '—'}
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── Anomalies ───────────────────────────────────────────────────────── */

const AnomaliesPanel: React.FC<{
  data: AnomaliesAnalysis;
  base: SessionAnalytics;
}> = ({ data, base }) => {
  const scoresByLap = new Map(data.anomalies.map((a) => [a.lapNumber, a.anomalyScore]));
  const anomalyLaps = data.anomalies.filter((a) => a.isAnomaly).map((a) => a.lapNumber);

  const normalLaps = base.perLap.filter(
    (l) => l.valid && !anomalyLaps.includes(l.lapNumber),
  );
  const anomalousLaps = base.perLap.filter(
    (l) => l.valid && anomalyLaps.includes(l.lapNumber),
  );

  return (
    <div>
      <InfoNote tone={data.nAnomalies > 0 ? 'warn' : 'good'}>
        IsolationForest detected{' '}
        <Mono style={{ fontWeight: 700, color: data.nAnomalies > 0 ? colors.orange : colors.green }}>
          {data.nAnomalies}
        </Mono>{' '}
        anomalous laps out of {base.validLaps} valid.
      </InfoNote>
      <Plot
        data={
          [
            {
              x: normalLaps.map((l) => l.lapNumber),
              y: normalLaps.map((l) => l.lapTimeMs / 1000),
              type: 'scatter' as const,
              mode: 'markers' as const,
              name: 'Normal',
              marker: {
                color: colors.accent,
                size: 8,
                line: { color: colors.bg, width: 1 },
              },
              text: normalLaps.map(
                (l) => `score: ${(scoresByLap.get(l.lapNumber) ?? 0).toFixed(3)}`,
              ),
            },
            {
              x: anomalousLaps.map((l) => l.lapNumber),
              y: anomalousLaps.map((l) => l.lapTimeMs / 1000),
              type: 'scatter' as const,
              mode: 'markers' as const,
              name: 'Anomaly',
              marker: {
                color: colors.orange,
                size: 14,
                symbol: 'x' as const,
                line: { color: colors.bg, width: 2 },
              },
              text: anomalousLaps.map(
                (l) => `score: ${(scoresByLap.get(l.lapNumber) ?? 0).toFixed(3)}`,
              ),
            },
          ] as never
        }
        layout={
          apexPlotlyLayout({
            height: 320,
            margin: { l: 50, r: 14, t: 10, b: 40 },
            xaxis: {
              ...(apexPlotlyLayout().xaxis as object),
              title: {
                text: 'Lap',
                font: { family: fonts.mono, size: 10, color: colors.textMute },
              },
              dtick: 1,
            },
            yaxis: {
              ...(apexPlotlyLayout().yaxis as object),
              title: {
                text: 'Seconds',
                font: { family: fonts.mono, size: 10, color: colors.textMute },
              },
            },
            showlegend: true,
            legend: {
              orientation: 'h' as const,
              y: -0.18,
              font: { family: fonts.mono, size: 10, color: colors.textDim },
            },
          }) as never
        }
        useResizeHandler
        style={{ width: '100%', height: 320 }}
        config={apexPlotlyConfig as never}
      />
    </div>
  );
};

/* ─── Degradation ─────────────────────────────────────────────────────── */

const DegradationPanel: React.FC<{
  data: DegradationAnalysis;
  base: SessionAnalytics;
}> = ({ data, base }) => {
  const validLaps = base.perLap.filter((l) => l.valid);
  const lapNumbers = validLaps.map((l) => l.lapNumber);
  const times = validLaps.map((l) => l.lapTimeMs / 1000);

  const xMin = Math.min(...lapNumbers);
  const xMax = Math.max(...lapNumbers);
  const xs: number[] = [];
  const N = 100;
  for (let i = 0; i <= N; i++) xs.push(xMin + ((xMax - xMin) * i) / N);

  const evalPoly = (coeffs: number[], x: number) => {
    let result = 0;
    for (const c of coeffs) result = result * x + c;
    return result / 1000;
  };

  const linearY = xs.map((x) => evalPoly(data.linear.coefficients, x));
  const polyY = xs.map((x) => evalPoly(data.polynomial.coefficients, x));

  return (
    <div>
      <InfoNote>
        Linear fit R² ={' '}
        <Mono style={{ color: colors.text, fontWeight: 600 }}>
          {data.linear.rSquared.toFixed(3)}
        </Mono>{' '}
        · polynomial degree {data.polynomial.degree} R² ={' '}
        <Mono style={{ color: colors.text, fontWeight: 600 }}>
          {data.polynomial.rSquared.toFixed(3)}
        </Mono>{' '}
        · chosen:{' '}
        <Mono
          style={{
            color: colors.accent,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
          }}
        >
          {data.chosen}
        </Mono>
      </InfoNote>
      <Plot
        data={
          [
            {
              x: lapNumbers,
              y: times,
              type: 'scatter' as const,
              mode: 'markers' as const,
              name: 'Valid laps',
              marker: {
                color: colors.text,
                size: 7,
                line: { color: colors.bg, width: 1 },
              },
            },
            {
              x: xs,
              y: linearY,
              type: 'scatter' as const,
              mode: 'lines' as const,
              name: `Lineal (R² ${data.linear.rSquared.toFixed(2)})`,
              line: { color: colors.accent, width: 2, dash: 'dot' as const },
            },
            {
              x: xs,
              y: polyY,
              type: 'scatter' as const,
              mode: 'lines' as const,
              name: `Polynomial d${data.polynomial.degree} (R² ${data.polynomial.rSquared.toFixed(2)})`,
              line: { color: colors.purple, width: 2.5 },
            },
          ] as never
        }
        layout={
          apexPlotlyLayout({
            height: 360,
            margin: { l: 50, r: 14, t: 10, b: 50 },
            xaxis: {
              ...(apexPlotlyLayout().xaxis as object),
              title: {
                text: 'Lap',
                font: { family: fonts.mono, size: 10, color: colors.textMute },
              },
              dtick: 1,
            },
            yaxis: {
              ...(apexPlotlyLayout().yaxis as object),
              title: {
                text: 'Seconds',
                font: { family: fonts.mono, size: 10, color: colors.textMute },
              },
            },
            showlegend: true,
            legend: {
              orientation: 'h' as const,
              y: -0.2,
              font: { family: fonts.mono, size: 10, color: colors.textDim },
            },
          }) as never
        }
        useResizeHandler
        style={{ width: '100%', height: 360 }}
        config={apexPlotlyConfig as never}
      />
    </div>
  );
};

/* ─── Table helper ────────────────────────────────────────────────────── */

function TD({
  children,
  align = 'left',
  mono,
  bold,
  color,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  bold?: boolean;
  color?: string;
}) {
  return (
    <td
      style={{
        textAlign: align,
        padding: '8px 12px',
        borderBottom: `1px solid ${colors.border}`,
        fontFamily: mono ? fonts.mono : fonts.sans,
        fontSize: 12,
        color: color ?? colors.text,
        fontWeight: bold ? 600 : 500,
        fontVariantNumeric: mono ? 'tabular-nums' : undefined,
      }}
    >
      {children}
    </td>
  );
}

export default AdvancedAnalytics;
