package com.cortex.invest.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-Memory Sliding-Window IP Rate Limiter
 * Guards institutional endpoints against automated DDoS and abuse while allowing generous capacity for normal user sessions.
 */
@Slf4j
@Component
public class RateLimitingInterceptor implements HandlerInterceptor {

    private static final int MAX_GENERAL_REQUESTS_PER_MINUTE = 180;
    private static final int MAX_AI_REQUESTS_PER_MINUTE = 40;

    private static class ClientCounter {
        long windowStartMs;
        AtomicInteger generalCount = new AtomicInteger(0);
        AtomicInteger aiCount = new AtomicInteger(0);

        ClientCounter(long now) {
            this.windowStartMs = now;
        }

        void resetIfExpired(long now) {
            if (now - windowStartMs > 60_000) {
                windowStartMs = now;
                generalCount.set(0);
                aiCount.set(0);
            }
        }
    }

    private final Map<String, ClientCounter> clients = new ConcurrentHashMap<>();

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Skip preflight OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String ip = getClientIp(request);
        long now = System.currentTimeMillis();

        ClientCounter counter = clients.computeIfAbsent(ip, k -> new ClientCounter(now));
        counter.resetIfExpired(now);

        String uri = request.getRequestURI();
        boolean isAiEndpoint = uri.contains("/ask-analyst") || uri.contains("/ai-analysis") || uri.contains("/discuss-stock");

        int limit = isAiEndpoint ? MAX_AI_REQUESTS_PER_MINUTE : MAX_GENERAL_REQUESTS_PER_MINUTE;
        int currentCount = isAiEndpoint ? counter.aiCount.incrementAndGet() : counter.generalCount.incrementAndGet();

        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, limit - currentCount)));

        if (currentCount > limit) {
            log.warn("Rate limit exceeded for client IP {} on URI {} ({}/{})", ip, uri, currentCount, limit);
            response.setStatus(429); // Too Many Requests
            response.setHeader("Retry-After", "60");
            response.setContentType("application/json");
            response.getWriter().write("""
                {
                  "status": 429,
                  "error": "Too Many Requests",
                  "message": "Rate limit threshold reached. Please wait 60 seconds before submitting further institutional requests.",
                  "retryAfterSeconds": 60
                }
                """);
            return false;
        }

        return true;
    }
}
