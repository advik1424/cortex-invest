package com.cortex.invest.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Institutional Security Headers Filter
 * Guarantees hardened HTTP response headers for protection against XSS, clickjacking, and MIME sniffing.
 */
@Component
@Order(1)
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (response instanceof HttpServletResponse httpServletResponse) {
            httpServletResponse.setHeader("X-Content-Type-Options", "nosniff");
            httpServletResponse.setHeader("X-Frame-Options", "SAMEORIGIN");
            httpServletResponse.setHeader("X-XSS-Protection", "1; mode=block");
            httpServletResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            httpServletResponse.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
            httpServletResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        }
        chain.doFilter(request, response);
    }
}
