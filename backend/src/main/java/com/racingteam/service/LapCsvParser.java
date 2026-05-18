package com.racingteam.service;

import com.racingteam.model.LapTime;
import com.racingteam.model.TireCompound;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

/**
 * Parser CSV tolerante para tiempos por vuelta.
 *
 * Reconoce columnas (case-insensitive, varios alias):
 *   lap | lap_number | lapnumber | vuelta
 *   time | lap_time | laptime | tiempo
 *   s1 | sector1 | sector_1
 *   s2 | sector2 | sector_2
 *   s3 | sector3 | sector_3
 *   valid (true/false/1/0)
 *   compound | tyre | tire | neumatico
 *   fuel | fuel_kg | combustible
 *   notes | notas
 *
 * Tiempos admiten: "1:23.456", "83.456", "83456" (ms), "0:01:23.456".
 * Separador: `,` o `;` (autodetectado por la primera línea no vacía).
 */
@Component
public class LapCsvParser {

    private static final Map<String, String> ALIASES = new HashMap<>();
    static {
        for (String s : new String[]{"lap", "lap_number", "lapnumber", "vuelta", "n"}) ALIASES.put(s, "lap");
        for (String s : new String[]{"time", "lap_time", "laptime", "tiempo"}) ALIASES.put(s, "time");
        for (String s : new String[]{"s1", "sector1", "sector_1"}) ALIASES.put(s, "s1");
        for (String s : new String[]{"s2", "sector2", "sector_2"}) ALIASES.put(s, "s2");
        for (String s : new String[]{"s3", "sector3", "sector_3"}) ALIASES.put(s, "s3");
        for (String s : new String[]{"valid", "validez", "ok"}) ALIASES.put(s, "valid");
        for (String s : new String[]{"compound", "tyre", "tire", "neumatico", "neumático"}) ALIASES.put(s, "compound");
        for (String s : new String[]{"fuel", "fuel_kg", "combustible"}) ALIASES.put(s, "fuel");
        for (String s : new String[]{"notes", "notas", "comment"}) ALIASES.put(s, "notes");
    }

    public List<LapTime> parse(InputStream input) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String headerLine = nextDataLine(reader);
            if (headerLine == null) {
                throw new IllegalArgumentException("CSV vacío");
            }

            char sep = detectSeparator(headerLine);
            String[] headers = splitAndTrim(headerLine, sep);
            Map<String, Integer> colIndex = mapColumns(headers);

            // Si la primera línea no es header (no contiene texto reconocible), trátala como datos
            // con columnas por posición: lap, time, s1, s2, s3.
            boolean hasHeader = colIndex.containsKey("lap") || colIndex.containsKey("time");
            if (!hasHeader) {
                colIndex = positionalDefaults(headers.length);
                List<LapTime> laps = new ArrayList<>();
                laps.add(parseRow(headers, colIndex, 1));
                return readDataRows(reader, sep, colIndex, laps);
            }

            return readDataRows(reader, sep, colIndex, new ArrayList<>());
        }
    }

    private List<LapTime> readDataRows(BufferedReader reader, char sep,
                                       Map<String, Integer> colIndex,
                                       List<LapTime> initial) throws IOException {
        List<LapTime> laps = initial;
        int autoLap = laps.size() + 1;
        String line;
        while ((line = nextDataLine(reader)) != null) {
            String[] cells = splitAndTrim(line, sep);
            LapTime lap = parseRow(cells, colIndex, autoLap);
            laps.add(lap);
            autoLap = lap.getLapNumber() + 1;
        }
        if (laps.isEmpty()) {
            throw new IllegalArgumentException("CSV sin filas de datos");
        }
        return laps;
    }

    private Map<String, Integer> mapColumns(String[] headers) {
        Map<String, Integer> idx = new HashMap<>();
        for (int i = 0; i < headers.length; i++) {
            String key = ALIASES.get(headers[i].toLowerCase(Locale.ROOT).trim());
            if (key != null && !idx.containsKey(key)) {
                idx.put(key, i);
            }
        }
        return idx;
    }

    private Map<String, Integer> positionalDefaults(int columns) {
        Map<String, Integer> idx = new HashMap<>();
        String[] order = {"lap", "time", "s1", "s2", "s3"};
        for (int i = 0; i < Math.min(columns, order.length); i++) {
            idx.put(order[i], i);
        }
        return idx;
    }

    private LapTime parseRow(String[] cells, Map<String, Integer> colIndex, int autoLap) {
        Integer lapNumber = readInt(cells, colIndex.get("lap"));
        if (lapNumber == null) lapNumber = autoLap;

        Long timeMs = readTime(cells, colIndex.get("time"));
        if (timeMs == null) {
            throw new IllegalArgumentException("Vuelta " + lapNumber + ": falta el tiempo");
        }

        LapTime lap = new LapTime(lapNumber, timeMs);
        lap.setSector1Ms(readTime(cells, colIndex.get("s1")));
        lap.setSector2Ms(readTime(cells, colIndex.get("s2")));
        lap.setSector3Ms(readTime(cells, colIndex.get("s3")));
        lap.setValid(readBoolean(cells, colIndex.get("valid"), true));
        lap.setCompound(readCompound(cells, colIndex.get("compound")));
        lap.setFuelKg(readDecimal(cells, colIndex.get("fuel")));
        lap.setNotes(readString(cells, colIndex.get("notes")));
        return lap;
    }

    private String nextDataLine(BufferedReader reader) throws IOException {
        String line;
        while ((line = reader.readLine()) != null) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;
            return trimmed;
        }
        return null;
    }

    private char detectSeparator(String firstLine) {
        long commas = firstLine.chars().filter(c -> c == ',').count();
        long semicolons = firstLine.chars().filter(c -> c == ';').count();
        return semicolons > commas ? ';' : ',';
    }

    private String[] splitAndTrim(String line, char sep) {
        String[] parts = line.split(String.valueOf(sep), -1);
        for (int i = 0; i < parts.length; i++) {
            parts[i] = parts[i].trim().replace("\"", "");
        }
        return parts;
    }

    private Long readTime(String[] cells, Integer index) {
        return LapTimeFormatter.parseToMs(readString(cells, index));
    }

    private Integer readInt(String[] cells, Integer index) {
        String raw = readString(cells, index);
        if (raw == null) return null;
        try {
            return Integer.parseInt(raw);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private BigDecimal readDecimal(String[] cells, Integer index) {
        String raw = readString(cells, index);
        if (raw == null) return null;
        try {
            return new BigDecimal(raw.replace(',', '.'));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean readBoolean(String[] cells, Integer index, boolean defaultValue) {
        String raw = readString(cells, index);
        if (raw == null) return defaultValue;
        String lower = raw.toLowerCase(Locale.ROOT);
        if (Arrays.asList("0", "false", "no", "n", "invalid", "invalida", "inválida").contains(lower)) return false;
        if (Arrays.asList("1", "true", "yes", "y", "ok", "valid", "valida", "válida").contains(lower)) return true;
        return defaultValue;
    }

    private TireCompound readCompound(String[] cells, Integer index) {
        String raw = readString(cells, index);
        if (raw == null) return null;
        try {
            return TireCompound.valueOf(raw.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return TireCompound.UNKNOWN;
        }
    }

    private String readString(String[] cells, Integer index) {
        if (index == null || index >= cells.length) return null;
        String value = cells[index];
        if (Objects.toString(value, "").isBlank()) return null;
        return value;
    }
}
