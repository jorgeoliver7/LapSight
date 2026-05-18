package com.racingteam.service;

import com.racingteam.model.LapTime;
import com.racingteam.model.TireCompound;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
 * Reconoce columnas (case-insensitive, varios alias). Detecta automáticamente
 * formatos populares y los registra en log:
 *
 *   - GENERIC: cabecera tipo lap, time, s1, s2, s3...
 *   - IRACING: cabecera con "Lap Time", "Lap Delta", "Best Split N"
 *   - MYLAPS:  cabecera de Speedhive con "Sector 1/2/3" o "Gap to Best"
 *
 * Alias soportados:
 *   lap        lap | lap_number | lapnumber | vuelta | n | lap #
 *   time       time | lap_time | lap time | laptime | tiempo | best time
 *   s1..s3     sN | sectorN | sector_N | sector N | best split N | split N
 *   valid      valid | validez | ok
 *   compound   compound | tyre | tire | neumatico | neumático
 *   fuel       fuel | fuel_kg | combustible
 *   notes      notes | notas | comment
 *
 * Ignora columnas extra (driver, team, position, gap, kph, etc.).
 *
 * Tiempos admiten: "1:23.456", "83.456", "83456" (ms), "0:01:23.456".
 * Separador: `,` o `;` (autodetectado).
 */
@Component
public class LapCsvParser {

    private static final Logger log = LoggerFactory.getLogger(LapCsvParser.class);

    private enum CsvFormat { GENERIC, IRACING, MYLAPS, AIM, MOTEC, RACECHRONO, APEX_PRO, HARRYS }

    private static final Map<String, String> ALIASES = new HashMap<>();
    static {
        // Lap number
        for (String s : new String[]{
                "lap", "lap_number", "lapnumber", "vuelta", "n", "lap #", "lap#",
                "lap nr", "lap no", "lap no.", "#", "position"
        }) ALIASES.put(s, "lap");

        // Lap time
        for (String s : new String[]{
                "time", "lap_time", "lap time", "laptime", "tiempo", "best time", "lap time(s)",
                "lap time [s]", "lap time (s)", "laptime [s]", "best lap time",
                "total time", "current time"
        }) ALIASES.put(s, "time");

        // Sector 1
        for (String s : new String[]{
                "s1", "sector1", "sector_1", "sector 1", "best split 1", "split 1",
                "sect.1", "sect. 1", "sect 1", "sector1 time", "sector 1 [s]", "s1 [s]",
                "best sector 1", "best s1"
        }) ALIASES.put(s, "s1");

        // Sector 2
        for (String s : new String[]{
                "s2", "sector2", "sector_2", "sector 2", "best split 2", "split 2",
                "sect.2", "sect. 2", "sect 2", "sector2 time", "sector 2 [s]", "s2 [s]",
                "best sector 2", "best s2"
        }) ALIASES.put(s, "s2");

        // Sector 3
        for (String s : new String[]{
                "s3", "sector3", "sector_3", "sector 3", "best split 3", "split 3",
                "sect.3", "sect. 3", "sect 3", "sector3 time", "sector 3 [s]", "s3 [s]",
                "best sector 3", "best s3"
        }) ALIASES.put(s, "s3");

        for (String s : new String[]{"valid", "validez", "ok", "valid lap"}) ALIASES.put(s, "valid");
        for (String s : new String[]{"compound", "tyre", "tire", "neumatico", "neumático", "compound type"}) ALIASES.put(s, "compound");
        for (String s : new String[]{"fuel", "fuel_kg", "combustible", "fuel [kg]", "fuel_load"}) ALIASES.put(s, "fuel");
        for (String s : new String[]{"notes", "notas", "comment", "comments", "remark"}) ALIASES.put(s, "notes");
    }

    /**
     * Detecta el formato del CSV mirando las cabeceras. Útil para logs y para
     * un futuro routing a parsers específicos. Devuelve GENERIC si no hay indicios claros.
     */
    private static CsvFormat detectFormat(String headerLine) {
        String lower = headerLine.toLowerCase(Locale.ROOT);
        if (lower.contains("lap delta") || lower.contains("best split")) return CsvFormat.IRACING;
        if (lower.contains("transponder") || lower.contains("gap to best") || lower.contains("gap to leader")) return CsvFormat.MYLAPS;
        if (lower.contains("sect.") || lower.contains("race studio")) return CsvFormat.AIM;
        if (lower.contains("[s]") || lower.contains("motec")) return CsvFormat.MOTEC;
        if (lower.contains("avg speed") || lower.contains("racechrono")) return CsvFormat.RACECHRONO;
        if (lower.contains("best sector 1") && lower.contains("apex")) return CsvFormat.APEX_PRO;
        if (lower.contains("harry") || lower.contains("hlt")) return CsvFormat.HARRYS;
        return CsvFormat.GENERIC;
    }

    public List<LapTime> parse(InputStream input) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String headerLine = nextDataLine(reader);
            if (headerLine == null) {
                throw new IllegalArgumentException("CSV vacío");
            }

            char sep = detectSeparator(headerLine);
            CsvFormat format = detectFormat(headerLine);
            if (format != CsvFormat.GENERIC) {
                log.info("CSV: formato detectado = {}", format);
            }
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
