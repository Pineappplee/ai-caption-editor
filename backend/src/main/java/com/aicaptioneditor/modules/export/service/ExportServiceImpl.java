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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExportServiceImpl implements ExportService {

    private final ExportJobRepository exportJobRepository;
    private final ProjectRepository projectRepository;
    private final ExportQueue exportQueue;
    private final StorageProvider storageProvider;

    @Override
    @Transactional
    public ExportJobResponseDto createJob(User user, UUID projectId, ExportRequestDto request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!project.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have permission to export this project", HttpStatus.FORBIDDEN);
        }

        // Validate format
        String format = request.getFormat().toLowerCase();
        if (!isValidFormat(format)) {
            throw new ApiException("Unsupported export format: " + format, HttpStatus.BAD_REQUEST);
        }

        ExportJob job = ExportJob.builder()
                .project(project)
                .status(ExportStatus.QUEUED)
                .format(format)
                .progress(0)
                .build();

        ExportJob savedJob = exportJobRepository.save(job);
        
        // Asynchronously enqueue
        exportQueue.enqueue(savedJob.getId());
        
        log.info("Created export job: {} for project: {} and enqueued", savedJob.getId(), projectId);
        return mapToResponseDto(savedJob);
    }

    @Override
    @Transactional(readOnly = true)
    public ExportJobResponseDto getJob(User user, UUID jobId) {
        ExportJob job = getJobAndValidateOwner(user, jobId);
        return mapToResponseDto(job);
    }

    @Override
    @Transactional(readOnly = true)
    public ExportFileResource downloadJobFile(User user, UUID jobId) {
        ExportJob job = getJobAndValidateOwner(user, jobId);

        if (job.getStatus() != ExportStatus.COMPLETED) {
            throw new ApiException("Export job is not completed yet. Current status: " + job.getStatus(), HttpStatus.BAD_REQUEST);
        }

        if (job.getOutputPath() == null || !storageProvider.exists(job.getOutputPath())) {
            throw new ResourceNotFoundException("Exported file not found in storage");
        }

        try {
            InputStream is = storageProvider.download(job.getOutputPath());
            Resource resource = new InputStreamResource(is);
            String filename = "export_" + job.getProject().getId() + "_" + job.getId() + "." + job.getFormat();
            String contentType = determineContentType(job.getFormat());
            return new ExportFileResource(resource, filename, contentType);
        } catch (Exception e) {
            log.error("Failed to retrieve file from storage for job: {}", jobId, e);
            throw new ApiException("Failed to download exported file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional
    public void deleteJob(User user, UUID jobId) {
        ExportJob job = getJobAndValidateOwner(user, jobId);

        // Delete from storage if output path exists
        if (job.getOutputPath() != null) {
            try {
                if (storageProvider.exists(job.getOutputPath())) {
                    storageProvider.delete(job.getOutputPath());
                }
            } catch (Exception e) {
                log.warn("Failed to delete exported file from storage during job deletion: {}", job.getOutputPath(), e);
            }
        }

        exportJobRepository.delete(job);
        log.info("Deleted export job: {}", jobId);
    }

    private ExportJob getJobAndValidateOwner(User user, UUID jobId) {
        ExportJob job = exportJobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Export job not found with id: " + jobId));

        if (!job.getProject().getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have permission to access this export job", HttpStatus.FORBIDDEN);
        }

        return job;
    }

    private boolean isValidFormat(String format) {
        return "mp4".equals(format) || "srt".equals(format) || "vtt".equals(format) || "txt".equals(format) || "mp3".equals(format);
    }

    private String determineContentType(String format) {
        return switch (format.toLowerCase()) {
            case "mp4" -> "video/mp4";
            case "mp3" -> "audio/mpeg";
            case "srt" -> "application/x-subrip";
            case "vtt" -> "text/vtt";
            case "txt" -> "text/plain";
            default -> "application/octet-stream";
        };
    }

    private ExportJobResponseDto mapToResponseDto(ExportJob job) {
        return ExportJobResponseDto.builder()
                .id(job.getId())
                .projectId(job.getProject().getId())
                .status(job.getStatus())
                .format(job.getFormat())
                .progress(job.getProgress())
                .outputPath(job.getOutputPath())
                .errorMessage(job.getErrorMessage())
                .createdAt(job.getCreatedAt())
                .completedAt(job.getCompletedAt())
                .downloadUrl("/api/v1/export/" + job.getId() + "/download")
                .build();
    }
}
