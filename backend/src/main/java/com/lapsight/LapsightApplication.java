package com.lapsight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class LapsightApplication {

    public static void main(String[] args) {
        SpringApplication.run(LapsightApplication.class, args);
    }
}
