package com.aicaptioneditor.modules.user.controller;

import com.aicaptioneditor.common.api.ApiResponse;
import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.user.dto.UserResponseDto;
import com.aicaptioneditor.modules.user.dto.UserUpdateRequest;
import com.aicaptioneditor.modules.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Endpoints for current user profile retrieval, updates, and account deletion")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile", description = "Retrieves profile details of the currently authenticated user")
    public ApiResponse<UserResponseDto> getProfile(@AuthenticationPrincipal User principal) {
        validateAuthentication(principal);
        UserResponseDto responseDto = userService.getCurrentUserProfile(principal);
        return ApiResponse.success("User profile retrieved successfully", responseDto);
    }

    @PatchMapping("/me")
    @Operation(summary = "Update current authenticated user profile", description = "Partially updates profile details of the currently authenticated user")
    public ApiResponse<UserResponseDto> updateProfile(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        validateAuthentication(principal);
        UserResponseDto responseDto = userService.updateCurrentUserProfile(principal, request);
        return ApiResponse.success("User profile updated successfully", responseDto);
    }

    @DeleteMapping("/me")
    @Operation(summary = "Delete current authenticated user profile", description = "Deletes the currently authenticated user profile and all associated data")
    public ApiResponse<Void> deleteProfile(@AuthenticationPrincipal User principal) {
        validateAuthentication(principal);
        userService.deleteCurrentUser(principal);
        return ApiResponse.success("User profile deleted successfully", null);
    }

    private void validateAuthentication(User principal) {
        if (principal == null) {
            throw new ApiException("User is not authenticated", HttpStatus.UNAUTHORIZED);
        }
    }
}
