package com.racingteam.service;

import com.racingteam.model.LapTime;
import com.racingteam.model.TireCompound;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LapCsvParserTest {

    private final LapCsvParser parser = new LapCsvParser();

    private List<LapTime> parse(String csv) throws IOException {
        return parser.parse(new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void parsesGenericCsvWithHeader() throws IOException {
        String csv = """
                lap,time,s1,s2,s3
                1,1:24.512,28.123,32.001,24.388
                2,1:19.234,26.011,29.541,23.682
                """;
        List<LapTime> laps = parse(csv);
        assertThat(laps).hasSize(2);
        assertThat(laps.get(0).getLapNumber()).isEqualTo(1);
        assertThat(laps.get(0).getLapTimeMs()).isEqualTo(84512L);
        assertThat(laps.get(0).getSector1Ms()).isEqualTo(28123L);
        assertThat(laps.get(1).getLapTimeMs()).isEqualTo(79234L);
    }

    @Test
    void parsesIRacingFormat() throws IOException {
        String csv = """
                "Lap","Lap Time","Lap Delta","Best Split 1","Best Split 2","Best Split 3"
                "1","1:24.512","+0.000","28.123","32.001","24.388"
                "2","1:19.234","-5.278","26.011","29.541","23.682"
                """;
        List<LapTime> laps = parse(csv);
        assertThat(laps).hasSize(2);
        assertThat(laps.get(0).getLapTimeMs()).isEqualTo(84512L);
        assertThat(laps.get(0).getSector1Ms()).isEqualTo(28123L);
        assertThat(laps.get(1).getSector3Ms()).isEqualTo(23682L);
    }

    @Test
    void parsesMyLapsFormat() throws IOException {
        String csv = """
                Lap,Time,Sector 1,Sector 2,Sector 3,Gap to Best
                1,1:24.512,28.123,32.001,24.388,+6.291
                2,1:19.234,26.011,29.541,23.682,+1.013
                """;
        List<LapTime> laps = parse(csv);
        assertThat(laps).hasSize(2);
        assertThat(laps.get(0).getSector1Ms()).isEqualTo(28123L);
        assertThat(laps.get(1).getLapTimeMs()).isEqualTo(79234L);
    }

    @Test
    void detectsSemicolonSeparator() throws IOException {
        String csv = """
                lap;time;s1;s2;s3
                1;1:24,512;28,123;32,001;24,388
                """;
        List<LapTime> laps = parse(csv);
        assertThat(laps).hasSize(1);
        assertThat(laps.get(0).getLapTimeMs()).isEqualTo(84512L);
    }

    @Test
    void ignoresCommentLines() throws IOException {
        String csv = """
                # Comentario
                # Otra línea
                lap,time
                1,1:23.456
                2,1:22.789
                """;
        List<LapTime> laps = parse(csv);
        assertThat(laps).hasSize(2);
    }

    @Test
    void readsCompoundField() throws IOException {
        String csv = """
                lap,time,compound
                1,1:23.456,SOFT
                2,1:22.789,MEDIUM
                """;
        List<LapTime> laps = parse(csv);
        assertThat(laps.get(0).getCompound()).isEqualTo(TireCompound.SOFT);
        assertThat(laps.get(1).getCompound()).isEqualTo(TireCompound.MEDIUM);
    }

    @Test
    void readsValidFlag() throws IOException {
        String csv = """
                lap,time,valid
                1,1:23.456,true
                2,1:22.789,false
                """;
        List<LapTime> laps = parse(csv);
        assertThat(laps.get(0).getValid()).isTrue();
        assertThat(laps.get(1).getValid()).isFalse();
    }

    @Test
    void parsesAimRaceStudioFormat() throws IOException {
        // AiM exporta con "Sect.1", "Sect.2", "Sect.3"
        String csv = """
                "Lap Number","Lap Time","Sect.1","Sect.2","Sect.3"
                "1","1:24.512","28.123","32.001","24.388"
                "2","1:19.234","26.011","29.541","23.682"
                """;
        List<LapTime> laps = parse(csv);
        assertThat(laps).hasSize(2);
        assertThat(laps.get(0).getSector1Ms()).isEqualTo(28123L);
        assertThat(laps.get(1).getLapTimeMs()).isEqualTo(79234L);
    }

    @Test
    void parsesMotecFormat() throws IOException {
        // MoTeC exporta segundos con [s] en las cabeceras
        String csv = """
                Lap Number,Lap Time [s],S1 [s],S2 [s],S3 [s]
                1,84.512,28.123,32.001,24.388
                2,79.234,26.011,29.541,23.682
                """;
        List<LapTime> laps = parse(csv);
        assertThat(laps).hasSize(2);
        assertThat(laps.get(0).getLapTimeMs()).isEqualTo(84512L);
        assertThat(laps.get(0).getSector1Ms()).isEqualTo(28123L);
    }

    @Test
    void parsesRaceChronoFormat() throws IOException {
        String csv = """
                Lap,Time,Sector 1,Sector 2,Sector 3,Distance,Avg Speed
                1,1:24.512,28.123,32.001,24.388,4.50,180.5
                2,1:19.234,26.011,29.541,23.682,4.50,191.2
                """;
        List<LapTime> laps = parse(csv);
        assertThat(laps).hasSize(2);
        // Distance y Avg Speed deben ignorarse (no son campos reconocidos)
        assertThat(laps.get(0).getSector2Ms()).isEqualTo(32001L);
    }

    @Test
    void parsesApexProFormat() throws IOException {
        String csv = """
                Lap,Lap Time,Best Sector 1,Best Sector 2,Best Sector 3
                1,1:24.512,28.123,32.001,24.388
                2,1:19.234,26.011,29.541,23.682
                """;
        List<LapTime> laps = parse(csv);
        assertThat(laps).hasSize(2);
        assertThat(laps.get(0).getSector1Ms()).isEqualTo(28123L);
    }

    @Test
    void throwsForEmptyCsv() {
        assertThatThrownBy(() -> parse("# only comments\n"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
