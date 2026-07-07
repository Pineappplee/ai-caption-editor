package com.aicaptioneditor.modules.auth.service;

import com.aicaptioneditor.modules.auth.dto.*;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("firebaseAuthService")
public class FirebaseAuthServiceImpl implements AuthService {

    @Override
    public AuthResponse register(RegisterRequest request) {
        throw new ApiException(
                "Registration is handled client-side via Firebase SDK.",
                HttpStatus.METHOD_NOT_ALLOWED
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        throw new ApiException(
                "Login is handled client-side via Firebase SDK.",
                HttpStatus.METHOD_NOT_ALLOWED
        );
    }

    @Override
    public AuthResponse refresh(RefreshRequest request) {
        throw new ApiException(
                "Token refresh is handled client-side via Firebase SDK.",
                HttpStatus.METHOD_NOT_ALLOWED
        );
    }

    @Override
    public void logout(RefreshRequest request) {
        throw new ApiException(
                "Logout is handled client-side via Firebase SDK.",
                HttpStatus.METHOD_NOT_ALLOWED
        );
    }

    @Override
    public UserResponse getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ApiException("User is not authenticated", HttpStatus.UNAUTHORIZED);
        }
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .plan(user.getPlan())
                .build();
    }
}
