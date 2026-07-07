package com.aicaptioneditor.modules.projects.dto;

import com.aicaptioneditor.modules.projects.model.ProjectStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectUpdateRequest {

    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 100, message = "Language must not exceed 100 characters")
    private String language;

    private ProjectStatus status;

    @Size(max = 2048, message = "Thumbnail URL must not exceed 2048 characters")
    private String thumbnailUrl;
}
