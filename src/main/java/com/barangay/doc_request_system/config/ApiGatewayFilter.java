package com.barangay.doc_request_system.config;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class ApiGatewayFilter extends OncePerRequestFilter {

    // Simple In-Memory Token Bucket Rate Limiter per Client IP
    private final Map<String, ClientRateLimit> rateLimitMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_MINUTE = 10;

    private static class ClientRateLimit {
        int requestCount = 0;
        long windowStart = System.currentTimeMillis();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Gateway interceptor executes strictly on API paths (/api/**)
        if (path.startsWith("/api/")) {
            String clientIp = getClientIp(request);
            long currentTime = System.currentTimeMillis();

            // 1. Gateway Rate Limiting Logic
            ClientRateLimit rateLimit = rateLimitMap.computeIfAbsent(clientIp, k -> new ClientRateLimit());
            
            synchronized (rateLimit) {
                if (currentTime - rateLimit.windowStart > 60000) { // Reset window every 60 seconds
                    rateLimit.windowStart = currentTime;
                    rateLimit.requestCount = 0;
                }

                rateLimit.requestCount++;

                if (rateLimit.requestCount > MAX_REQUESTS_PER_MINUTE) {
                    System.err.println("🚨 API GATEWAY: Rate limit exceeded for Client IP: " + clientIp);
                    response.setStatus(429); // 429 Too Many Requests
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"API Gateway Rate Limit Exceeded. Try again in 1 minute.\"}");
                    return;
                }
            }

            // 2. Gateway Header Normalization & Audit Logging
            response.setHeader("X-API-Gateway", "Spring-Boot-InApp-Gateway-v1");
            response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(MAX_REQUESTS_PER_MINUTE - rateLimit.requestCount));

            System.out.println("🌐 [API GATEWAY ROUTE] " + request.getMethod() + " " + path + " | Client IP: " + clientIp);
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}