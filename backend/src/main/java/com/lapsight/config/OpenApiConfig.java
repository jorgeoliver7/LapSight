package com.lapsight.config;

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

                                REST API for telemetry analysis and lap-time statistics for
                                motorsport teams.

                                **Architecture**: Spring Boot 3.2 (this service) + Python FastAPI
                                microservice with pandas/scipy/sklearn for advanced analytics
                                (KMeans stints, IsolationForest anomalies, polynomial degradation
                                regression).

                                **Authentication**: JWT Bearer. Call `POST /auth/login` with your
                                credentials (or `POST /auth/demo` when demo mode is enabled via
                                APP_SEED_DEMO_DATA=true) to obtain a token, then click "Authorize"
                                at the top right to attach it to all calls.
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Jorge Oliver")
                                .email("jorge.acedo.oliver@gmail.com")
                                .url("https://github.com/jorgeoliver7/LapSight"))
                        .license(new License().name("MIT")))
                .addSecurityItem(new SecurityRequirement().addList(JWT_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(JWT_SCHEME, new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste the token returned by /auth/login here")));
    }
}
