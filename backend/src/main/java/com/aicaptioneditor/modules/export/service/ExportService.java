package com.aicaptioneditor.modules.export.service;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.export.dto.ExportJobResponseDto;
import com.aicaptioneditor.modules.export.dto.ExportRequestDto;
import org.springframework.core.io.Resource;

import java.util.UUID;

public interface ExportService {
    
    ExportJobResponseDto createJob(User user, UUID projectId, ExportRequestDto request);
    
    ExportJobResponseDto getJob(User user, UUID jobId);
    
    ExportFileResource downloadJobFile(User user, UUID jobId);
    
    void deleteJob(User user, UUID jobId);

    record ExportFileResource(
        Resource resource,
        String filename,
        String contentType
    ) {}
}
