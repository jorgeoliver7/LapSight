package com.racingteam.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String JWT_SCHEME = "bearer-jwt";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("LapSight API")
                        .description("""
                                **LapSight — See every lap.**

                                API REST de análisis de telemetría y estadística de tiempos por vuelta
                                para equipos de motorsport.

                                **Arquitectura**: Spring Boot 3.2 (este servicio) + microservicio Python FastAPI
                                con pandas/scipy/sklearn para análisis avanzado (stints KMeans, anomalías
                                IsolationForest, regresión polinómica de degradación).

                                **Autenticación**: JWT Bearer. Usa `POST /auth/login` con
                                `admin@racing.com / admin123` para obtener un token y pulsa el botón
                                "Authorize" arriba a la derecha para añadirlo a todas las llamadas.
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Jorge Oliver")
                                .email("jorge.acedo.oliver@gmail.com")
                                .url("https://github.com/jorgeoliver7/RacingTeamManagement"))
                        .license(new License().name("MIT")))
                .addSecurityItem(new SecurityRequirement().addList(JWT_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(JWT_SCHEME, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Pega aquí el token devuelto por /auth/login")));
    }
}
