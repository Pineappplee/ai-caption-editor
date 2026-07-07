package com.aicaptioneditor.modules.media.mapper;

import com.aicaptioneditor.modules.media.dto.MediaAssetResponseDto;
import com.aicaptioneditor.modules.media.model.MediaAsset;
import com.aicaptioneditor.modules.storage.provider.StorageProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MediaAssetMapper {

    private final StorageProvider storageProvider;

    public MediaAssetResponseDto toResponseDto(MediaAsset asset) {
        if (asset == null) {
            return null;
        }

        String publicUrl = storageProvider.getPublicUrl(asset.getStoragePath());

        return MediaAssetResponseDto.builder()
                .id(asset.getId())
                .projectId(asset.getProject().getId())
                .ownerId(asset.getOwner().getId())
                .fileName(asset.getFileName())
                .originalName(asset.getOriginalName())
                .mimeType(asset.getMimeType())
                .size(asset.getSize())
                .storagePath(asset.getStoragePath())
                .provider(asset.getProvider())
                .publicUrl(publicUrl)
                .createdAt(asset.getCreatedAt())
                .build();
    }
}
