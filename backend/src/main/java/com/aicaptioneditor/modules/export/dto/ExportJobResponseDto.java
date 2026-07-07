package com.aicaptioneditor.modules.export.dto;

import com.aicaptioneditor.modules.export.model.ExportStatus;
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
public class ExportJobResponseDto {
    private UUID id;
    private UUID projectId;
    private ExportStatus status;
    private String format;
    private Integer progress;
    private String outputPath;
    private String errorMessage;
    private Instant createdAt;
    private Instant completedAt;
    private String downloadUrl;
}
