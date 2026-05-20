package com.lapsight.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LapTimeFormatterTest {

    @Test
    void parsesMinutesSecondsMillis() {
        assertThat(LapTimeFormatter.parseToMs("1:23.456")).isEqualTo(83456L);
    }

    @Test
    void parsesHoursMinutesSeconds() {
        assertThat(LapTimeFormatter.parseToMs("0:01:23.456")).isEqualTo(83456L);
    }

    @Test
    void parsesPlainSecondsWithDecimal() {
        assertThat(LapTimeFormatter.parseToMs("83.456")).isEqualTo(83456L);
    }

    @Test
    void parsesRawMillisecondsWhenBigInteger() {
        // 83456 sin decimal y >9999 → interpretado como ms directos
        assertThat(LapTimeFormatter.parseToMs("83456")).isEqualTo(83456L);
    }

    @Test
    void parsesSmallIntegerAsSeconds() {
        // 80 sin decimal pero <=9999 → segundos
        assertThat(LapTimeFormatter.parseToMs("80")).isEqualTo(80000L);
    }

    @Test
    void acceptsCommaAsDecimalSeparator() {
        assertThat(LapTimeFormatter.parseToMs("1:23,456")).isEqualTo(83456L);
        assertThat(LapTimeFormatter.parseToMs("83,456")).isEqualTo(83456L);
    }

    @Test
    void returnsNullForBlankOrInvalid() {
        assertThat(LapTimeFormatter.parseToMs(null)).isNull();
        assertThat(LapTimeFormatter.parseToMs("")).isNull();
        assertThat(LapTimeFormatter.parseToMs("  ")).isNull();
        assertThat(LapTimeFormatter.parseToMs("abc")).isNull();
    }
}
