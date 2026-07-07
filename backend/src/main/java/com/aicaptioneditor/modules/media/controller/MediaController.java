package com.aicaptioneditor.modules.media.controller;

import com.aicaptioneditor.common.api.ApiResponse;
import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.media.dto.MediaAssetResponseDto;
import com.aicaptioneditor.modules.media.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Tag(name = "Media & Storage", description = "Endpoints for uploading, listing, and deleting media files")
@SecurityRequirement(name = "bearerAuth")
public class MediaController {

    private final MediaService mediaService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a media file", description = "Uploads a video, audio, image, or subtitle file for a specific project")
    public ApiResponse<MediaAssetResponseDto> uploadMedia(
            @AuthenticationPrincipal User principal,
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") UUID projectId
    ) {
        validateAuthentication(principal);
        MediaAssetResponseDto responseDto = mediaService.uploadMedia(file, projectId, principal);
        return ApiResponse.success("File uploaded successfully", responseDto);
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "List project media files", description = "Retrieves all media assets uploaded for a specific project")
    public ApiResponse<List<MediaAssetResponseDto>> getProjectMedia(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID projectId
    ) {
        validateAuthentication(principal);
        List<MediaAssetResponseDto> responseDtoList = mediaService.getProjectMedia(projectId, principal);
        return ApiResponse.success("Media assets retrieved successfully", responseDtoList);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a media file", description = "Deletes a media asset and its underlying file storage")
    public ApiResponse<Void> deleteMedia(
            @AuthenticationPrincipal User principal,
            @PathVariable UUID id
    ) {
        validateAuthentication(principal);
        mediaService.deleteMedia(id, principal);
        return ApiResponse.success("Media asset deleted successfully", null);
    }

    private void validateAuthentication(User principal) {
        if (principal == null) {
            throw new ApiException("User is not authenticated", HttpStatus.UNAUTHORIZED);
        }
    }
}
