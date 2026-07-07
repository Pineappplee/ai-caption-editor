package com.aicaptioneditor.modules.projects.controller;

import com.aicaptioneditor.common.api.PageResponse;
import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.projects.dto.ProjectCreateRequest;
import com.aicaptioneditor.modules.projects.dto.ProjectResponseDto;
import com.aicaptioneditor.modules.projects.dto.ProjectUpdateRequest;
import com.aicaptioneditor.modules.projects.model.ProjectStatus;
import com.aicaptioneditor.modules.projects.service.ProjectService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjectService projectService;

    @Autowired
    private ObjectMapper objectMapper;

    private User mockUser;
    private UsernamePasswordAuthenticationToken mockAuth;
    private ProjectResponseDto mockProjectResponse;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        mockUser = User.builder()
                .id(userId)
                .name("John Doe")
                .email("john@example.com")
                .avatarUrl("https://example.com/john.png")
                .plan(UserPlan.free)
                .build();

        mockAuth = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());

        projectId = UUID.randomUUID();
        mockProjectResponse = ProjectResponseDto.builder()
                .id(projectId)
                .title("My Awesome Video")
                .description("Initial description")
                .status(ProjectStatus.DRAFT)
                .language("en")
                .thumbnailUrl("https://example.com/thumb.jpg")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    void createProject_ShouldReturnCreatedProject_WhenRequestIsValid() throws Exception {
        ProjectCreateRequest createRequest = ProjectCreateRequest.builder()
                .title("My Awesome Video")
                .description("Initial description")
                .language("en")
                .status(ProjectStatus.DRAFT)
                .thumbnailUrl("https://example.com/thumb.jpg")
                .build();

        Mockito.when(projectService.createProject(any(User.class), any(ProjectCreateRequest.class)))
                .thenReturn(mockProjectResponse);

        mockMvc.perform(post("/api/v1/projects")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Project created successfully"))
                .andExpect(jsonPath("$.data.id").value(projectId.toString()))
                .andExpect(jsonPath("$.data.title").value("My Awesome Video"));
    }

    @Test
    void createProject_ShouldReturnValidationError_WhenTitleIsBlank() throws Exception {
        ProjectCreateRequest createRequest = ProjectCreateRequest.builder()
                .title("") // Blank title
                .build();

        mockMvc.perform(post("/api/v1/projects")
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.data.details[0].field").value("title"));
    }

    @Test
    void createProject_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        ProjectCreateRequest createRequest = ProjectCreateRequest.builder()
                .title("My Awesome Video")
                .build();

        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.code").value("UNAUTHORIZED"));
    }

    @Test
    void getProjects_ShouldReturnPaginatedProjects_WhenAuthenticated() throws Exception {
        PageResponse<ProjectResponseDto> paginatedResponse = PageResponse.<ProjectResponseDto>builder()
                .content(List.of(mockProjectResponse))
                .page(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .last(true)
                .build();

        Mockito.when(projectService.getProjects(any(User.class), any(Pageable.class)))
                .thenReturn(paginatedResponse);

        mockMvc.perform(get("/api/v1/projects")
                        .with(authentication(mockAuth))
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortBy", "createdAt")
                        .param("direction", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Projects retrieved successfully"))
                .andExpect(jsonPath("$.data.content[0].id").value(projectId.toString()))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }

    @Test
    void getProjectById_ShouldReturnProject_WhenOwnedByUser() throws Exception {
        Mockito.when(projectService.getProjectById(any(User.class), eq(projectId)))
                .thenReturn(mockProjectResponse);

        mockMvc.perform(get("/api/v1/projects/" + projectId).with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Project retrieved successfully"))
                .andExpect(jsonPath("$.data.id").value(projectId.toString()));
    }

    @Test
    void getProjectById_ShouldReturnForbidden_WhenOwnedByOtherUser() throws Exception {
        Mockito.when(projectService.getProjectById(any(User.class), eq(projectId)))
                .thenThrow(new ApiException("You do not have permission to access this project", HttpStatus.FORBIDDEN));

        mockMvc.perform(get("/api/v1/projects/" + projectId).with(authentication(mockAuth)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("You do not have permission to access this project"))
                .andExpect(jsonPath("$.data.code").value("FORBIDDEN"));
    }

    @Test
    void getProjectById_ShouldReturnNotFound_WhenProjectDoesNotExist() throws Exception {
        Mockito.when(projectService.getProjectById(any(User.class), eq(projectId)))
                .thenThrow(new ResourceNotFoundException("Project not found with id: " + projectId));

        mockMvc.perform(get("/api/v1/projects/" + projectId).with(authentication(mockAuth)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Project not found with id: " + projectId))
                .andExpect(jsonPath("$.data.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void updateProject_ShouldReturnUpdatedProject_WhenRequestIsValid() throws Exception {
        ProjectUpdateRequest updateRequest = ProjectUpdateRequest.builder()
                .title("Updated Title")
                .description("Updated Description")
                .build();

        ProjectResponseDto updatedProject = ProjectResponseDto.builder()
                .id(projectId)
                .title("Updated Title")
                .description("Updated Description")
                .status(ProjectStatus.DRAFT)
                .language("en")
                .thumbnailUrl("https://example.com/thumb.jpg")
                .createdAt(mockProjectResponse.getCreatedAt())
                .updatedAt(Instant.now())
                .build();

        Mockito.when(projectService.updateProject(any(User.class), eq(projectId), any(ProjectUpdateRequest.class)))
                .thenReturn(updatedProject);

        mockMvc.perform(patch("/api/v1/projects/" + projectId)
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Project updated successfully"))
                .andExpect(jsonPath("$.data.title").value("Updated Title"))
                .andExpect(jsonPath("$.data.description").value("Updated Description"));
    }

    @Test
    void deleteProject_ShouldReturnSuccess_WhenOwnerDeletes() throws Exception {
        Mockito.doNothing().when(projectService).deleteProject(any(User.class), eq(projectId));

        mockMvc.perform(delete("/api/v1/projects/" + projectId).with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Project deleted successfully"));

        Mockito.verify(projectService, Mockito.times(1)).deleteProject(any(User.class), eq(projectId));
    }
}
