package com.racingteam.service;

/**
 * Conversión de tiempos string ↔ milisegundos.
 *
 * Acepta formatos:
 *   "1:23.456"     → minutos:segundos.milis
 *   "0:01:23.456"  → horas:minutos:segundos.milis
 *   "83.456"       → segundos (con decimal)
 *   "83456"        → milisegundos (entero sin decimal y >9999)
 *   "83,456"       → admite coma como separador decimal
 */
public final class LapTimeFormatter {

    private LapTimeFormatter() {}

    public static Long parseToMs(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) return null;
        try {
            if (trimmed.contains(":")) {
                String[] parts = trimmed.split(":");
                double seconds = 0;
                for (String part : parts) {
                    seconds = seconds * 60 + Double.parseDouble(part.replace(',', '.'));
                }
                return Math.round(seconds * 1000);
            }
            double val = Double.parseDouble(trimmed.replace(',', '.'));
            // Si tiene decimal o val <= 9999, se interpreta como segundos
            if (trimmed.contains(".") || trimmed.contains(",") || val <= 9999) {
                return Math.round(val * 1000);
            }
            return (long) val;
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
