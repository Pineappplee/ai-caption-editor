package com.aicaptioneditor.modules.ai.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.ai.dto.*;
import com.aicaptioneditor.modules.ai.provider.AIProvider;
import com.aicaptioneditor.modules.media.model.MediaAsset;
import com.aicaptioneditor.modules.media.repository.MediaAssetRepository;
import com.aicaptioneditor.modules.storage.provider.StorageProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final AIProvider activeAIProvider;
    private final MediaAssetRepository mediaAssetRepository;
    private final StorageProvider storageProvider;

    @Override
    public TranscribeResponse transcribe(User user, TranscribeRequest request) {
        log.info("Requesting transcription for media asset: {}", request.getMediaAssetId());
        
        MediaAsset mediaAsset = mediaAssetRepository.findById(request.getMediaAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Media asset not found with ID: " + request.getMediaAssetId()));

        if (!mediaAsset.getOwner().getId().equals(user.getId())) {
            throw new ApiException("You do not have permission to access this media asset", HttpStatus.FORBIDDEN);
        }

        byte[] audioData;
        try (InputStream is = storageProvider.download(mediaAsset.getStoragePath())) {
            if (is == null) {
                throw new ApiException("Failed to load file contents from storage", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            audioData = is.readAllBytes();
        } catch (Exception e) {
            log.error("Error reading media asset file for transcription", e);
            throw new ApiException("Failed to read media asset for transcription: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        try {
            String transcript = activeAIProvider.transcribe(audioData, request.getLanguage());
            return new TranscribeResponse(transcript);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("AI Provider failed during transcription", e);
            throw new ApiException("AI transcription failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public RewriteResponse rewrite(User user, RewriteRequest request) {
        log.info("Requesting text rewrite");
        try {
            String rewrittenText = activeAIProvider.rewrite(request.getText(), request.getTone(), request.getPrompt());
            return new RewriteResponse(rewrittenText);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("AI Provider failed during rewrite", e);
            throw new ApiException("AI rewrite failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public TranslateResponse translate(User user, TranslateRequest request) {
        log.info("Requesting text translation to: {}", request.getTargetLanguage());
        try {
            String translatedText = activeAIProvider.translate(request.getText(), request.getTargetLanguage());
            return new TranslateResponse(translatedText);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("AI Provider failed during translation", e);
            throw new ApiException("AI translation failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public SummarizeResponse summarize(User user, SummarizeRequest request) {
        log.info("Requesting text summary");
        try {
            String summary = activeAIProvider.summarize(request.getText(), request.getMaxLength());
            return new SummarizeResponse(summary);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("AI Provider failed during summarization", e);
            throw new ApiException("AI summarization failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public GenerateCaptionsResponse generateCaptions(User user, GenerateCaptionsRequest request) {
        log.info("Requesting caption generation");
        try {
            List<CaptionSegmentDto> segments = activeAIProvider.generateCaptions(request.getText(), request.getLanguage());
            return new GenerateCaptionsResponse(segments);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("AI Provider failed during caption generation", e);
            throw new ApiException("AI caption generation failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
