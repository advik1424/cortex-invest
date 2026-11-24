package com.cortex.invest;

import com.cortex.invest.config.RateLimitingInterceptor;
import com.cortex.invest.config.SecurityHeadersFilter;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

public class RateLimiterSecurityTest {

    private RateLimitingInterceptor rateLimitingInterceptor;
    private SecurityHeadersFilter securityHeadersFilter;

    @BeforeEach
    void setUp() {
        rateLimitingInterceptor = new RateLimitingInterceptor();
        securityHeadersFilter = new SecurityHeadersFilter();
    }

    @Test
    void testSecurityHeadersInjected() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/market/intelligence");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        securityHeadersFilter.doFilter(request, response, chain);

        Assertions.assertEquals("nosniff", response.getHeader("X-Content-Type-Options"));
        Assertions.assertEquals("SAMEORIGIN", response.getHeader("X-Frame-Options"));
        Assertions.assertEquals("1; mode=block", response.getHeader("X-XSS-Protection"));
        Assertions.assertEquals("strict-origin-when-cross-origin", response.getHeader("Referrer-Policy"));
        Assertions.assertTrue(response.getHeader("Strict-Transport-Security").contains("max-age=31536000"));
    }

    @Test
    void testRateLimiterGeneralEndpointsAllowNormalTraffic() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/radar/summary");
        request.setRemoteAddr("192.168.1.100");

        for (int i = 0; i < 50; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            boolean allowed = rateLimitingInterceptor.preHandle(request, response, new Object());
            Assertions.assertTrue(allowed, "Request " + i + " should be allowed under 180 req/min limit");
            Assertions.assertNotNull(response.getHeader("X-RateLimit-Remaining"));
        }
    }

    @Test
    void testRateLimiterAiEndpointsBlockAbuse() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/screener/ask-analyst");
        request.setRemoteAddr("10.0.0.50");

        // First 40 should pass
        for (int i = 0; i < 40; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            boolean allowed = rateLimitingInterceptor.preHandle(request, response, new Object());
            Assertions.assertTrue(allowed, "AI request " + i + " should be within 40 req/min limit");
        }

        // 41st should be blocked with HTTP 429
        MockHttpServletResponse response = new MockHttpServletResponse();
        boolean allowed = rateLimitingInterceptor.preHandle(request, response, new Object());
        Assertions.assertFalse(allowed, "AI request exceeding limit must be blocked");
        Assertions.assertEquals(429, response.getStatus(), "Should return HTTP 429 Too Many Requests");
        Assertions.assertEquals("60", response.getHeader("Retry-After"));
    }
}
