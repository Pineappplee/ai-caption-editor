package com.aicaptioneditor.modules.versions.controller;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.projects.dto.ProjectResponseDto;
import com.aicaptioneditor.modules.projects.model.ProjectStatus;
import com.aicaptioneditor.modules.versions.dto.AutosaveRequestDto;
import com.aicaptioneditor.modules.versions.dto.ProjectVersionDetailResponseDto;
import com.aicaptioneditor.modules.versions.dto.ProjectVersionResponseDto;
import com.aicaptioneditor.modules.versions.model.ProjectVersionSnapshot;
import com.aicaptioneditor.modules.versions.service.ProjectVersionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ProjectVersionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProjectVersionService projectVersionService;

    @Autowired
    private ObjectMapper objectMapper;

    private User mockUser;
    private UsernamePasswordAuthenticationToken mockAuth;
    private UUID projectId;
    private UUID versionId;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        mockUser = User.builder()
                .id(userId)
                .name("John Doe")
                .email("john@example.com")
                .plan(UserPlan.free)
                .build();

        mockAuth = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());
        projectId = UUID.randomUUID();
        versionId = UUID.randomUUID();
    }

    @Test
    void createAutosave_ShouldReturnCreatedAutosave() throws Exception {
        ProjectVersionResponseDto mockResponse = ProjectVersionResponseDto.builder()
                .id(versionId)
                .projectId(projectId)
                .versionNumber(1)
                .createdBy(mockUser.getId())
                .createdAt(Instant.now())
                .isAutoSave(true)
                .message("Test Autosave")
                .build();

        Mockito.when(projectVersionService.saveAutosave(any(User.class), eq(projectId), any(AutosaveRequestDto.class)))
                .thenReturn(mockResponse);

        AutosaveRequestDto request = AutosaveRequestDto.builder()
                .message("Test Autosave")
                .build();

        mockMvc.perform(post("/api/v1/projects/{projectId}/autosave", projectId)
                        .with(authentication(mockAuth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.versionNumber").value(1))
                .andExpect(jsonPath("$.data.message").value("Test Autosave"));
    }

    @Test
    void getVersions_ShouldReturnList() throws Exception {
        ProjectVersionResponseDto mockResponse = ProjectVersionResponseDto.builder()
                .id(versionId)
                .projectId(projectId)
                .versionNumber(1)
                .createdBy(mockUser.getId())
                .createdAt(Instant.now())
                .isAutoSave(true)
                .message("Test Autosave")
                .build();

        Mockito.when(projectVersionService.getVersions(any(User.class), eq(projectId)))
                .thenReturn(List.of(mockResponse));

        mockMvc.perform(get("/api/v1/projects/{projectId}/versions", projectId)
                        .with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].versionNumber").value(1))
                .andExpect(jsonPath("$.data[0].message").value("Test Autosave"));
    }

    @Test
    void getVersionById_ShouldReturnDetail() throws Exception {
        ProjectVersionSnapshot snapshot = ProjectVersionSnapshot.builder()
                .project(ProjectVersionSnapshot.ProjectSnapshotData.builder()
                        .title("Title")
                        .build())
                .build();

        ProjectVersionDetailResponseDto mockResponse = ProjectVersionDetailResponseDto.builder()
                .id(versionId)
                .projectId(projectId)
                .versionNumber(1)
                .createdBy(mockUser.getId())
                .createdAt(Instant.now())
                .isAutoSave(true)
                .message("Test Autosave")
                .snapshot(snapshot)
                .build();

        Mockito.when(projectVersionService.getVersion(any(User.class), eq(projectId), eq(versionId)))
                .thenReturn(mockResponse);

        mockMvc.perform(get("/api/v1/projects/{projectId}/versions/{versionId}", projectId, versionId)
                        .with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.snapshot.project.title").value("Title"));
    }

    @Test
    void restoreVersion_ShouldReturnRestoredProject() throws Exception {
        ProjectResponseDto mockResponse = ProjectResponseDto.builder()
                .id(projectId)
                .title("Restored Title")
                .status(ProjectStatus.ACTIVE)
                .build();

        Mockito.when(projectVersionService.restoreVersion(any(User.class), eq(projectId), eq(versionId)))
                .thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/projects/{projectId}/restore/{versionId}", projectId, versionId)
                        .with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Restored Title"));
    }
}
