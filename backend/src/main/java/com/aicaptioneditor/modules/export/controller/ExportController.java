package com.aicaptioneditor.modules.export.controller;

import com.aicaptioneditor.common.api.ApiResponse;
import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.export.dto.ExportJobResponseDto;
import com.aicaptioneditor.modules.export.dto.ExportRequestDto;
import com.aicaptioneditor.modules.export.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Export Engine", description = "Endpoints for creating and retrieving asynchronous export jobs")
@SecurityRequirement(name = "bearerAuth")
public class ExportController {

    private final ExportService exportService;

    @PostMapping("/projects/{projectId}/export")
    @Operation(summary = "Create an export job", description = "Creates a new asynchronous export job for a project")
    public ApiResponse<ExportJobResponseDto> exportProject(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID projectId,
            @Valid @RequestBody ExportRequestDto request
    ) {
        validateAuthentication(principal);
        ExportJobResponseDto responseDto = exportService.createJob(principal, projectId, request);
        return ApiResponse.success("Export job created and enqueued successfully", responseDto);
    }

    @GetMapping("/export/{jobId}")
    @Operation(summary = "Get export job status", description = "Retrieves the current status and progress of an export job")
    public ApiResponse<ExportJobResponseDto> getExportJobStatus(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID jobId
    ) {
        validateAuthentication(principal);
        ExportJobResponseDto responseDto = exportService.getJob(principal, jobId);
        return ApiResponse.success("Export job retrieved successfully", responseDto);
    }

    @GetMapping("/export/{jobId}/download")
    @Operation(summary = "Download exported file", description = "Downloads the completed media or subtitle file for an export job")
    public ResponseEntity<Resource> downloadExportFile(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID jobId
    ) {
        validateAuthentication(principal);
        ExportService.ExportFileResource fileResource = exportService.downloadJobFile(principal, jobId);
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileResource.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileResource.filename() + "\"")
                .body(fileResource.resource());
    }

    @DeleteMapping("/export/{jobId}")
    @Operation(summary = "Delete an export job", description = "Cancels / deletes an export job and its associated storage files")
    public ApiResponse<Void> deleteExportJob(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID jobId
    ) {
        validateAuthentication(principal);
        exportService.deleteJob(principal, jobId);
        return ApiResponse.success("Export job deleted successfully", null);
    }

    private void validateAuthentication(User principal) {
        if (principal == null) {
            throw new ApiException("User is not authenticated", HttpStatus.UNAUTHORIZED);
        }
    }
}
