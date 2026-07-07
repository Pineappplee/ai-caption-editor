package com.aicaptioneditor.modules.auth.config;

import com.aicaptioneditor.modules.auth.service.TokenVerifier;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenVerifier tokenVerifier;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        try {
            Authentication authentication = tokenVerifier.verifyToken(jwt);
            if (authentication != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("User successfully authenticated via token: {}", authentication.getName());
            }
        } catch (Exception e) {
            log.warn("Token authentication failed: {}", e.getMessage());
            // Since route guards are not implemented yet, we do not block the chain here.
            // Protected endpoints (like /api/v1/auth/me) will check if authentication is null.
        }
        
        filterChain.doFilter(request, response);
    }
}
