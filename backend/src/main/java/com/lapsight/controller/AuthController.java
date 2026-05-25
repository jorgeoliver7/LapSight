package com.lapsight.controller;

import com.lapsight.dto.UserDto;
import com.lapsight.dto.auth.AuthResponse;
import com.lapsight.dto.auth.LoginRequest;
import com.lapsight.dto.auth.RegisterRequest;
import com.lapsight.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final String COOKIE_NAME = "rtm-token";
    private static final String COOKIE_PATH = "/api";

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok()
                .headers(createAuthCookie(authResponse.getToken(), authResponse.getExpiresIn()))
                .body(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.ok()
                .headers(createAuthCookie(authResponse.getToken(), authResponse.getExpiresIn()))
                .body(authResponse);
    }

    @PostMapping("/demo")
    public ResponseEntity<AuthResponse> demo() {
        AuthResponse authResponse = authService.demoLogin();
        return ResponseEntity.ok()
                .headers(createAuthCookie(authResponse.getToken(), authResponse.getExpiresIn()))
                .body(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok()
                .headers(clearAuthCookie())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(authService.getCurrentUser(principal.getUsername()));
    }

    private HttpHeaders createAuthCookie(String token, long expiresIn) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from(COOKIE_NAME, token)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path(COOKIE_PATH)
                .maxAge(Duration.ofMillis(expiresIn))
                .build().toString());
        return headers;
    }

    private HttpHeaders clearAuthCookie() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path(COOKIE_PATH)
                .maxAge(0)
                .build().toString());
        return headers;
    }
}
