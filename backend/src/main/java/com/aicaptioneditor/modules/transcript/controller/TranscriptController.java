package com.aicaptioneditor.modules.transcript.controller;

import com.aicaptioneditor.common.api.ApiResponse;
import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.transcript.dto.*;
import com.aicaptioneditor.modules.transcript.service.TranscriptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/transcript")
@RequiredArgsConstructor
@Tag(name = "Transcripts", description = "Endpoints for managing project transcripts and caption segments")
@SecurityRequirement(name = "bearerAuth")
public class TranscriptController {

    private final TranscriptService transcriptService;

    @PostMapping
    @Operation(summary = "Create project transcript", description = "Creates a transcript for a specific project. Only one transcript per project is allowed.")
    public ApiResponse<TranscriptResponseDto> createTranscript(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID projectId,
            @Valid @RequestBody TranscriptCreateRequest request
    ) {
        validateAuthentication(principal);
        TranscriptResponseDto responseDto = transcriptService.createTranscript(principal, projectId, request);
        return ApiResponse.success("Transcript created successfully", responseDto);
    }

    @GetMapping
    @Operation(summary = "Get project transcript", description = "Retrieves the transcript and ordered segments for a specific project.")
    public ApiResponse<TranscriptResponseDto> getTranscript(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID projectId
    ) {
        validateAuthentication(principal);
        TranscriptResponseDto responseDto = transcriptService.getTranscript(principal, projectId);
        return ApiResponse.success("Transcript retrieved successfully", responseDto);
    }

    @PutMapping
    @Operation(summary = "Update project transcript", description = "Updates/replaces the transcript details and segments. Overwrites existing segments.")
    public ApiResponse<TranscriptResponseDto> updateTranscript(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID projectId,
            @Valid @RequestBody TranscriptUpdateRequest request
    ) {
        validateAuthentication(principal);
        TranscriptResponseDto responseDto = transcriptService.updateTranscript(principal, projectId, request);
        return ApiResponse.success("Transcript updated successfully", responseDto);
    }

    @PatchMapping("/segments/{segmentId}")
    @Operation(summary = "Partially update a transcript segment", description = "Updates specified fields of a transcript segment. Validates chronological order and overlaps.")
    public ApiResponse<TranscriptSegmentResponseDto> patchSegment(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID projectId,
            @PathVariable UUID segmentId,
            @Valid @RequestBody TranscriptSegmentUpdateRequest request
    ) {
        validateAuthentication(principal);
        TranscriptSegmentResponseDto responseDto = transcriptService.patchSegment(principal, projectId, segmentId, request);
        return ApiResponse.success("Transcript segment updated successfully", responseDto);
    }

    @DeleteMapping("/segments/{segmentId}")
    @Operation(summary = "Delete a transcript segment", description = "Deletes a specific segment from a project transcript.")
    public ApiResponse<Void> deleteSegment(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID projectId,
            @PathVariable UUID segmentId
    ) {
        validateAuthentication(principal);
        transcriptService.deleteSegment(principal, projectId, segmentId);
        return ApiResponse.success("Transcript segment deleted successfully", null);
    }

    private void validateAuthentication(User principal) {
        if (principal == null) {
            throw new ApiException("User is not authenticated", HttpStatus.UNAUTHORIZED);
        }
    }
}
