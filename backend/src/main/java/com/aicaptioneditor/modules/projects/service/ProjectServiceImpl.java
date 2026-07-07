package com.aicaptioneditor.modules.projects.service;

import com.aicaptioneditor.common.api.PageResponse;
import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.projects.dto.ProjectCreateRequest;
import com.aicaptioneditor.modules.projects.dto.ProjectResponseDto;
import com.aicaptioneditor.modules.projects.dto.ProjectUpdateRequest;
import com.aicaptioneditor.modules.projects.mapper.ProjectMapper;
import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.projects.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMapper projectMapper;

    @Override
    @Transactional
    public ProjectResponseDto createProject(User user, ProjectCreateRequest request) {
        Project project = projectMapper.toEntity(request, user);
        Project savedProject = projectRepository.save(project);
        return projectMapper.toResponseDto(savedProject);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProjectResponseDto> getProjects(User user, Pageable pageable) {
        Page<Project> projectsPage = projectRepository.findByUser(user, pageable);
        return PageResponse.fromPage(projectsPage, projectMapper::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponseDto getProjectById(User user, UUID id) {
        Project project = getProjectAndValidateOwner(user, id);
        return projectMapper.toResponseDto(project);
    }

    @Override
    @Transactional
    public ProjectResponseDto updateProject(User user, UUID id, ProjectUpdateRequest request) {
        Project project = getProjectAndValidateOwner(user, id);
        projectMapper.updateEntityFromRequest(request, project);
        Project savedProject = projectRepository.save(project);
        return projectMapper.toResponseDto(savedProject);
    }

    @Override
    @Transactional
    public void deleteProject(User user, UUID id) {
        Project project = getProjectAndValidateOwner(user, id);
        projectRepository.delete(project);
    }

    private Project getProjectAndValidateOwner(User user, UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (!project.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have permission to access this project", HttpStatus.FORBIDDEN);
        }

        return project;
    }
}
