package com.aicaptioneditor.modules.auth.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.model.RefreshToken;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RefreshTokenServiceTest {

    private RefreshTokenRepository refreshTokenRepository;
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenRepository = mock(RefreshTokenRepository.class);
        refreshTokenService = new RefreshTokenService(refreshTokenRepository);
        ReflectionTestUtils.setField(refreshTokenService, "refreshExpirationMs", 604800000L); // 7 days
    }

    @Test
    void testFindByToken() {
        String tokenStr = "token_123";
        RefreshToken mockToken = new RefreshToken();
        when(refreshTokenRepository.findByToken(tokenStr)).thenReturn(Optional.of(mockToken));

        Optional<RefreshToken> result = refreshTokenService.findByToken(tokenStr);
        assertTrue(result.isPresent());
        assertEquals(mockToken, result.get());
    }

    @Test
    void testCreateRefreshToken() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .build();

        RefreshToken savedToken = RefreshToken.builder()
                .token("random_uuid")
                .user(user)
                .expiryDate(Instant.now().plusSeconds(3600))
                .build();

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(savedToken);

        RefreshToken result = refreshTokenService.createRefreshToken(user);

        assertNotNull(result);
        assertEquals("random_uuid", result.getToken());
        verify(refreshTokenRepository, times(1)).deleteByUser(user);
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    void testVerifyExpirationValid() {
        RefreshToken token = RefreshToken.builder()
                .token("token_123")
                .expiryDate(Instant.now().plusSeconds(60))
                .build();

        RefreshToken result = refreshTokenService.verifyExpiration(token);
        assertEquals(token, result);
    }

    @Test
    void testVerifyExpirationExpired() {
        RefreshToken token = RefreshToken.builder()
                .token("token_123")
                .expiryDate(Instant.now().minusSeconds(60))
                .build();

        ApiException exception = assertThrows(ApiException.class, () -> {
            refreshTokenService.verifyExpiration(token);
        });

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatus());
        verify(refreshTokenRepository, times(1)).delete(token);
    }

    @Test
    void testDeleteByToken() {
        String tokenStr = "token_123";
        refreshTokenService.deleteByToken(tokenStr);
        verify(refreshTokenRepository, times(1)).deleteByToken(tokenStr);
    }

    @Test
    void testDeleteByUser() {
        User user = new User();
        refreshTokenService.deleteByUser(user);
        verify(refreshTokenRepository, times(1)).deleteByUser(user);
    }
}
