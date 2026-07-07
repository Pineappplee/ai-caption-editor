package com.aicaptioneditor.modules.user.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.repository.UserRepository;
import com.aicaptioneditor.modules.user.dto.UserResponseDto;
import com.aicaptioneditor.modules.user.dto.UserUpdateRequest;
import com.aicaptioneditor.modules.user.mapper.UserMapper;
import com.aicaptioneditor.modules.user.provider.UserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private UserProvider userProvider;

    @InjectMocks
    private UserServiceImpl userService;

    private User mockUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        mockUser = User.builder()
                .id(userId)
                .name("John Doe")
                .email("john@example.com")
                .build();
    }

    @Test
    void getCurrentUserProfile_ShouldReturnUserProfile_WhenUserExists() {
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        
        UserResponseDto mockResponse = UserResponseDto.builder()
                .id(userId)
                .name("John Doe")
                .email("john@example.com")
                .build();
        Mockito.when(userMapper.toResponseDto(mockUser)).thenReturn(mockResponse);

        UserResponseDto result = userService.getCurrentUserProfile(mockUser);

        assertNotNull(result);
        assertEquals(userId, result.getId());
        assertEquals("john@example.com", result.getEmail());
    }

    @Test
    void getCurrentUserProfile_ShouldThrowNotFound_WhenUserDoesNotExist() {
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () ->
                userService.getCurrentUserProfile(mockUser)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        assertEquals("User profile not found", exception.getMessage());
    }

    @Test
    void updateCurrentUserProfile_ShouldUpdateAndReturnProfile_WhenUserExists() {
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        
        UserUpdateRequest request = new UserUpdateRequest();
        request.setName("John Updated");

        Mockito.doNothing().when(userMapper).updateEntityFromRequest(request, mockUser);
        Mockito.when(userRepository.save(mockUser)).thenReturn(mockUser);
        
        UserResponseDto mockResponse = UserResponseDto.builder()
                .id(userId)
                .name("John Updated")
                .email("john@example.com")
                .build();
        Mockito.when(userMapper.toResponseDto(mockUser)).thenReturn(mockResponse);

        UserResponseDto result = userService.updateCurrentUserProfile(mockUser, request);

        assertNotNull(result);
        assertEquals("John Updated", result.getName());
    }

    @Test
    void deleteCurrentUser_ShouldCallDeleteAndProvider_WhenUserExists() {
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        Mockito.doNothing().when(userProvider).onDeleteUser(mockUser);
        Mockito.doNothing().when(userRepository).delete(mockUser);

        assertDoesNotThrow(() -> userService.deleteCurrentUser(mockUser));

        Mockito.verify(userProvider, Mockito.times(1)).onDeleteUser(mockUser);
        Mockito.verify(userRepository, Mockito.times(1)).delete(mockUser);
    }
}
