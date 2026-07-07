package com.aicaptioneditor.modules.user.controller;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.user.dto.UserResponseDto;
import com.aicaptioneditor.modules.user.dto.UserUpdateRequest;
import com.aicaptioneditor.modules.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private User mockUser;
    private UsernamePasswordAuthenticationToken mockAuth;
    private UserResponseDto mockResponseDto;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        mockUser = User.builder()
                .id(userId)
                .name("Jane Doe")
                .email("jane@example.com")
                .avatarUrl("https://example.com/avatar.png")
                .bio("Software developer")
                .plan(UserPlan.free)
                .build();

        mockAuth = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());

        mockResponseDto = UserResponseDto.builder()
                .id(userId)
                .name("Jane Doe")
                .email("jane@example.com")
                .avatarUrl("https://example.com/avatar.png")
                .bio("Software developer")
                .plan(UserPlan.free)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    void getProfile_ShouldReturnProfile_WhenAuthenticated() throws Exception {
        Mockito.when(userService.getCurrentUserProfile(any(User.class))).thenReturn(mockResponseDto);

        mockMvc.perform(get("/api/v1/users/me").with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User profile retrieved successfully"))
                .andExpect(jsonPath("$.data.email").value("jane@example.com"))
                .andExpect(jsonPath("$.data.bio").value("Software developer"));
    }

    @Test
    void getProfile_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Authentication failed"))
                .andExpect(jsonPath("$.data.code").value("UNAUTHORIZED"));
    }

    @Test
    void updateProfile_ShouldReturnUpdatedProfile_WhenRequestIsValid() throws Exception {
        UserUpdateRequest updateRequest = UserUpdateRequest.builder()
                .name("Jane Smith")
                .bio("Senior developer")
                .build();

        UserResponseDto updatedResponse = UserResponseDto.builder()
                .id(mockUser.getId())
                .name("Jane Smith")
                .email("jane@example.com")
                .avatarUrl("https://example.com/avatar.png")
                .bio("Senior developer")
                .plan(UserPlan.free)
                .createdAt(mockResponseDto.getCreatedAt())
                .updatedAt(Instant.now())
                .build();

        Mockito.when(userService.updateCurrentUserProfile(any(User.class), any(UserUpdateRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(patch("/api/v1/users/me")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User profile updated successfully"))
                .andExpect(jsonPath("$.data.name").value("Jane Smith"))
                .andExpect(jsonPath("$.data.bio").value("Senior developer"));
    }

    @Test
    void updateProfile_ShouldReturnValidationError_WhenFieldsTooLong() throws Exception {
        // Bio exceeds 1000 characters
        String longBio = "a".repeat(1001);
        UserUpdateRequest updateRequest = UserUpdateRequest.builder()
                .bio(longBio)
                .build();

        mockMvc.perform(patch("/api/v1/users/me")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.data.details[0].field").value("bio"));
    }

    @Test
    void deleteProfile_ShouldReturnSuccess_WhenAuthenticated() throws Exception {
        Mockito.doNothing().when(userService).deleteCurrentUser(any(User.class));

        mockMvc.perform(delete("/api/v1/users/me").with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User profile deleted successfully"));

        Mockito.verify(userService, Mockito.times(1)).deleteCurrentUser(any(User.class));
    }
}
