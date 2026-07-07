package com.aicaptioneditor.modules.export.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.export.dto.ExportJobResponseDto;
import com.aicaptioneditor.modules.export.dto.ExportRequestDto;
import com.aicaptioneditor.modules.export.model.ExportJob;
import com.aicaptioneditor.modules.export.model.ExportStatus;
import com.aicaptioneditor.modules.export.queue.ExportQueue;
import com.aicaptioneditor.modules.export.repository.ExportJobRepository;
import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.projects.repository.ProjectRepository;
import com.aicaptioneditor.modules.storage.provider.StorageProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;

import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class ExportServiceImplTest {

    @Mock
    private ExportJobRepository exportJobRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ExportQueue exportQueue;

    @Mock
    private StorageProvider storageProvider;

    @InjectMocks
    private ExportServiceImpl exportService;

    private User owner;
    private User nonOwner;
    private Project project;
    private UUID projectId;
    private UUID jobId;
    private ExportJob exportJob;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(UUID.randomUUID())
                .name("Owner User")
                .email("owner@example.com")
                .build();

        nonOwner = User.builder()
                .id(UUID.randomUUID())
                .name("Other User")
                .email("other@example.com")
                .build();

        projectId = UUID.randomUUID();
        project = Project.builder()
                .id(projectId)
                .title("My Awesome Video")
                .user(owner)
                .build();

        jobId = UUID.randomUUID();
        exportJob = ExportJob.builder()
                .id(jobId)
                .project(project)
                .status(ExportStatus.QUEUED)
                .format("mp4")
                .progress(0)
                .createdAt(Instant.now())
                .build();
    }

    @Test
    void createJob_ShouldCreateAndEnqueue_WhenUserIsOwner() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        Mockito.when(exportJobRepository.save(any(ExportJob.class))).thenReturn(exportJob);

        ExportRequestDto request = ExportRequestDto.builder()
                .format("mp4")
                .build();

        ExportJobResponseDto result = exportService.createJob(owner, projectId, request);

        assertNotNull(result);
        assertEquals(jobId, result.getId());
        assertEquals(projectId, result.getProjectId());
        assertEquals(ExportStatus.QUEUED, result.getStatus());
        Mockito.verify(exportQueue).enqueue(jobId);
    }

    @Test
    void createJob_ShouldThrowForbidden_WhenUserIsNotOwner() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));

        ExportRequestDto request = ExportRequestDto.builder()
                .format("mp4")
                .build();

        ApiException exception = assertThrows(ApiException.class, () ->
                exportService.createJob(nonOwner, projectId, request)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
        Mockito.verify(exportQueue, Mockito.never()).enqueue(any(UUID.class));
    }

    @Test
    void getJob_ShouldReturnJob_WhenJobExistsAndUserIsOwner() {
        Mockito.when(exportJobRepository.findById(jobId)).thenReturn(Optional.of(exportJob));

        ExportJobResponseDto result = exportService.getJob(owner, jobId);

        assertNotNull(result);
        assertEquals(jobId, result.getId());
    }

    @Test
    void getJob_ShouldThrowForbidden_WhenUserIsNotOwner() {
        Mockito.when(exportJobRepository.findById(jobId)).thenReturn(Optional.of(exportJob));

        ApiException exception = assertThrows(ApiException.class, () ->
                exportService.getJob(nonOwner, jobId)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void downloadJobFile_ShouldReturnResource_WhenCompleted() throws Exception {
        exportJob.setStatus(ExportStatus.COMPLETED);
        exportJob.setOutputPath("some/path/file.mp4");

        Mockito.when(exportJobRepository.findById(jobId)).thenReturn(Optional.of(exportJob));
        Mockito.when(storageProvider.exists("some/path/file.mp4")).thenReturn(true);
        Mockito.when(storageProvider.download("some/path/file.mp4"))
                .thenReturn(new ByteArrayInputStream("data".getBytes()));

        ExportService.ExportFileResource result = exportService.downloadJobFile(owner, jobId);

        assertNotNull(result);
        assertEquals("video/mp4", result.contentType());
        assertNotNull(result.resource());
    }

    @Test
    void downloadJobFile_ShouldThrowBadRequest_WhenNotCompleted() {
        Mockito.when(exportJobRepository.findById(jobId)).thenReturn(Optional.of(exportJob));

        ApiException exception = assertThrows(ApiException.class, () ->
                exportService.downloadJobFile(owner, jobId)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
    }

    @Test
    void deleteJob_ShouldDeleteFromStorageAndDb_WhenUserIsOwner() {
        exportJob.setOutputPath("some/path/file.mp4");
        Mockito.when(exportJobRepository.findById(jobId)).thenReturn(Optional.of(exportJob));
        Mockito.when(storageProvider.exists("some/path/file.mp4")).thenReturn(true);

        exportService.deleteJob(owner, jobId);

        Mockito.verify(storageProvider).delete("some/path/file.mp4");
        Mockito.verify(exportJobRepository).delete(exportJob);
    }
}
