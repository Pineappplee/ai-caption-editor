package com.aicaptioneditor.modules.projects.mapper;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.projects.dto.ProjectCreateRequest;
import com.aicaptioneditor.modules.projects.dto.ProjectResponseDto;
import com.aicaptioneditor.modules.projects.dto.ProjectUpdateRequest;
import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.projects.model.ProjectStatus;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectResponseDto toResponseDto(Project project) {
        if (project == null) {
            return null;
        }

        return ProjectResponseDto.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus())
                .language(project.getLanguage())
                .thumbnailUrl(project.getThumbnailUrl())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    public Project toEntity(ProjectCreateRequest request, User user) {
        if (request == null) {
            return null;
        }

        ProjectStatus status = request.getStatus() != null ? request.getStatus() : ProjectStatus.DRAFT;

        return Project.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .status(status)
                .language(request.getLanguage())
                .thumbnailUrl(request.getThumbnailUrl())
                .build();
    }

    public void updateEntityFromRequest(ProjectUpdateRequest request, Project project) {
        if (request == null || project == null) {
            return;
        }

        if (request.getTitle() != null) {
            project.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }

        if (request.getLanguage() != null) {
            project.setLanguage(request.getLanguage());
        }

        if (request.getThumbnailUrl() != null) {
            project.setThumbnailUrl(request.getThumbnailUrl());
        }
    }
}
