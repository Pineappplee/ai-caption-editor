package com.aicaptioneditor.modules.versions.controller;

import com.aicaptioneditor.common.api.ApiResponse;
import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.projects.dto.ProjectResponseDto;
import com.aicaptioneditor.modules.versions.dto.AutosaveRequestDto;
import com.aicaptioneditor.modules.versions.dto.ProjectVersionDetailResponseDto;
import com.aicaptioneditor.modules.versions.dto.ProjectVersionResponseDto;
import com.aicaptioneditor.modules.versions.service.ProjectVersionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}")
@RequiredArgsConstructor
@Tag(name = "Version History", description = "Endpoints for managing project autosaves, version list, and restorations")
@SecurityRequirement(name = "bearerAuth")
public class ProjectVersionController {

    private final ProjectVersionService projectVersionService;

    @PostMapping("/autosave")
    @Operation(summary = "Create an autosave version", description = "Creates a new autosave project version snapshot without overwriting previous versions. Uses the current DB state if no custom snapshot is passed.")
    public ApiResponse<ProjectVersionResponseDto> createAutosave(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID projectId,
            @Valid @RequestBody(required = false) AutosaveRequestDto request
    ) {
        validateAuthentication(principal);
        AutosaveRequestDto body = request != null ? request : new AutosaveRequestDto();
        ProjectVersionResponseDto responseDto = projectVersionService.saveAutosave(principal, projectId, body);
        return ApiResponse.success("Autosave created successfully", responseDto);
    }

    @GetMapping("/versions")
    @Operation(summary = "List project versions", description = "Retrieves the version history for a project, ordered from newest to oldest")
    public ApiResponse<List<ProjectVersionResponseDto>> getVersions(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID projectId
    ) {
        validateAuthentication(principal);
        List<ProjectVersionResponseDto> versions = projectVersionService.getVersions(principal, projectId);
        return ApiResponse.success("Project versions retrieved successfully", versions);
    }

    @GetMapping("/versions/{versionId}")
    @Operation(summary = "Get single project version", description = "Retrieves details of a specific project version, including its full snapshot")
    public ApiResponse<ProjectVersionDetailResponseDto> getVersionById(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID projectId,
            @PathVariable UUID versionId
    ) {
        validateAuthentication(principal);
        ProjectVersionDetailResponseDto detail = projectVersionService.getVersion(principal, projectId, versionId);
        return ApiResponse.success("Project version details retrieved successfully", detail);
    }

    @PostMapping("/restore/{versionId}")
    @Operation(summary = "Restore project version", description = "Restores the project metadata and transcript to the state saved in the specified version")
    public ApiResponse<ProjectResponseDto> restoreVersion(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID projectId,
            @PathVariable UUID versionId
    ) {
        validateAuthentication(principal);
        ProjectResponseDto response = projectVersionService.restoreVersion(principal, projectId, versionId);
        return ApiResponse.success("Project version restored successfully", response);
    }

    private void validateAuthentication(User principal) {
        if (principal == null) {
            throw new ApiException("User is not authenticated", HttpStatus.UNAUTHORIZED);
        }
    }
}
