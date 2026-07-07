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
import com.aicaptioneditor.modules.projects.model.ProjectStatus;
import com.aicaptioneditor.modules.projects.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
public class ProjectServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectMapper projectMapper;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private User mockUser;
    private User otherUser;
    private Project mockProject;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(UUID.randomUUID())
                .name("Owner")
                .email("owner@example.com")
                .build();

        otherUser = User.builder()
                .id(UUID.randomUUID())
                .name("Other")
                .email("other@example.com")
                .build();

        projectId = UUID.randomUUID();
        mockProject = Project.builder()
                .id(projectId)
                .user(mockUser)
                .title("My Test Project")
                .status(ProjectStatus.DRAFT)
                .build();
    }

    @Test
    void createProject_ShouldSaveAndReturnProject() {
        ProjectCreateRequest request = ProjectCreateRequest.builder()
                .title("My Test Project")
                .build();

        Mockito.when(projectMapper.toEntity(request, mockUser)).thenReturn(mockProject);
        Mockito.when(projectRepository.save(mockProject)).thenReturn(mockProject);
        
        ProjectResponseDto mockResponse = ProjectResponseDto.builder()
                .id(projectId)
                .title("My Test Project")
                .build();
        Mockito.when(projectMapper.toResponseDto(mockProject)).thenReturn(mockResponse);

        ProjectResponseDto response = projectService.createProject(mockUser, request);

        assertNotNull(response);
        assertEquals(projectId, response.getId());
        assertEquals("My Test Project", response.getTitle());
    }

    @Test
    void getProjects_ShouldReturnPaginatedProjects() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Project> page = new PageImpl<>(List.of(mockProject));
        
        Mockito.when(projectRepository.findByUser(mockUser, pageable)).thenReturn(page);
        
        ProjectResponseDto mockResponse = ProjectResponseDto.builder()
                .id(projectId)
                .title("My Test Project")
                .build();
        Mockito.when(projectMapper.toResponseDto(mockProject)).thenReturn(mockResponse);

        PageResponse<ProjectResponseDto> response = projectService.getProjects(mockUser, pageable);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(projectId, response.getContent().get(0).getId());
    }

    @Test
    void getProjectById_ShouldReturnProject_WhenUserIsOwner() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        
        ProjectResponseDto mockResponse = ProjectResponseDto.builder()
                .id(projectId)
                .title("My Test Project")
                .build();
        Mockito.when(projectMapper.toResponseDto(mockProject)).thenReturn(mockResponse);

        ProjectResponseDto response = projectService.getProjectById(mockUser, projectId);

        assertNotNull(response);
        assertEquals(projectId, response.getId());
    }

    @Test
    void getProjectById_ShouldThrowNotFound_WhenProjectDoesNotExist() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                projectService.getProjectById(mockUser, projectId)
        );
    }

    @Test
    void getProjectById_ShouldThrowForbidden_WhenUserIsNotOwner() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        ApiException exception = assertThrows(ApiException.class, () ->
                projectService.getProjectById(otherUser, projectId)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
        assertEquals("You do not have permission to access this project", exception.getMessage());
    }

    @Test
    void updateProject_ShouldUpdateAndReturnProject_WhenUserIsOwner() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        
        ProjectUpdateRequest request = ProjectUpdateRequest.builder()
                .title("Updated Title")
                .build();

        Mockito.doNothing().when(projectMapper).updateEntityFromRequest(request, mockProject);
        Mockito.when(projectRepository.save(mockProject)).thenReturn(mockProject);
        
        ProjectResponseDto mockResponse = ProjectResponseDto.builder()
                .id(projectId)
                .title("Updated Title")
                .build();
        Mockito.when(projectMapper.toResponseDto(mockProject)).thenReturn(mockResponse);

        ProjectResponseDto response = projectService.updateProject(mockUser, projectId, request);

        assertNotNull(response);
        assertEquals("Updated Title", response.getTitle());
    }

    @Test
    void deleteProject_ShouldCallDelete_WhenUserIsOwner() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        Mockito.doNothing().when(projectRepository).delete(mockProject);

        assertDoesNotThrow(() -> projectService.deleteProject(mockUser, projectId));

        Mockito.verify(projectRepository, Mockito.times(1)).delete(mockProject);
    }
}
