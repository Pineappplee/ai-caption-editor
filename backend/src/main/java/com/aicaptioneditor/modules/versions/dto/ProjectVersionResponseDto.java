package com.aicaptioneditor.modules.versions.dto;

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
public class ProjectVersionResponseDto {
    private UUID id;
    private UUID projectId;
    private Integer versionNumber;
    private UUID createdBy;
    private Instant createdAt;
    private Boolean isAutoSave;
    private String message;
}
