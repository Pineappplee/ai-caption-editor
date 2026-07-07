package com.aicaptioneditor.modules.export.controller;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.export.dto.ExportJobResponseDto;
import com.aicaptioneditor.modules.export.dto.ExportRequestDto;
import com.aicaptioneditor.modules.export.model.ExportStatus;
import com.aicaptioneditor.modules.export.service.ExportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ExportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExportService exportService;

    private User mockUser;
    private UsernamePasswordAuthenticationToken mockAuth;
    private UUID projectId;
    private UUID jobId;
    private ExportJobResponseDto mockJobResponse;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        mockUser = User.builder()
                .id(userId)
                .name("Alice Smith")
                .email("alice@example.com")
                .plan(UserPlan.free)
                .build();

        mockAuth = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());

        projectId = UUID.randomUUID();
        jobId = UUID.randomUUID();

        mockJobResponse = ExportJobResponseDto.builder()
                .id(jobId)
                .projectId(projectId)
                .status(ExportStatus.QUEUED)
                .format("mp4")
                .progress(0)
                .createdAt(Instant.now())
                .downloadUrl("/api/v1/export/" + jobId + "/download")
                .build();
    }

    @Test
    void exportProject_ShouldReturnEnqueuedJob_WhenAuthenticatedAndRequestIsValid() throws Exception {
        ExportRequestDto request = ExportRequestDto.builder()
                .format("mp4")
                .build();

        Mockito.when(exportService.createJob(any(User.class), eq(projectId), any(ExportRequestDto.class)))
                .thenReturn(mockJobResponse);

        mockMvc.perform(post("/api/v1/projects/" + projectId + "/export")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(jobId.toString()))
                .andExpect(jsonPath("$.data.status").value("QUEUED"))
                .andExpect(jsonPath("$.data.format").value("mp4"));
    }

    @Test
    void exportProject_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        ExportRequestDto request = ExportRequestDto.builder()
                .format("mp4")
                .build();

        mockMvc.perform(post("/api/v1/projects/" + projectId + "/export")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getExportJobStatus_ShouldReturnJobStatus_WhenJobExistsAndUserOwnsProject() throws Exception {
        mockJobResponse.setStatus(ExportStatus.PROCESSING);
        mockJobResponse.setProgress(45);

        Mockito.when(exportService.getJob(any(User.class), eq(jobId)))
                .thenReturn(mockJobResponse);

        mockMvc.perform(get("/api/v1/export/" + jobId)
                        .with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(jobId.toString()))
                .andExpect(jsonPath("$.data.status").value("PROCESSING"))
                .andExpect(jsonPath("$.data.progress").value(45));
    }

    @Test
    void getExportJobStatus_ShouldReturnNotFound_WhenJobDoesNotExist() throws Exception {
        Mockito.when(exportService.getJob(any(User.class), eq(jobId)))
                .thenThrow(new ResourceNotFoundException("Export job not found with id: " + jobId));

        mockMvc.perform(get("/api/v1/export/" + jobId)
                        .with(authentication(mockAuth)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Export job not found with id: " + jobId));
    }

    @Test
    void downloadExportFile_ShouldReturnBinaryData_WhenJobIsCompleted() throws Exception {
        byte[] fileContent = "dummy file content".getBytes();
        Resource fileResource = new ByteArrayResource(fileContent);
        ExportService.ExportFileResource mockFileResource = new ExportService.ExportFileResource(
                fileResource, "export_" + projectId + "_" + jobId + ".mp4", "video/mp4"
        );

        Mockito.when(exportService.downloadJobFile(any(User.class), eq(jobId)))
                .thenReturn(mockFileResource);

        mockMvc.perform(get("/api/v1/export/" + jobId + "/download")
                        .with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.parseMediaType("video/mp4")))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"export_" + projectId + "_" + jobId + ".mp4\""))
                .andExpect(content().bytes(fileContent));
    }

    @Test
    void downloadExportFile_ShouldReturnBadRequest_WhenJobIsNotCompleted() throws Exception {
        Mockito.when(exportService.downloadJobFile(any(User.class), eq(jobId)))
                .thenThrow(new ApiException("Export job is not completed yet. Current status: QUEUED", HttpStatus.BAD_REQUEST));

        mockMvc.perform(get("/api/v1/export/" + jobId + "/download")
                        .with(authentication(mockAuth)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Export job is not completed yet. Current status: QUEUED"));
    }

    @Test
    void deleteExportJob_ShouldReturnSuccess_WhenJobExistsAndUserOwnsProject() throws Exception {
        Mockito.doNothing().when(exportService).deleteJob(any(User.class), eq(jobId));

        mockMvc.perform(delete("/api/v1/export/" + jobId)
                        .with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Export job deleted successfully"));
    }
}
