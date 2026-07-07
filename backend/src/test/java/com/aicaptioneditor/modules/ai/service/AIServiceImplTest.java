package com.aicaptioneditor.modules.ai.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.ai.dto.*;
import com.aicaptioneditor.modules.ai.provider.AIProvider;
import com.aicaptioneditor.modules.media.model.MediaAsset;
import com.aicaptioneditor.modules.media.repository.MediaAssetRepository;
import com.aicaptioneditor.modules.storage.provider.StorageProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AIServiceImplTest {

    private AIServiceImpl aiService;

    @Mock
    private AIProvider activeAIProvider;

    @Mock
    private MediaAssetRepository mediaAssetRepository;

    @Mock
    private StorageProvider storageProvider;

    private User mockOwner;
    private User mockGuest;
    private UUID mediaAssetId;
    private MediaAsset mockMediaAsset;

    @BeforeEach
    void setUp() {
        aiService = new AIServiceImpl(activeAIProvider, mediaAssetRepository, storageProvider);

        mockOwner = User.builder()
                .id(UUID.randomUUID())
                .email("owner@example.com")
                .build();

        mockGuest = User.builder()
                .id(UUID.randomUUID())
                .email("guest@example.com")
                .build();

        mediaAssetId = UUID.randomUUID();

        mockMediaAsset = MediaAsset.builder()
                .id(mediaAssetId)
                .owner(mockOwner)
                .storagePath("users/owner-id/project-id/file.mp4")
                .build();
    }

    @Test
    void transcribe_ShouldThrowResourceNotFound_WhenAssetDoesNotExist() {
        Mockito.when(mediaAssetRepository.findById(mediaAssetId)).thenReturn(Optional.empty());

        TranscribeRequest request = TranscribeRequest.builder().mediaAssetId(mediaAssetId).build();

        assertThrows(ResourceNotFoundException.class, () -> aiService.transcribe(mockOwner, request));
    }

    @Test
    void transcribe_ShouldThrowForbidden_WhenUserDoesNotOwnAsset() {
        Mockito.when(mediaAssetRepository.findById(mediaAssetId)).thenReturn(Optional.of(mockMediaAsset));

        TranscribeRequest request = TranscribeRequest.builder().mediaAssetId(mediaAssetId).build();

        ApiException ex = assertThrows(ApiException.class, () -> aiService.transcribe(mockGuest, request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    void transcribe_ShouldTranscribeSuccessfully_WhenUserOwnsAsset() throws IOException {
        Mockito.when(mediaAssetRepository.findById(mediaAssetId)).thenReturn(Optional.of(mockMediaAsset));

        byte[] fakeAudioData = "fake audio contents".getBytes();
        InputStream fakeStream = new ByteArrayInputStream(fakeAudioData);
        Mockito.when(storageProvider.download(mockMediaAsset.getStoragePath())).thenReturn(fakeStream);

        Mockito.when(activeAIProvider.transcribe(eq(fakeAudioData), eq("en"))).thenReturn("Transcribed text");

        TranscribeRequest request = TranscribeRequest.builder()
                .mediaAssetId(mediaAssetId)
                .language("en")
                .build();

        TranscribeResponse response = aiService.transcribe(mockOwner, request);

        assertNotNull(response);
        assertEquals("Transcribed text", response.getTranscript());
    }

    @Test
    void transcribe_NullDownloadStream() {
        Mockito.when(mediaAssetRepository.findById(mediaAssetId)).thenReturn(Optional.of(mockMediaAsset));
        Mockito.when(storageProvider.download(mockMediaAsset.getStoragePath())).thenReturn(null);

        TranscribeRequest request = TranscribeRequest.builder().mediaAssetId(mediaAssetId).build();

        ApiException ex = assertThrows(ApiException.class, () -> aiService.transcribe(mockOwner, request));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatus());
    }

    @Test
    void transcribe_DownloadThrowsException() {
        Mockito.when(mediaAssetRepository.findById(mediaAssetId)).thenReturn(Optional.of(mockMediaAsset));
        Mockito.when(storageProvider.download(mockMediaAsset.getStoragePath())).thenThrow(new RuntimeException("disk error"));

        TranscribeRequest request = TranscribeRequest.builder().mediaAssetId(mediaAssetId).build();

        ApiException ex = assertThrows(ApiException.class, () -> aiService.transcribe(mockOwner, request));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatus());
    }

    @Test
    void transcribe_ProviderThrowsApiException() {
        Mockito.when(mediaAssetRepository.findById(mediaAssetId)).thenReturn(Optional.of(mockMediaAsset));
        byte[] fakeAudioData = "fake audio".getBytes();
        Mockito.when(storageProvider.download(mockMediaAsset.getStoragePath())).thenReturn(new ByteArrayInputStream(fakeAudioData));
        Mockito.when(activeAIProvider.transcribe(any(), any())).thenThrow(new ApiException("quota exceeded", HttpStatus.TOO_MANY_REQUESTS));

        TranscribeRequest request = TranscribeRequest.builder().mediaAssetId(mediaAssetId).build();

        ApiException ex = assertThrows(ApiException.class, () -> aiService.transcribe(mockOwner, request));
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, ex.getStatus());
    }

    @Test
    void transcribe_ProviderThrowsGenericException() {
        Mockito.when(mediaAssetRepository.findById(mediaAssetId)).thenReturn(Optional.of(mockMediaAsset));
        byte[] fakeAudioData = "fake audio".getBytes();
        Mockito.when(storageProvider.download(mockMediaAsset.getStoragePath())).thenReturn(new ByteArrayInputStream(fakeAudioData));
        Mockito.when(activeAIProvider.transcribe(any(), any())).thenThrow(new RuntimeException("unknown server failure"));

        TranscribeRequest request = TranscribeRequest.builder().mediaAssetId(mediaAssetId).build();

        ApiException ex = assertThrows(ApiException.class, () -> aiService.transcribe(mockOwner, request));
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, ex.getStatus());
    }

    @Test
    void rewrite_ShouldDelegateToActiveProvider() {
        Mockito.when(activeAIProvider.rewrite("text", "formal", "prompt")).thenReturn("rewritten");

        RewriteRequest request = RewriteRequest.builder()
                .text("text")
                .tone("formal")
                .prompt("prompt")
                .build();

        RewriteResponse response = aiService.rewrite(mockOwner, request);

        assertNotNull(response);
        assertEquals("rewritten", response.getText());
    }

    @Test
    void rewrite_ThrowsApiException() {
        Mockito.when(activeAIProvider.rewrite(any(), any(), any())).thenThrow(new ApiException("Bad Prompt", HttpStatus.BAD_REQUEST));
        RewriteRequest request = RewriteRequest.builder().build();
        assertThrows(ApiException.class, () -> aiService.rewrite(mockOwner, request));
    }

    @Test
    void rewrite_ThrowsGenericException() {
        Mockito.when(activeAIProvider.rewrite(any(), any(), any())).thenThrow(new RuntimeException("crash"));
        RewriteRequest request = RewriteRequest.builder().build();
        assertThrows(ApiException.class, () -> aiService.rewrite(mockOwner, request));
    }

    @Test
    void translate_ShouldDelegateToActiveProvider() {
        Mockito.when(activeAIProvider.translate("text", "es")).thenReturn("translated");

        TranslateRequest request = TranslateRequest.builder()
                .text("text")
                .targetLanguage("es")
                .build();

        TranslateResponse response = aiService.translate(mockOwner, request);

        assertNotNull(response);
        assertEquals("translated", response.getText());
    }

    @Test
    void translate_ThrowsApiException() {
        Mockito.when(activeAIProvider.translate(any(), any())).thenThrow(new ApiException("Not supported language", HttpStatus.BAD_REQUEST));
        TranslateRequest request = TranslateRequest.builder().build();
        assertThrows(ApiException.class, () -> aiService.translate(mockOwner, request));
    }

    @Test
    void translate_ThrowsGenericException() {
        Mockito.when(activeAIProvider.translate(any(), any())).thenThrow(new RuntimeException("crash"));
        TranslateRequest request = TranslateRequest.builder().build();
        assertThrows(ApiException.class, () -> aiService.translate(mockOwner, request));
    }

    @Test
    void summarize_ShouldDelegateToActiveProvider() {
        Mockito.when(activeAIProvider.summarize("text", 50)).thenReturn("summary");

        SummarizeRequest request = SummarizeRequest.builder()
                .text("text")
                .maxLength(50)
                .build();

        SummarizeResponse response = aiService.summarize(mockOwner, request);

        assertNotNull(response);
        assertEquals("summary", response.getText());
    }

    @Test
    void summarize_ThrowsApiException() {
        Mockito.when(activeAIProvider.summarize(any(), anyInt())).thenThrow(new ApiException("Too short text", HttpStatus.BAD_REQUEST));
        SummarizeRequest request = SummarizeRequest.builder().build();
        assertThrows(ApiException.class, () -> aiService.summarize(mockOwner, request));
    }

    @Test
    void summarize_ThrowsGenericException() {
        Mockito.when(activeAIProvider.summarize(any(), anyInt())).thenThrow(new RuntimeException("crash"));
        SummarizeRequest request = SummarizeRequest.builder().build();
        assertThrows(ApiException.class, () -> aiService.summarize(mockOwner, request));
    }

    @Test
    void generateCaptions_ShouldDelegateToActiveProvider() {
        List<CaptionSegmentDto> segments = List.of(
                CaptionSegmentDto.builder()
                        .text("part")
                        .startTime(0.0)
                        .endTime(1.0)
                        .build()
        );
        Mockito.when(activeAIProvider.generateCaptions("text", "en")).thenReturn(segments);

        GenerateCaptionsRequest request = GenerateCaptionsRequest.builder()
                .text("text")
                .language("en")
                .build();

        GenerateCaptionsResponse response = aiService.generateCaptions(mockOwner, request);

        assertNotNull(response);
        assertEquals(1, response.getSegments().size());
        assertEquals("part", response.getSegments().get(0).getText());
    }

    @Test
    void generateCaptions_ThrowsApiException() {
        Mockito.when(activeAIProvider.generateCaptions(any(), any())).thenThrow(new ApiException("Bad Text", HttpStatus.BAD_REQUEST));
        GenerateCaptionsRequest request = GenerateCaptionsRequest.builder().build();
        assertThrows(ApiException.class, () -> aiService.generateCaptions(mockOwner, request));
    }

    @Test
    void generateCaptions_ThrowsGenericException() {
        Mockito.when(activeAIProvider.generateCaptions(any(), any())).thenThrow(new RuntimeException("crash"));
        GenerateCaptionsRequest request = GenerateCaptionsRequest.builder().build();
        assertThrows(ApiException.class, () -> aiService.generateCaptions(mockOwner, request));
    }
}
