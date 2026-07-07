package com.aicaptioneditor.modules.auth.service;

import com.aicaptioneditor.modules.auth.dto.*;
import com.aicaptioneditor.modules.auth.model.RefreshToken;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.auth.repository.UserRepository;
import com.aicaptioneditor.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("localAuthService")
@RequiredArgsConstructor
@Slf4j
public class LocalAuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email address is already in use", HttpStatus.BAD_REQUEST);
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .plan(UserPlan.free)
                .build();

        User savedUser = userRepository.save(user);
        
        String accessToken = jwtService.generateToken(savedUser);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);

        return buildAuthResponse(savedUser, accessToken, refreshToken.getToken());
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return buildAuthResponse(user, accessToken, refreshToken.getToken());
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken token = refreshTokenService.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new ApiException("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED));

        refreshTokenService.verifyExpiration(token);
        
        User user = token.getUser();
        
        // Token Rotation: Generate new tokens and delete the old one
        String newAccessToken = jwtService.generateToken(user);
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);
        
        return buildAuthResponse(user, newAccessToken, newRefreshToken.getToken());
    }

    @Override
    @Transactional
    public void logout(RefreshRequest request) {
        refreshTokenService.deleteByToken(request.getRefreshToken());
    }

    @Override
    public UserResponse getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ApiException("User is not authenticated", HttpStatus.UNAUTHORIZED);
        }
        return mapToUserResponse(user);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getExpirationMs() / 1000) // Convert to seconds
                .user(mapToUserResponse(user))
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .plan(user.getPlan())
                .build();
    }
}
