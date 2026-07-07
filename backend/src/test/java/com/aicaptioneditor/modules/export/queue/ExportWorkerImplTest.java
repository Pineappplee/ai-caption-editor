package com.aicaptioneditor.modules.export.queue;

import com.aicaptioneditor.modules.auth.model.User;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
public class ExportWorkerImplTest {

    @Mock
    private ExportJobRepository exportJobRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TranscriptRepository transcriptRepository;

    @Mock
    private TranscriptSegmentRepository transcriptSegmentRepository;

    @Mock
    private MediaAssetRepository mediaAssetRepository;

    @Mock
    private ExportProcessor exportProcessor;

    @InjectMocks
    private ExportWorkerImpl exportWorker;

    private User owner;
    private Project project;
    private UUID projectId;
    private UUID jobId;
    private ExportJob exportJob;
    private MediaAsset mediaAsset;
    private Transcript transcript;
    private List<TranscriptSegment> segments;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        owner = User.builder()
                .id(userId)
                .name("Alice")
                .email("alice@example.com")
                .build();

        projectId = UUID.randomUUID();
        project = Project.builder()
                .id(projectId)
                .title("Test video")
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

        mediaAsset = MediaAsset.builder()
                .id(UUID.randomUUID())
                .project(project)
                .owner(owner)
                .fileName("generated.mp4")
                .originalName("input.mp4")
                .mimeType("video/mp4")
                .size(5000000L)
                .storagePath("users/" + userId + "/" + projectId + "/generated.mp4")
                .provider("LOCAL")
                .build();

        transcript = Transcript.builder()
                .id(UUID.randomUUID())
                .project(project)
                .language("en")
                .build();

        segments = new ArrayList<>();
        segments.add(TranscriptSegment.builder()
                .id(UUID.randomUUID())
                .transcript(transcript)
                .startTime(1.0)
                .endTime(4.5)
                .text("First segment subtitle")
                .orderIndex(1)
                .build());
    }

    @Test
    void processJob_ShouldSucceedAndMarkCompleted_WhenProcessorRunsSuccessfully() throws Exception {
        Mockito.when(exportJobRepository.findById(jobId)).thenReturn(Optional.of(exportJob));
        Mockito.when(mediaAssetRepository.findByProjectIdAndOwnerId(projectId, owner.getId()))
                .thenReturn(List.of(mediaAsset));
        Mockito.when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.of(transcript));
        Mockito.when(transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId()))
                .thenReturn(segments);

        // Mock processor invocation
        Mockito.doAnswer(invocation -> {
            Consumer<Integer> progressConsumer = invocation.getArgument(3);
            progressConsumer.accept(50);
            return null;
        }).when(exportProcessor).process(any(ExportJob.class), any(MediaAsset.class), any(), any());

        Mockito.when(exportJobRepository.save(any(ExportJob.class))).thenAnswer(invocation -> invocation.getArgument(0));

        exportWorker.processJob(jobId);

        assertEquals(ExportStatus.COMPLETED, exportJob.getStatus());
        assertEquals(100, exportJob.getProgress());
        assertNotNull(exportJob.getCompletedAt());
        assertNull(exportJob.getErrorMessage());
    }

    @Test
    void processJob_ShouldMarkFailed_WhenMediaAssetsAreMissing() {
        Mockito.when(exportJobRepository.findById(jobId)).thenReturn(Optional.of(exportJob));
        Mockito.when(mediaAssetRepository.findByProjectIdAndOwnerId(projectId, owner.getId()))
                .thenReturn(List.of());

        Mockito.when(exportJobRepository.save(any(ExportJob.class))).thenAnswer(invocation -> invocation.getArgument(0));

        exportWorker.processJob(jobId);

        assertEquals(ExportStatus.FAILED, exportJob.getStatus());
        assertTrue(exportJob.getErrorMessage().contains("No media assets found"));
        assertNotNull(exportJob.getCompletedAt());
    }

    @Test
    void processJob_ShouldMarkFailed_WhenProcessorThrowsException() throws Exception {
        Mockito.when(exportJobRepository.findById(jobId)).thenReturn(Optional.of(exportJob));
        Mockito.when(mediaAssetRepository.findByProjectIdAndOwnerId(projectId, owner.getId()))
                .thenReturn(List.of(mediaAsset));
        Mockito.when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.of(transcript));
        Mockito.when(transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId()))
                .thenReturn(segments);

        Mockito.doThrow(new RuntimeException("Transcode error"))
                .when(exportProcessor).process(any(ExportJob.class), any(MediaAsset.class), any(), any());

        Mockito.when(exportJobRepository.save(any(ExportJob.class))).thenAnswer(invocation -> invocation.getArgument(0));

        exportWorker.processJob(jobId);

        assertEquals(ExportStatus.FAILED, exportJob.getStatus());
        assertTrue(exportJob.getErrorMessage().contains("Transcode error"));
        assertNotNull(exportJob.getCompletedAt());
    }
}
