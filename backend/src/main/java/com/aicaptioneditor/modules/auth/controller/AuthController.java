package com.aicaptioneditor.modules.auth.controller;

import com.aicaptioneditor.modules.auth.dto.*;
import com.aicaptioneditor.modules.auth.service.AuthService;
import com.aicaptioneditor.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, login, token refresh, logout, and profile retrieval")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account and returns JWT access and refresh tokens (only available for local auth provider)")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.success("User registered successfully", response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates a user and returns JWT access and refresh tokens (only available for local auth provider)")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.success("User logged in successfully", response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Uses a refresh token to generate a new access token and a rotated refresh token (only available for local auth provider)")
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        AuthResponse response = authService.refresh(request);
        return ApiResponse.success("Token refreshed successfully", response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Invalidates the user's refresh token (only available for local auth provider)")
    public ApiResponse<Void> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request);
        SecurityContextHolder.clearContext();
        return ApiResponse.success("User logged out successfully", null);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Retrieves the profile of the currently logged-in user (works with both local and Firebase providers)")
    public ApiResponse<UserResponse> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserResponse response = authService.getCurrentUser(authentication);
        return ApiResponse.success("User profile retrieved successfully", response);
    }
}
