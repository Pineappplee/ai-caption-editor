package com.aicaptioneditor.modules.ai.controller;

import com.aicaptioneditor.common.api.ApiResponse;
import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.ai.dto.*;
import com.aicaptioneditor.modules.ai.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Tools", description = "Endpoints for provider-agnostic AI capabilities like transcription, translation, and text rewriting")
@SecurityRequirement(name = "bearerAuth")
public class AIController {

    private final AIService aiService;

    @PostMapping("/transcribe")
    @Operation(summary = "Transcribe an audio/video asset", description = "Extracts text from a previously uploaded audio or video asset using the active AI Provider.")
    public ApiResponse<TranscribeResponse> transcribe(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody TranscribeRequest request
    ) {
        validateAuthentication(principal);
        TranscribeResponse response = aiService.transcribe(principal, request);
        return ApiResponse.success("Audio transcribed successfully", response);
    }

    @PostMapping("/rewrite")
    @Operation(summary = "Rewrite text", description = "Rewrites a given text block, adjusting the tone or applying custom guidelines.")
    public ApiResponse<RewriteResponse> rewrite(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody RewriteRequest request
    ) {
        validateAuthentication(principal);
        RewriteResponse response = aiService.rewrite(principal, request);
        return ApiResponse.success("Text rewritten successfully", response);
    }

    @PostMapping("/translate")
    @Operation(summary = "Translate text", description = "Translates text into the requested target language.")
    public ApiResponse<TranslateResponse> translate(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody TranslateRequest request
    ) {
        validateAuthentication(principal);
        TranslateResponse response = aiService.translate(principal, request);
        return ApiResponse.success("Text translated successfully", response);
    }

    @PostMapping("/summarize")
    @Operation(summary = "Summarize text", description = "Generates a concise summary of the provided text.")
    public ApiResponse<SummarizeResponse> summarize(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody SummarizeRequest request
    ) {
        validateAuthentication(principal);
        SummarizeResponse response = aiService.summarize(principal, request);
        return ApiResponse.success("Text summarized successfully", response);
    }

    @PostMapping("/captions")
    @Operation(summary = "Generate caption segments", description = "Segments transcript text into short, timed caption chunks.")
    public ApiResponse<GenerateCaptionsResponse> generateCaptions(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody GenerateCaptionsRequest request
    ) {
        validateAuthentication(principal);
        GenerateCaptionsResponse response = aiService.generateCaptions(principal, request);
        return ApiResponse.success("Captions generated successfully", response);
    }

    private void validateAuthentication(User principal) {
        if (principal == null) {
            throw new ApiException("User is not authenticated", HttpStatus.UNAUTHORIZED);
        }
    }
}
