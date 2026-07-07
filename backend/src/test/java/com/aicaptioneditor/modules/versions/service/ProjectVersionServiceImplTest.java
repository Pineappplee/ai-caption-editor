package com.aicaptioneditor.modules.versions.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.BadRequestException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.projects.dto.ProjectResponseDto;
import com.aicaptioneditor.modules.projects.mapper.ProjectMapper;
import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.projects.model.ProjectStatus;
import com.aicaptioneditor.modules.projects.repository.ProjectRepository;
import com.aicaptioneditor.modules.transcript.model.Transcript;
import com.aicaptioneditor.modules.transcript.model.TranscriptSegment;
import com.aicaptioneditor.modules.transcript.repository.TranscriptRepository;
import com.aicaptioneditor.modules.transcript.repository.TranscriptSegmentRepository;
import com.aicaptioneditor.modules.versions.dto.AutosaveRequestDto;
import com.aicaptioneditor.modules.versions.dto.ProjectVersionDetailResponseDto;
import com.aicaptioneditor.modules.versions.dto.ProjectVersionResponseDto;
import com.aicaptioneditor.modules.versions.model.ProjectVersion;
import com.aicaptioneditor.modules.versions.model.ProjectVersionSnapshot;
import com.aicaptioneditor.modules.versions.repository.ProjectVersionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class ProjectVersionServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TranscriptRepository transcriptRepository;

    @Mock
    private TranscriptSegmentRepository transcriptSegmentRepository;

    @Mock
    private ProjectVersionRepository projectVersionRepository;

    @Mock
    private ProjectMapper projectMapper;

    @InjectMocks
    private ProjectVersionServiceImpl projectVersionService;

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
                .title("Test Project")
                .status(ProjectStatus.DRAFT)
                .build();
    }

    @Test
    void saveAutosave_ShouldThrowForbidden_WhenUserIsNotOwner() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        AutosaveRequestDto request = AutosaveRequestDto.builder()
                .message("Test autosave")
                .build();

        ApiException exception = assertThrows(ApiException.class, () ->
                projectVersionService.saveAutosave(otherUser, projectId, request)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void saveAutosave_ShouldCreateAutosaveFromDb_WhenNoSnapshotInRequest() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        Mockito.when(projectVersionRepository.findMaxVersionNumberByProjectId(projectId)).thenReturn(0);
        Mockito.when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.empty());

        Mockito.when(projectVersionRepository.save(any(ProjectVersion.class))).thenAnswer(invocation -> {
            ProjectVersion pv = invocation.getArgument(0);
            pv.setId(UUID.randomUUID());
            pv.setCreatedAt(Instant.now());
            return pv;
        });

        AutosaveRequestDto request = AutosaveRequestDto.builder()
                .message("Auto from DB")
                .build();

        ProjectVersionResponseDto response = projectVersionService.saveAutosave(mockUser, projectId, request);

        assertNotNull(response);
        assertEquals(1, response.getVersionNumber());
        assertEquals("Auto from DB", response.getMessage());
        assertTrue(response.getIsAutoSave());
    }

    @Test
    void getVersions_ShouldReturnSortedList() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        ProjectVersion v1 = ProjectVersion.builder()
                .id(UUID.randomUUID())
                .project(mockProject)
                .versionNumber(1)
                .createdBy(mockUser)
                .isAutoSave(true)
                .createdAt(Instant.now())
                .build();

        ProjectVersion v2 = ProjectVersion.builder()
                .id(UUID.randomUUID())
                .project(mockProject)
                .versionNumber(2)
                .createdBy(mockUser)
                .isAutoSave(true)
                .createdAt(Instant.now())
                .build();

        Mockito.when(projectVersionRepository.findByProjectIdOrderByVersionNumberDesc(projectId))
                .thenReturn(List.of(v2, v1));

        List<ProjectVersionResponseDto> responseList = projectVersionService.getVersions(mockUser, projectId);

        assertEquals(2, responseList.size());
        assertEquals(2, responseList.get(0).getVersionNumber());
        assertEquals(1, responseList.get(1).getVersionNumber());
    }

    @Test
    void getVersion_ShouldReturnDetailWithSnapshot() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        UUID versionId = UUID.randomUUID();
        ProjectVersionSnapshot snapshot = ProjectVersionSnapshot.builder()
                .project(ProjectVersionSnapshot.ProjectSnapshotData.builder()
                        .title("Saved Title")
                        .build())
                .build();

        ProjectVersion pv = ProjectVersion.builder()
                .id(versionId)
                .project(mockProject)
                .versionNumber(1)
                .createdBy(mockUser)
                .isAutoSave(true)
                .snapshot(snapshot)
                .createdAt(Instant.now())
                .build();

        Mockito.when(projectVersionRepository.findById(versionId)).thenReturn(Optional.of(pv));

        ProjectVersionDetailResponseDto response = projectVersionService.getVersion(mockUser, projectId, versionId);

        assertNotNull(response);
        assertEquals(versionId, response.getId());
        assertEquals("Saved Title", response.getSnapshot().getProject().getTitle());
    }

    @Test
    void restoreVersion_ShouldRestoreState() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        UUID versionId = UUID.randomUUID();
        ProjectVersionSnapshot snapshot = ProjectVersionSnapshot.builder()
                .project(ProjectVersionSnapshot.ProjectSnapshotData.builder()
                        .title("Restored Title")
                        .status("ACTIVE")
                        .language("es")
                        .build())
                .transcript(ProjectVersionSnapshot.TranscriptSnapshotData.builder()
                        .language("es")
                        .segments(List.of(
                                ProjectVersionSnapshot.SegmentSnapshotData.builder()
                                        .startTime(0.0)
                                        .endTime(2.5)
                                        .text("Hola")
                                        .orderIndex(0)
                                        .build()
                        ))
                        .build())
                .build();

        ProjectVersion pv = ProjectVersion.builder()
                .id(versionId)
                .project(mockProject)
                .versionNumber(1)
                .createdBy(mockUser)
                .isAutoSave(true)
                .snapshot(snapshot)
                .createdAt(Instant.now())
                .build();

        Mockito.when(projectVersionRepository.findById(versionId)).thenReturn(Optional.of(pv));

        Transcript mockTranscript = Transcript.builder()
                .id(UUID.randomUUID())
                .project(mockProject)
                .build();
        Mockito.when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.of(mockTranscript));
        Mockito.when(transcriptRepository.save(any(Transcript.class))).thenReturn(mockTranscript);
        Mockito.when(transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(mockTranscript.getId()))
                .thenReturn(new ArrayList<>());

        ProjectResponseDto restoredDto = ProjectResponseDto.builder()
                .title("Restored Title")
                .status(ProjectStatus.ACTIVE)
                .build();
        Mockito.when(projectMapper.toResponseDto(any(Project.class))).thenReturn(restoredDto);

        ProjectResponseDto result = projectVersionService.restoreVersion(mockUser, projectId, versionId);

        assertNotNull(result);
        assertEquals("Restored Title", result.getTitle());
        assertEquals(ProjectStatus.ACTIVE, result.getStatus());
        assertEquals("es", mockProject.getLanguage());
        assertEquals("Restored Title", mockProject.getTitle());
    }

    @Test
    void restoreVersion_ShouldThrowBadRequest_WhenSegmentsOverlap() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        UUID versionId = UUID.randomUUID();
        ProjectVersionSnapshot snapshot = ProjectVersionSnapshot.builder()
                .project(ProjectVersionSnapshot.ProjectSnapshotData.builder().title("Title").build())
                .transcript(ProjectVersionSnapshot.TranscriptSnapshotData.builder()
                        .segments(List.of(
                                ProjectVersionSnapshot.SegmentSnapshotData.builder().startTime(0.0).endTime(3.0).text("Seg 1").orderIndex(0).build(),
                                ProjectVersionSnapshot.SegmentSnapshotData.builder().startTime(2.0).endTime(5.0).text("Seg 2 (overlap)").orderIndex(1).build()
                        ))
                        .build())
                .build();

        ProjectVersion pv = ProjectVersion.builder()
                .id(versionId)
                .project(mockProject)
                .versionNumber(1)
                .createdBy(mockUser)
                .snapshot(snapshot)
                .build();

        Mockito.when(projectVersionRepository.findById(versionId)).thenReturn(Optional.of(pv));

        Transcript mockTranscript = Transcript.builder().id(UUID.randomUUID()).project(mockProject).build();
        Mockito.when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.of(mockTranscript));
        Mockito.when(transcriptRepository.save(any(Transcript.class))).thenReturn(mockTranscript);

        assertThrows(BadRequestException.class, () ->
                projectVersionService.restoreVersion(mockUser, projectId, versionId)
        );
    }
}
