package com.aicaptioneditor.modules.projects.service;

import com.aicaptioneditor.common.api.PageResponse;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.projects.dto.ProjectCreateRequest;
import com.aicaptioneditor.modules.projects.dto.ProjectResponseDto;
import com.aicaptioneditor.modules.projects.dto.ProjectUpdateRequest;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ProjectService {
    ProjectResponseDto createProject(User user, ProjectCreateRequest request);
    PageResponse<ProjectResponseDto> getProjects(User user, Pageable pageable);
    ProjectResponseDto getProjectById(User user, UUID id);
    ProjectResponseDto updateProject(User user, UUID id, ProjectUpdateRequest request);
    void deleteProject(User user, UUID id);
}
