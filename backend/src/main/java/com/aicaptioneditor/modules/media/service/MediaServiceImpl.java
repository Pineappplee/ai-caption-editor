package com.aicaptioneditor.modules.media.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.BadRequestException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.media.dto.MediaAssetResponseDto;
import com.aicaptioneditor.modules.media.mapper.MediaAssetMapper;
import com.aicaptioneditor.modules.media.model.MediaAsset;
import com.aicaptioneditor.modules.media.repository.MediaAssetRepository;
import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.projects.repository.ProjectRepository;
import com.aicaptioneditor.modules.storage.provider.StorageProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaServiceImpl implements MediaService {

    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

    private final MediaAssetRepository mediaAssetRepository;
    private final ProjectRepository projectRepository;
    private final StorageProvider storageProvider;
    private final MediaAssetMapper mediaAssetMapper;

    @Override
    @Transactional
    public MediaAssetResponseDto uploadMedia(MultipartFile file, UUID projectId, User user) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File must not be empty");
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds the maximum limit of 100MB");
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedMimeType(contentType)) {
            throw new BadRequestException("Unsupported file type: " + (contentType != null ? contentType : "unknown"));
        }

        // Validate Project exist and ownership
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!project.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have permission to upload files to this project", HttpStatus.FORBIDDEN);
        }

        // Generate unique filename
        String originalName = file.getOriginalFilename();
        String sanitizedOriginalName = originalName != null ? originalName.replaceAll("[^a-zA-Z0-9.-]", "_") : "unnamed_file";
        String uniqueName = UUID.randomUUID().toString() + "_" + sanitizedOriginalName;

        // Path structure: users/{userId}/{projectId}/{uniqueName}
        String storagePath = "users/" + user.getId() + "/" + projectId + "/" + uniqueName;

        // Upload to Storage
        try {
            storageProvider.upload(storagePath, file.getInputStream());
        } catch (IOException e) {
            log.error("Failed to read file input stream during upload", e);
            throw new RuntimeException("Failed to read file input stream", e);
        }

        // Save metadata
        MediaAsset asset = MediaAsset.builder()
                .project(project)
                .owner(user)
                .fileName(uniqueName)
                .originalName(originalName != null ? originalName : sanitizedOriginalName)
                .mimeType(contentType)
                .size(file.getSize())
                .storagePath(storagePath)
                .provider("LOCAL") // Currently using LOCAL storage provider
                .build();

        MediaAsset savedAsset = mediaAssetRepository.save(asset);
        return mediaAssetMapper.toResponseDto(savedAsset);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaAssetResponseDto> getProjectMedia(UUID projectId, User user) {
        // Validate Project exist and ownership
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!project.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have permission to view media for this project", HttpStatus.FORBIDDEN);
        }

        List<MediaAsset> assets = mediaAssetRepository.findByProjectIdAndOwnerId(projectId, user.getId());
        return assets.stream()
                .map(mediaAssetMapper::toResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public void deleteMedia(UUID id, User user) {
        MediaAsset asset = mediaAssetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media asset not found with id: " + id));

        // Check ownership
        if (!asset.getOwner().getId().equals(user.getId())) {
            throw new ApiException("You do not have permission to delete this media asset", HttpStatus.FORBIDDEN);
        }

        // Delete from Storage
        try {
            storageProvider.delete(asset.getStoragePath());
        } catch (Exception e) {
            log.warn("Failed to delete file from storage during asset deletion, database metadata will still be removed", e);
        }

        // Delete from database
        mediaAssetRepository.delete(asset);
    }

    private boolean isAllowedMimeType(String mimeType) {
        return mimeType.startsWith("video/") ||
                mimeType.startsWith("audio/") ||
                mimeType.startsWith("image/") ||
                mimeType.equals("text/vtt") ||
                mimeType.equals("text/plain") ||
                mimeType.equals("application/octet-stream") ||
                mimeType.equals("application/x-subrip");
    }
}
