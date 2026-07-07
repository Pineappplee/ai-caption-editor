package com.aicaptioneditor.modules.auth.service;

import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.auth.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "dGhpcy1pcy1hLXNlY3VyZS1kZXYtc2VjcmV0LWZvci1haS1jYXB0aW9uLWVkaXRvci1iYWNrZW5kLXByb2plY3Q=");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 900000L); // 15 mins
    }

    @Test
    void testGenerateAndValidateToken() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .name("Test User")
                .email("test@example.com")
                .plan(UserPlan.free)
                .build();

        String token = jwtService.generateToken(user);
        assertNotNull(token);

        assertEquals("test@example.com", jwtService.extractEmail(token));
        assertEquals(900000L, jwtService.getExpirationMs());

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("test@example.com");

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void testInvalidUserToken() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .name("Test User")
                .email("test@example.com")
                .plan(UserPlan.free)
                .build();

        String token = jwtService.generateToken(user);

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("other@example.com");

        assertFalse(jwtService.isTokenValid(token, userDetails));
    }
}
