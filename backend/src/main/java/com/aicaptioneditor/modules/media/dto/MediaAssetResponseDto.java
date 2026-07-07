package com.aicaptioneditor.modules.media.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaAssetResponseDto {
    private UUID id;
    private UUID projectId;
    private UUID ownerId;
    private String fileName;
    private String originalName;
    private String mimeType;
    private Long size;
    private String storagePath;
    private String provider;
    private String publicUrl;
    private Instant createdAt;
}
