package com.aicaptioneditor.modules.auth.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.dto.*;
import com.aicaptioneditor.modules.auth.model.RefreshToken;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class LocalAuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private LocalAuthServiceImpl authService;

    private User mockUser;
    private UUID userId;
    private RefreshToken mockRefreshToken;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        mockUser = User.builder()
                .id(userId)
                .name("John Doe")
                .email("john@example.com")
                .passwordHash("hashed_password")
                .build();

        mockRefreshToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .token("refresh_token_123")
                .user(mockUser)
                .build();
    }

    @Test
    void register_ShouldSaveAndReturnTokens_WhenEmailIsUnique() {
        RegisterRequest request = RegisterRequest.builder()
                .name("John Doe")
                .email("john@example.com")
                .password("password123")
                .build();

        Mockito.when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        Mockito.when(passwordEncoder.encode(request.getPassword())).thenReturn("hashed_password");
        Mockito.when(userRepository.save(any(User.class))).thenReturn(mockUser);
        Mockito.when(jwtService.generateToken(any(User.class))).thenReturn("access_token");
        Mockito.when(refreshTokenService.createRefreshToken(any(User.class))).thenReturn(mockRefreshToken);
        Mockito.when(jwtService.getExpirationMs()).thenReturn(900000L);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
        assertEquals("refresh_token_123", response.getRefreshToken());
        assertEquals("john@example.com", response.getUser().getEmail());
    }

    @Test
    void register_ShouldThrowException_WhenEmailAlreadyExists() {
        RegisterRequest request = RegisterRequest.builder()
                .email("john@example.com")
                .build();

        Mockito.when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        ApiException exception = assertThrows(ApiException.class, () ->
                authService.register(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertEquals("Email address is already in use", exception.getMessage());
    }

    @Test
    void login_ShouldReturnTokens_WhenCredentialsAreValid() {
        LoginRequest request = LoginRequest.builder()
                .email("john@example.com")
                .password("password123")
                .build();

        Mockito.when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(mockUser));
        Mockito.when(passwordEncoder.matches(request.getPassword(), mockUser.getPasswordHash())).thenReturn(true);
        Mockito.when(jwtService.generateToken(mockUser)).thenReturn("access_token");
        Mockito.when(refreshTokenService.createRefreshToken(mockUser)).thenReturn(mockRefreshToken);
        Mockito.when(jwtService.getExpirationMs()).thenReturn(900000L);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("access_token", response.getAccessToken());
        assertEquals("john@example.com", response.getUser().getEmail());
    }

    @Test
    void login_ShouldThrowUnauthorized_WhenUserNotFound() {
        LoginRequest request = LoginRequest.builder()
                .email("nonexistent@example.com")
                .password("password123")
                .build();

        Mockito.when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () ->
                authService.login(request)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }

    @Test
    void refresh_ShouldRotateTokens_WhenTokenIsValid() {
        RefreshRequest request = new RefreshRequest("refresh_token_123");
        
        Mockito.when(refreshTokenService.findByToken(request.getRefreshToken())).thenReturn(Optional.of(mockRefreshToken));
        Mockito.when(refreshTokenService.verifyExpiration(mockRefreshToken)).thenReturn(mockRefreshToken);
        Mockito.when(jwtService.generateToken(mockUser)).thenReturn("new_access_token");
        
        RefreshToken newRefreshToken = RefreshToken.builder()
                .token("new_refresh_token_456")
                .user(mockUser)
                .build();
        Mockito.when(refreshTokenService.createRefreshToken(mockUser)).thenReturn(newRefreshToken);
        Mockito.when(jwtService.getExpirationMs()).thenReturn(900000L);

        AuthResponse response = authService.refresh(request);

        assertNotNull(response);
        assertEquals("new_access_token", response.getAccessToken());
        assertEquals("new_refresh_token_456", response.getRefreshToken());
    }

    @Test
    void logout_ShouldCallDeleteToken() {
        RefreshRequest request = new RefreshRequest("refresh_token_123");
        Mockito.doNothing().when(refreshTokenService).deleteByToken(request.getRefreshToken());

        assertDoesNotThrow(() -> authService.logout(request));
        
        Mockito.verify(refreshTokenService, Mockito.times(1)).deleteByToken(request.getRefreshToken());
    }

    @Test
    void getCurrentUser_ShouldReturnUserResponse_WhenAuthenticated() {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());

        UserResponse response = authService.getCurrentUser(authentication);

        assertNotNull(response);
        assertEquals("john@example.com", response.getEmail());
    }

    @Test
    void getCurrentUser_ShouldThrowUnauthorized_WhenNotAuthenticated() {
        ApiException exception = assertThrows(ApiException.class, () ->
                authService.getCurrentUser(null)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
    }
}
