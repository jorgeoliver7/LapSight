package com.racingteam;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class RacingTeamManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(RacingTeamManagementApplication.class, args);
    }
}