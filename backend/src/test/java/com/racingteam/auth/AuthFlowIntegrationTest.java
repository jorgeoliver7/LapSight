package com.racingteam.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.racingteam.RacingTeamManagementApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;

import com.racingteam.service.PythonAnalyticsClient;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = RacingTeamManagementApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("integration-test")
@Testcontainers
class AuthFlowIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @DynamicPropertySource
    static void overrideProps(DynamicPropertyRegistry registry) {
        // JWT secret válido (base64 de >32 bytes) para tests
        registry.add("spring.security.jwt.secret",
                () -> "dGVzdC1qd3Qtc2VjcmV0LWZvci10ZXN0cy1vbmx5LW5vdC1mb3ItcHJvZHVjdGlvbi11c2U=");
        registry.add("spring.security.jwt.expiration", () -> "3600000");
        registry.add("app.cors.allowed-origins", () -> "http://localhost:3000");
        registry.add("app.analytics.python-url", () -> "http://localhost:0"); // no usado en estos tests
        registry.add("app.analytics.timeout-ms", () -> "1000");
        registry.add("app.seed.demo-data", () -> "false");
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    // El cliente Python no es relevante para estos tests; lo mockeamos para que el contexto cargue
    @MockBean
    PythonAnalyticsClient pythonAnalyticsClient;

    @Value("${app.seed.admin-email}")
    String adminEmail;

    @Value("${app.seed.admin-password}")
    String adminPassword;

    @Test
    void loginWithSeededAdminReturnsToken() throws Exception {
        String body = json.writeValueAsString(Map.of(
                "email", adminEmail,
                "password", adminPassword
        ));
        mvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(notNullValue()))
                .andExpect(jsonPath("$.user.email").value(adminEmail))
                .andExpect(jsonPath("$.user.role").value("MANAGER"));
    }

    @Test
    void loginWithBadCredentialsReturns401() throws Exception {
        String body = json.writeValueAsString(Map.of(
                "email", adminEmail,
                "password", "wrong-password"
        ));
        mvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointWithoutTokenReturns401Or403() throws Exception {
        mvc.perform(get("/teams"))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s != 401 && s != 403) {
                        throw new AssertionError("Expected 401 or 403 but got " + s);
                    }
                });
    }

    @Test
    void meEndpointWithValidTokenReturnsUser() throws Exception {
        String loginBody = json.writeValueAsString(Map.of(
                "email", adminEmail, "password", adminPassword));
        String response = mvc.perform(post("/auth/login")
                        .contentType("application/json")
                        .content(loginBody))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String token = json.readTree(response).get("token").asText();

        mvc.perform(get("/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(adminEmail));
    }
}
