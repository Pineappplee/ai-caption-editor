package com.aicaptioneditor.modules.ai.controller;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.ai.dto.*;
import com.aicaptioneditor.modules.ai.service.AIService;
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

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AIControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AIService aiService;

    @Autowired
    private ObjectMapper objectMapper;

    private User mockUser;
    private UsernamePasswordAuthenticationToken mockAuth;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(UUID.randomUUID())
                .name("Jane Doe")
                .email("jane@example.com")
                .plan(UserPlan.free)
                .build();

        mockAuth = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());
    }

    @Test
    void transcribe_ShouldReturnTranscript_WhenAuthenticated() throws Exception {
        UUID mediaAssetId = UUID.randomUUID();
        TranscribeRequest request = TranscribeRequest.builder()
                .mediaAssetId(mediaAssetId)
                .language("en")
                .build();

        TranscribeResponse response = new TranscribeResponse("Transcribed text");

        Mockito.when(aiService.transcribe(any(User.class), any(TranscribeRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/transcribe")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Audio transcribed successfully"))
                .andExpect(jsonPath("$.data.transcript").value("Transcribed text"));
    }

    @Test
    void transcribe_ShouldReturnValidationError_WhenMediaAssetIdIsNull() throws Exception {
        TranscribeRequest request = TranscribeRequest.builder()
                .language("en")
                .build();

        mockMvc.perform(post("/api/v1/ai/transcribe")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.code").value("VALIDATION_ERROR"));
    }

    @Test
    void rewrite_ShouldReturnRewrittenText_WhenRequestIsValid() throws Exception {
        RewriteRequest request = RewriteRequest.builder()
                .text("Raw text")
                .tone("formal")
                .build();

        RewriteResponse response = new RewriteResponse("Rewritten raw text");

        Mockito.when(aiService.rewrite(any(User.class), any(RewriteRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/rewrite")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.text").value("Rewritten raw text"));
    }

    @Test
    void translate_ShouldReturnTranslatedText_WhenRequestIsValid() throws Exception {
        TranslateRequest request = TranslateRequest.builder()
                .text("Hello")
                .targetLanguage("es")
                .build();

        TranslateResponse response = new TranslateResponse("Hola");

        Mockito.when(aiService.translate(any(User.class), any(TranslateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/translate")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.text").value("Hola"));
    }

    @Test
    void summarize_ShouldReturnSummary_WhenRequestIsValid() throws Exception {
        SummarizeRequest request = SummarizeRequest.builder()
                .text("A very long paragraph")
                .maxLength(50)
                .build();

        SummarizeResponse response = new SummarizeResponse("Short summary");

        Mockito.when(aiService.summarize(any(User.class), any(SummarizeRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/summarize")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.text").value("Short summary"));
    }

    @Test
    void generateCaptions_ShouldReturnCaptionSegments_WhenRequestIsValid() throws Exception {
        GenerateCaptionsRequest request = GenerateCaptionsRequest.builder()
                .text("A transcription block")
                .language("en")
                .build();

        List<CaptionSegmentDto> segments = List.of(
                CaptionSegmentDto.builder()
                        .text("A transcription")
                        .startTime(0.0)
                        .endTime(2.0)
                        .orderIndex(0)
                        .build()
        );
        GenerateCaptionsResponse response = new GenerateCaptionsResponse(segments);

        Mockito.when(aiService.generateCaptions(any(User.class), any(GenerateCaptionsRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/ai/captions")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.segments[0].text").value("A transcription"))
                .andExpect(jsonPath("$.data.segments[0].startTime").value(0.0));
    }

    @Test
    void aiEndpoints_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        RewriteRequest request = RewriteRequest.builder().text("Raw text").build();

        mockMvc.perform(post("/api/v1/ai/rewrite")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
