package com.aicaptioneditor.modules.repository;

import com.aicaptioneditor.modules.auth.model.RefreshToken;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.auth.repository.RefreshTokenRepository;
import com.aicaptioneditor.modules.auth.repository.UserRepository;
import com.aicaptioneditor.modules.export.model.ExportJob;
import com.aicaptioneditor.modules.export.model.ExportStatus;
import com.aicaptioneditor.modules.export.repository.ExportJobRepository;
import com.aicaptioneditor.modules.media.model.MediaAsset;
import com.aicaptioneditor.modules.media.repository.MediaAssetRepository;
import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.projects.model.ProjectStatus;
import com.aicaptioneditor.modules.projects.repository.ProjectRepository;
import com.aicaptioneditor.modules.transcript.model.Transcript;
import com.aicaptioneditor.modules.transcript.model.TranscriptSegment;
import com.aicaptioneditor.modules.transcript.repository.TranscriptRepository;
import com.aicaptioneditor.modules.transcript.repository.TranscriptSegmentRepository;
import com.aicaptioneditor.modules.versions.model.ProjectVersion;
import com.aicaptioneditor.modules.versions.model.ProjectVersionSnapshot;
import com.aicaptioneditor.modules.versions.repository.ProjectVersionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class RepositoryTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TranscriptRepository transcriptRepository;

    @Autowired
    private TranscriptSegmentRepository transcriptSegmentRepository;

    @Autowired
    private ProjectVersionRepository projectVersionRepository;

    @Autowired
    private ExportJobRepository exportJobRepository;

    @Autowired
    private MediaAssetRepository mediaAssetRepository;

    @Test
    void testAllRepositoriesFlow() {
        // 1. Test UserRepository
        String email = "repo-test-" + UUID.randomUUID() + "@example.com";
        User user = User.builder()
                .name("Repo Tester")
                .email(email)
                .passwordHash("hash")
                .plan(UserPlan.free)
                .build();
        User savedUser = userRepository.save(user);
        assertNotNull(savedUser.getId());
        assertTrue(userRepository.existsByEmail(email));
        
        Optional<User> foundUser = userRepository.findByEmail(email);
        assertTrue(foundUser.isPresent());
        assertEquals("Repo Tester", foundUser.get().getName());

        // 2. Test RefreshTokenRepository
        RefreshToken refreshToken = RefreshToken.builder()
                .token("token-" + UUID.randomUUID())
                .user(savedUser)
                .expiryDate(Instant.now().plusSeconds(60))
                .build();
        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);
        assertNotNull(savedToken.getId());
        
        Optional<RefreshToken> foundToken = refreshTokenRepository.findByToken(savedToken.getToken());
        assertTrue(foundToken.isPresent());
        assertEquals(savedUser.getId(), foundToken.get().getUser().getId());

        // 3. Test ProjectRepository
        Project project = Project.builder()
                .title("Repo Test Video")
                .user(savedUser)
                .status(ProjectStatus.DRAFT)
                .language("en")
                .build();
        Project savedProject = projectRepository.save(project);
        assertNotNull(savedProject.getId());
        org.springframework.data.domain.Page<Project> userProjects = projectRepository.findByUser(savedUser, org.springframework.data.domain.PageRequest.of(0, 10));
        assertFalse(userProjects.isEmpty());
        assertEquals(savedProject.getId(), userProjects.getContent().get(0).getId());

        // 4. Test TranscriptRepository
        Transcript transcript = Transcript.builder()
                .project(savedProject)
                .language("en")
                .build();
        Transcript savedTranscript = transcriptRepository.save(transcript);
        assertNotNull(savedTranscript.getId());
        
        Optional<Transcript> foundTranscript = transcriptRepository.findByProjectId(savedProject.getId());
        assertTrue(foundTranscript.isPresent());
        assertEquals(savedTranscript.getId(), foundTranscript.get().getId());

        // 5. Test TranscriptSegmentRepository
        TranscriptSegment segment = TranscriptSegment.builder()
                .transcript(savedTranscript)
                .startTime(100.0)
                .endTime(200.0)
                .text("Hello world")
                .orderIndex(0)
                .build();
        TranscriptSegment savedSegment = transcriptSegmentRepository.save(segment);
        assertNotNull(savedSegment.getId());

        List<TranscriptSegment> segments = transcriptSegmentRepository
                .findByTranscriptIdOrderByOrderIndexAsc(savedTranscript.getId());
        assertFalse(segments.isEmpty());
        assertEquals(savedSegment.getId(), segments.get(0).getId());
        assertEquals("Hello world", segments.get(0).getText());

        // 6. Test ProjectVersionRepository
        ProjectVersion version = ProjectVersion.builder()
                .project(savedProject)
                .versionNumber(1)
                .createdBy(savedUser)
                .message("Initial Version")
                .isAutoSave(false)
                .snapshot(ProjectVersionSnapshot.builder()
                        .project(ProjectVersionSnapshot.ProjectSnapshotData.builder()
                                .title("Version Title")
                                .build())
                        .build())
                .build();
        ProjectVersion savedVersion = projectVersionRepository.save(version);
        assertNotNull(savedVersion.getId());

        List<ProjectVersion> versions = projectVersionRepository
                .findByProjectIdOrderByVersionNumberDesc(savedProject.getId());
        assertFalse(versions.isEmpty());
        assertEquals(savedVersion.getId(), versions.get(0).getId());
        
        Integer maxVersion = projectVersionRepository.findMaxVersionNumberByProjectId(savedProject.getId());
        assertEquals(1, maxVersion);

        // 7. Test ExportJobRepository
        ExportJob exportJob = ExportJob.builder()
                .project(savedProject)
                .format("mp4")
                .status(ExportStatus.QUEUED)
                .progress(0)
                .build();
        ExportJob savedJob = exportJobRepository.save(exportJob);
        assertNotNull(savedJob.getId());

        List<ExportJob> jobs = exportJobRepository.findByProjectIdOrderByCreatedAtDesc(savedProject.getId());
        assertFalse(jobs.isEmpty());
        assertEquals(savedJob.getId(), jobs.get(0).getId());

        // 8. Test MediaAssetRepository
        MediaAsset mediaAsset = MediaAsset.builder()
                .project(savedProject)
                .owner(savedUser)
                .fileName("video.mp4")
                .originalName("video.mp4")
                .mimeType("video/mp4")
                .size(1024L)
                .storagePath("users/tester/video.mp4")
                .provider("LOCAL")
                .build();
        MediaAsset savedAsset = mediaAssetRepository.save(mediaAsset);
        assertNotNull(savedAsset.getId());

        List<MediaAsset> assets = mediaAssetRepository
                .findByProjectIdAndOwnerId(savedProject.getId(), savedUser.getId());
        assertFalse(assets.isEmpty());
        assertEquals(savedAsset.getId(), assets.get(0).getId());

        // Clean up & Cascade validation check
        refreshTokenRepository.delete(savedToken);
        userRepository.delete(savedUser);
        
        // Assert that cascade delete cleared everything
        assertFalse(userRepository.existsById(savedUser.getId()));
        assertFalse(projectRepository.existsById(savedProject.getId()));
        assertFalse(transcriptRepository.existsById(savedTranscript.getId()));
        assertFalse(transcriptSegmentRepository.existsById(savedSegment.getId()));
        assertFalse(projectVersionRepository.existsById(savedVersion.getId()));
        assertFalse(exportJobRepository.existsById(savedJob.getId()));
        assertFalse(mediaAssetRepository.existsById(savedAsset.getId()));
    }
}
