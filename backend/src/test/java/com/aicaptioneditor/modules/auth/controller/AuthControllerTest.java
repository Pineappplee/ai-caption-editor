package com.aicaptioneditor.modules.auth.controller;

import com.aicaptioneditor.modules.auth.dto.*;
import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean(name = "authService")
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    private AuthResponse mockAuthResponse;

    @BeforeEach
    void setUp() {
        UserResponse userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .name("Jane Doe")
                .email("jane@example.com")
                .plan(UserPlan.free)
                .build();

        mockAuthResponse = AuthResponse.builder()
                .accessToken("mock-access-token")
                .refreshToken("mock-refresh-token")
                .expiresIn(900)
                .user(userResponse)
                .build();
    }

    @Test
    void register_ShouldReturnSuccess_WhenRequestIsValid() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Jane Doe")
                .email("jane@example.com")
                .password("securepassword")
                .build();

        Mockito.when(authService.register(any(RegisterRequest.class))).thenReturn(mockAuthResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock-access-token"))
                .andExpect(jsonPath("$.data.user.email").value("jane@example.com"));
    }

    @Test
    void register_ShouldReturnValidationError_WhenEmailIsInvalid() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Jane Doe")
                .email("invalid-email")
                .password("securepassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.data.details[0].field").value("email"));
    }

    @Test
    void login_ShouldReturnSuccess_WhenCredentialsAreValid() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("jane@example.com")
                .password("securepassword")
                .build();

        Mockito.when(authService.login(any(LoginRequest.class))).thenReturn(mockAuthResponse);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock-access-token"));
    }

    @Test
    void me_ShouldReturnUserProfile_WhenAuthenticated() throws Exception {
        UserResponse userResponse = mockAuthResponse.getUser();
        Mockito.when(authService.getCurrentUser(any())).thenReturn(userResponse);

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("jane@example.com"));
    }
}
