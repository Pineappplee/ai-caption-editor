package com.aicaptioneditor.modules.auth.service;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class LocalTokenVerifierTest {

    private JwtService jwtService;
    private UserRepository userRepository;
    private LocalTokenVerifier tokenVerifier;

    @BeforeEach
    void setUp() {
        jwtService = mock(JwtService.class);
        userRepository = mock(UserRepository.class);
        tokenVerifier = new LocalTokenVerifier(jwtService, userRepository);
    }

    @Test
    void testVerifyTokenSuccess() {
        String token = "valid_token";
        String email = "test@example.com";
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .name("Test User")
                .build();

        when(jwtService.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(jwtService.isTokenValid(token, user)).thenReturn(true);

        Authentication auth = tokenVerifier.verifyToken(token);
        assertNotNull(auth);
        assertEquals(user, auth.getPrincipal());
    }

    @Test
    void testVerifyTokenUserNotFound() {
        String token = "valid_token";
        String email = "test@example.com";

        when(jwtService.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            tokenVerifier.verifyToken(token);
        });
    }

    @Test
    void testVerifyTokenInvalid() {
        String token = "invalid_token";
        String email = "test@example.com";
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .name("Test User")
                .build();

        when(jwtService.extractEmail(token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(jwtService.isTokenValid(token, user)).thenReturn(false);

        Authentication auth = tokenVerifier.verifyToken(token);
        assertNull(auth);
    }

    @Test
    void testVerifyTokenNullEmail() {
        String token = "invalid_token";
        when(jwtService.extractEmail(token)).thenReturn(null);

        Authentication auth = tokenVerifier.verifyToken(token);
        assertNull(auth);
    }
}
