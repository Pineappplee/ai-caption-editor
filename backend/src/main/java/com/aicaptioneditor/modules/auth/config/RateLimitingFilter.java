package com.aicaptioneditor.modules.auth.config;

import com.aicaptioneditor.common.api.ApiError;
import com.aicaptioneditor.common.api.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    // Configurable parameters
    private static final int BUCKET_CAPACITY = 100;
    private static final double REFILL_RATE_PER_SECOND = 10.0;
    private static final long REFILL_INTERVAL_NS = 1_000_000_000L; // 1 second

    private final Map<String, TokenBucket> ipBuckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Skip rate limiting for static endpoints if any, but apply to API routes
        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        TokenBucket bucket = ipBuckets.computeIfAbsent(clientIp, k -> new TokenBucket(BUCKET_CAPACITY));

        if (bucket.tryConsume()) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for IP: {} on URI: {}", clientIp, path);
            sendRateLimitError(response);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private void sendRateLimitError(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ApiError apiError = ApiError.builder()
                .code("TOO_MANY_REQUESTS")
                .message("Rate limit exceeded. Please check your request frequency.")
                .build();

        ApiResponse<ApiError> apiResponse = ApiResponse.error("Too many requests", apiError);
        byte[] body = objectMapper.writeValueAsBytes(apiResponse);
        response.getOutputStream().write(body);
    }

    private static class TokenBucket {
        private final double capacity;
        private double tokens;
        private long lastRefillTime;

        TokenBucket(double capacity) {
            this.capacity = capacity;
            this.tokens = capacity;
            this.lastRefillTime = System.nanoTime();
        }

        public synchronized boolean tryConsume() {
            refill();
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.nanoTime();
            long elapsed = now - lastRefillTime;
            if (elapsed > 0) {
                double deltaTokens = (elapsed * REFILL_RATE_PER_SECOND) / REFILL_INTERVAL_NS;
                if (deltaTokens > 0) {
                    tokens = Math.min(capacity, tokens + deltaTokens);
                    lastRefillTime = now;
                }
            }
        }
    }
}
