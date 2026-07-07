package com.aicaptioneditor.modules.auth.service;

import com.aicaptioneditor.modules.auth.dto.*;
import org.springframework.security.core.Authentication;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshRequest request);
    void logout(RefreshRequest request);
    UserResponse getCurrentUser(Authentication authentication);
}
