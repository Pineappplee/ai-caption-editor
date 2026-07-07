package com.aicaptioneditor.modules.projects.controller;

import com.aicaptioneditor.common.api.ApiResponse;
import com.aicaptioneditor.common.api.PageResponse;
import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.projects.dto.ProjectCreateRequest;
import com.aicaptioneditor.modules.projects.dto.ProjectResponseDto;
import com.aicaptioneditor.modules.projects.dto.ProjectUpdateRequest;
import com.aicaptioneditor.modules.projects.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Endpoints for managing user editing projects")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @Operation(summary = "Create a new project", description = "Creates a new project owned by the authenticated user")
    public ApiResponse<ProjectResponseDto> createProject(
            @AuthenticationPrincipal User principal,
            @Valid @RequestBody ProjectCreateRequest request
    ) {
        validateAuthentication(principal);
        ProjectResponseDto responseDto = projectService.createProject(principal, request);
        return ApiResponse.success("Project created successfully", responseDto);
    }

    @GetMapping
    @Operation(summary = "List user projects", description = "Retrieves a paginated list of projects belonging to the authenticated user")
    public ApiResponse<PageResponse<ProjectResponseDto>> getProjects(
            @AuthenticationPrincipal User principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        validateAuthentication(principal);
        
        Sort.Direction dir = Sort.Direction.DESC;
        try {
            dir = Sort.Direction.fromString(direction);
        } catch (IllegalArgumentException e) {
            // Fallback to DESC or throw a validation error. DESC is standard fallback.
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        PageResponse<ProjectResponseDto> response = projectService.getProjects(principal, pageable);
        return ApiResponse.success("Projects retrieved successfully", response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project details", description = "Retrieves detailed information of a specific project owned by the user")
    public ApiResponse<ProjectResponseDto> getProjectById(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id
    ) {
        validateAuthentication(principal);
        ProjectResponseDto responseDto = projectService.getProjectById(principal, id);
        return ApiResponse.success("Project retrieved successfully", responseDto);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update a project", description = "Partially updates a project's details. Only owned projects can be updated.")
    public ApiResponse<ProjectResponseDto> updateProject(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id,
            @Valid @RequestBody ProjectUpdateRequest request
    ) {
        validateAuthentication(principal);
        ProjectResponseDto responseDto = projectService.updateProject(principal, id, request);
        return ApiResponse.success("Project updated successfully", responseDto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a project", description = "Deletes a specific project owned by the user")
    public ApiResponse<Void> deleteProject(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id
    ) {
        validateAuthentication(principal);
        projectService.deleteProject(principal, id);
        return ApiResponse.success("Project deleted successfully", null);
    }

    private void validateAuthentication(User principal) {
        if (principal == null) {
            throw new ApiException("User is not authenticated", HttpStatus.UNAUTHORIZED);
        }
    }
}
