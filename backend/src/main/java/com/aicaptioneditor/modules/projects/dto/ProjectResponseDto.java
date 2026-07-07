package com.aicaptioneditor.modules.projects.dto;

import com.aicaptioneditor.modules.projects.model.ProjectStatus;
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
public class ProjectResponseDto {
    private UUID id;
    private String title;
    private String description;
    private ProjectStatus status;
    private String language;
    private String thumbnailUrl;
    private Instant createdAt;
    private Instant updatedAt;
}
