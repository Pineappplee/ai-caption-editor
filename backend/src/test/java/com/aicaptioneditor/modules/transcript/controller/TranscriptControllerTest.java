package com.aicaptioneditor.modules.transcript.controller;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.transcript.dto.*;
import com.aicaptioneditor.modules.transcript.service.TranscriptService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class TranscriptControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TranscriptService transcriptService;

    @Autowired
    private ObjectMapper objectMapper;

    private User mockUser;
    private UsernamePasswordAuthenticationToken mockAuth;
    private UUID projectId;
    private UUID transcriptId;
    private TranscriptResponseDto mockTranscriptResponse;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        mockUser = User.builder()
                .id(userId)
                .name("John Doe")
                .email("john@example.com")
                .plan(UserPlan.free)
                .build();

        mockAuth = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());
        projectId = UUID.randomUUID();
        transcriptId = UUID.randomUUID();

        TranscriptSegmentResponseDto segment = TranscriptSegmentResponseDto.builder()
                .id(UUID.randomUUID())
                .startTime(0.0)
                .endTime(3.5)
                .text("Hello World")
                .speaker("Speaker 1")
                .confidence(0.95)
                .orderIndex(0)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        mockTranscriptResponse = TranscriptResponseDto.builder()
                .id(transcriptId)
                .projectId(projectId)
                .language("en")
                .version(1)
                .segments(List.of(segment))
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    void createTranscript_ShouldReturnCreatedTranscript_WhenRequestIsValid() throws Exception {
        TranscriptCreateRequest request = TranscriptCreateRequest.builder()
                .language("en")
                .segments(List.of(
                        TranscriptSegmentCreateRequest.builder()
                                .startTime(0.0)
                                .endTime(3.5)
                                .text("Hello World")
                                .speaker("Speaker 1")
                                .confidence(0.95)
                                .build()
                ))
                .build();

        Mockito.when(transcriptService.createTranscript(any(User.class), eq(projectId), any(TranscriptCreateRequest.class)))
                .thenReturn(mockTranscriptResponse);

        mockMvc.perform(post("/api/v1/projects/" + projectId + "/transcript")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Transcript created successfully"))
                .andExpect(jsonPath("$.data.id").value(transcriptId.toString()))
                .andExpect(jsonPath("$.data.language").value("en"));
    }

    @Test
    void getTranscript_ShouldReturnTranscript_WhenOwnedByUser() throws Exception {
        Mockito.when(transcriptService.getTranscript(any(User.class), eq(projectId)))
                .thenReturn(mockTranscriptResponse);

        mockMvc.perform(get("/api/v1/projects/" + projectId + "/transcript")
                        .with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Transcript retrieved successfully"))
                .andExpect(jsonPath("$.data.id").value(transcriptId.toString()));
    }

    @Test
    void getTranscript_ShouldReturnForbidden_WhenNotOwner() throws Exception {
        Mockito.when(transcriptService.getTranscript(any(User.class), eq(projectId)))
                .thenThrow(new ApiException("You do not have permission to access this project", HttpStatus.FORBIDDEN));

        mockMvc.perform(get("/api/v1/projects/" + projectId + "/transcript")
                        .with(authentication(mockAuth)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("You do not have permission to access this project"))
                .andExpect(jsonPath("$.data.code").value("FORBIDDEN"));
    }

    @Test
    void updateTranscript_ShouldReturnUpdatedTranscript_WhenValid() throws Exception {
        TranscriptUpdateRequest request = TranscriptUpdateRequest.builder()
                .language("fr")
                .segments(List.of())
                .build();

        TranscriptResponseDto updatedResponse = TranscriptResponseDto.builder()
                .id(transcriptId)
                .projectId(projectId)
                .language("fr")
                .version(2)
                .segments(List.of())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Mockito.when(transcriptService.updateTranscript(any(User.class), eq(projectId), any(TranscriptUpdateRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/api/v1/projects/" + projectId + "/transcript")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.language").value("fr"));
    }

    @Test
    void patchSegment_ShouldReturnUpdatedSegment_WhenValid() throws Exception {
        UUID segmentId = UUID.randomUUID();
        TranscriptSegmentUpdateRequest request = TranscriptSegmentUpdateRequest.builder()
                .text("Modified Text")
                .build();

        TranscriptSegmentResponseDto segmentResponse = TranscriptSegmentResponseDto.builder()
                .id(segmentId)
                .startTime(0.0)
                .endTime(3.5)
                .text("Modified Text")
                .speaker("Speaker 1")
                .confidence(0.95)
                .orderIndex(0)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        Mockito.when(transcriptService.patchSegment(any(User.class), eq(projectId), eq(segmentId), any(TranscriptSegmentUpdateRequest.class)))
                .thenReturn(segmentResponse);

        mockMvc.perform(patch("/api/v1/projects/" + projectId + "/transcript/segments/" + segmentId)
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.text").value("Modified Text"));
    }

    @Test
    void deleteSegment_ShouldReturnSuccess() throws Exception {
        UUID segmentId = UUID.randomUUID();
        Mockito.doNothing().when(transcriptService).deleteSegment(any(User.class), eq(projectId), eq(segmentId));

        mockMvc.perform(delete("/api/v1/projects/" + projectId + "/transcript/segments/" + segmentId)
                        .with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Transcript segment deleted successfully"));
    }
}
