package com.lapsight.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Sliding-window rate limiter para endpoints de /auth.
 * Memoria local (no Redis) — suficiente para portfolio / instancia única.
 * Si en algún momento se despliega multi-réplica, sustituir por bucket4j+Redis.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private final int maxRequests;
    private final long windowMillis;
    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    public AuthRateLimitFilter(
            @Value("${app.rate-limit.auth.max-requests:10}") int maxRequests,
            @Value("${app.rate-limit.auth.window-seconds:60}") long windowSeconds
    ) {
        this.maxRequests = maxRequests;
        this.windowMillis = windowSeconds * 1000L;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Aplica solo a login y register
        return !(path.endsWith("/auth/login") || path.endsWith("/auth/register"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String key = clientKey(request) + ":" + request.getRequestURI();
        long now = Instant.now().toEpochMilli();
        long cutoff = now - windowMillis;

        Deque<Long> bucket = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (bucket) {
            while (!bucket.isEmpty() && bucket.peekFirst() < cutoff) {
                bucket.pollFirst();
            }
            if (bucket.size() >= maxRequests) {
                long retryAfterSec = Math.max(1, (windowMillis - (now - bucket.peekFirst())) / 1000);
                response.setStatus(429); // HTTP 429 Too Many Requests
                response.setHeader("Retry-After", String.valueOf(retryAfterSec));
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"message\":\"Demasiadas peticiones. Reintenta en " + retryAfterSec + "s\"}"
                );
                return;
            }
            bucket.addLast(now);
        }

        filterChain.doFilter(request, response);
    }

    private String clientKey(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
