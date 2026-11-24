package com.cortex.invest.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Performance Monitoring & Latency Tracking Interceptor
 * Records response time for every API call and alerts on slow endpoints (>500ms).
 */
@Slf4j
@Component
public class ExecutionTimeLoggingInterceptor implements HandlerInterceptor {

    private static final String START_TIME_ATTR = "req_start_time_ms";
    private static final long SLOW_THRESHOLD_MS = 500;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START_TIME_ATTR, System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        Object startObj = request.getAttribute(START_TIME_ATTR);
        if (startObj instanceof Long startMs) {
            long duration = System.currentTimeMillis() - startMs;
            response.setHeader("X-Response-Time-Ms", String.valueOf(duration));

            if (duration > SLOW_THRESHOLD_MS) {
                log.warn("SLOW ENDPOINT DETECTED: {} {} completed in {} ms (Status: {})",
                        request.getMethod(), request.getRequestURI(), duration, response.getStatus());
            } else {
                log.debug("{} {} completed in {} ms", request.getMethod(), request.getRequestURI(), duration);
            }
        }
    }
}
