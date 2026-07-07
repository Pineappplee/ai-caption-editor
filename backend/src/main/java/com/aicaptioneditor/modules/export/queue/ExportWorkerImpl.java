package com.aicaptioneditor.modules.export.queue;

import com.aicaptioneditor.modules.export.model.ExportJob;
import com.aicaptioneditor.modules.export.model.ExportStatus;
import com.aicaptioneditor.modules.export.processor.ExportProcessor;
import com.aicaptioneditor.modules.export.repository.ExportJobRepository;
import com.aicaptioneditor.modules.media.model.MediaAsset;
import com.aicaptioneditor.modules.media.repository.MediaAssetRepository;
import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.projects.repository.ProjectRepository;
import com.aicaptioneditor.modules.transcript.model.Transcript;
import com.aicaptioneditor.modules.transcript.model.TranscriptSegment;
import com.aicaptioneditor.modules.transcript.repository.TranscriptRepository;
import com.aicaptioneditor.modules.transcript.repository.TranscriptSegmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExportWorkerImpl implements ExportWorker {

    private final ExportJobRepository exportJobRepository;
    private final ProjectRepository projectRepository;
    private final TranscriptRepository transcriptRepository;
    private final TranscriptSegmentRepository transcriptSegmentRepository;
    private final MediaAssetRepository mediaAssetRepository;
    private final ExportProcessor exportProcessor;

    @Override
    @Transactional
    public void processJob(UUID jobId) {
        ExportJob job = exportJobRepository.findById(jobId).orElse(null);
        if (job == null) {
            log.error("Export job not found with id: {}", jobId);
            return;
        }

        log.info("Starting to process export job: {}, status: {}", job.getId(), job.getStatus());
        
        try {
            // Update job status to PROCESSING
            job.setStatus(ExportStatus.PROCESSING);
            job.setProgress(5);
            job = exportJobRepository.save(job);

            Project project = job.getProject();
            UUID projectId = project.getId();
            UUID ownerId = project.getUser().getId();

            // Load media assets
            List<MediaAsset> assets = mediaAssetRepository.findByProjectIdAndOwnerId(projectId, ownerId);
            if (assets.isEmpty()) {
                throw new RuntimeException("No media assets found for project with id: " + projectId);
            }
            
            // Find a primary video/audio asset or fallback to first asset
            MediaAsset primaryAsset = assets.stream()
                    .filter(a -> a.getMimeType().startsWith("video/") || a.getMimeType().startsWith("audio/"))
                    .findFirst()
                    .orElse(assets.get(0));

            // Load transcript and segments
            Transcript transcript = transcriptRepository.findByProjectId(projectId)
                    .orElseThrow(() -> new RuntimeException("Transcript not found for project with id: " + projectId));

            List<TranscriptSegment> segments = transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId());

            // Process export
            ExportJob finalJob = job;
            exportProcessor.process(job, primaryAsset, segments, progress -> {
                updateProgress(finalJob.getId(), progress);
            });

            // Mark job as COMPLETED
            job.setStatus(ExportStatus.COMPLETED);
            job.setProgress(100);
            job.setCompletedAt(Instant.now());
            exportJobRepository.save(job);
            log.info("Export job successfully completed: {}", job.getId());

        } catch (Exception e) {
            log.error("Failed to process export job: {}", job.getId(), e);
            job.setStatus(ExportStatus.FAILED);
            job.setErrorMessage(e.getMessage() != null ? e.getMessage() : e.toString());
            job.setCompletedAt(Instant.now());
            exportJobRepository.save(job);
        }
    }

    private void updateProgress(UUID jobId, int progress) {
        try {
            // Retrieve job, update progress, and save in a separate transaction if needed
            // For simplicity, we query and update. Since it's a background thread, we can update directly.
            ExportJob job = exportJobRepository.findById(jobId).orElse(null);
            if (job != null && !job.getProgress().equals(progress)) {
                job.setProgress(progress);
                exportJobRepository.save(job);
            }
        } catch (Exception e) {
            log.warn("Failed to update progress for job: {}", jobId, e);
        }
    }
}
