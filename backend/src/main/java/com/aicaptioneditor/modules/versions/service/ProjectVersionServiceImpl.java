package com.aicaptioneditor.modules.versions.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.BadRequestException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectVersionServiceImpl implements ProjectVersionService {

    private final ProjectRepository projectRepository;
    private final TranscriptRepository transcriptRepository;
    private final TranscriptSegmentRepository transcriptSegmentRepository;
    private final ProjectVersionRepository projectVersionRepository;
    private final ProjectMapper projectMapper;

    @Override
    @Transactional
    public ProjectVersionResponseDto saveAutosave(User user, UUID projectId, AutosaveRequestDto request) {
        Project project = getProjectAndValidateOwner(user, projectId);

        ProjectVersionSnapshot snapshot = request.getSnapshot();
        if (snapshot == null) {
            snapshot = buildSnapshotFromDb(project);
        }

        Integer nextVersionNum = projectVersionRepository.findMaxVersionNumberByProjectId(projectId) + 1;

        ProjectVersion projectVersion = ProjectVersion.builder()
                .project(project)
                .versionNumber(nextVersionNum)
                .snapshot(snapshot)
                .createdBy(user)
                .isAutoSave(true)
                .message(request.getMessage())
                .build();

        ProjectVersion saved = projectVersionRepository.save(projectVersion);
        return mapToResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectVersionResponseDto> getVersions(User user, UUID projectId) {
        getProjectAndValidateOwner(user, projectId);
        List<ProjectVersion> versions = projectVersionRepository.findByProjectIdOrderByVersionNumberDesc(projectId);
        return versions.stream().map(this::mapToResponseDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectVersionDetailResponseDto getVersion(User user, UUID projectId, UUID versionId) {
        getProjectAndValidateOwner(user, projectId);

        ProjectVersion version = projectVersionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Version not found with id: " + versionId));

        if (!version.getProject().getId().equals(projectId)) {
            throw new ApiException("Version does not belong to the specified project", HttpStatus.BAD_REQUEST);
        }

        return mapToDetailResponseDto(version);
    }

    @Override
    @Transactional
    public ProjectResponseDto restoreVersion(User user, UUID projectId, UUID versionId) {
        Project project = getProjectAndValidateOwner(user, projectId);

        ProjectVersion version = projectVersionRepository.findById(versionId)
                .orElseThrow(() -> new ResourceNotFoundException("Version not found with id: " + versionId));

        if (!version.getProject().getId().equals(projectId)) {
            throw new ApiException("Version does not belong to the specified project", HttpStatus.BAD_REQUEST);
        }

        ProjectVersionSnapshot snapshot = version.getSnapshot();
        if (snapshot == null) {
            throw new ApiException("Snapshot is empty or invalid for version: " + versionId, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Restore project metadata
        ProjectVersionSnapshot.ProjectSnapshotData projectData = snapshot.getProject();
        if (projectData != null) {
            project.setTitle(projectData.getTitle());
            project.setDescription(projectData.getDescription());
            if (projectData.getStatus() != null) {
                try {
                    project.setStatus(ProjectStatus.valueOf(projectData.getStatus()));
                } catch (IllegalArgumentException e) {
                    project.setStatus(ProjectStatus.DRAFT);
                }
            }
            project.setLanguage(projectData.getLanguage());
            project.setThumbnailUrl(projectData.getThumbnailUrl());
            project.setUpdatedAt(Instant.now());
            projectRepository.save(project);
        }

        // Restore transcript and segments
        ProjectVersionSnapshot.TranscriptSnapshotData transcriptData = snapshot.getTranscript();
        if (transcriptData != null) {
            Transcript transcript = transcriptRepository.findByProjectId(projectId)
                    .orElseGet(() -> Transcript.builder().project(project).build());

            transcript.setLanguage(transcriptData.getLanguage());
            transcript.setUpdatedAt(Instant.now());
            Transcript savedTranscript = transcriptRepository.save(transcript);

            // Delete existing segments
            List<TranscriptSegment> existingSegments = transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(savedTranscript.getId());
            transcriptSegmentRepository.deleteAll(existingSegments);

            // Save new segments
            if (transcriptData.getSegments() != null) {
                List<TranscriptSegment> newSegments = transcriptData.getSegments().stream()
                        .map(segData -> TranscriptSegment.builder()
                                .transcript(savedTranscript)
                                .startTime(segData.getStartTime())
                                .endTime(segData.getEndTime())
                                .text(segData.getText())
                                .speaker(segData.getSpeaker())
                                .confidence(segData.getConfidence())
                                .orderIndex(segData.getOrderIndex())
                                .build())
                        .sorted(Comparator.comparing(TranscriptSegment::getStartTime))
                        .toList();

                for (int i = 0; i < newSegments.size(); i++) {
                    newSegments.get(i).setOrderIndex(i);
                }

                validateSegments(newSegments);
                transcriptSegmentRepository.saveAll(newSegments);
            }
        } else {
            // Delete transcript if the restored state doesn't have one
            transcriptRepository.findByProjectId(projectId).ifPresent(transcriptRepository::delete);
        }

        return projectMapper.toResponseDto(project);
    }

    private Project getProjectAndValidateOwner(User user, UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!project.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have permission to access this project", HttpStatus.FORBIDDEN);
        }

        return project;
    }

    private ProjectVersionSnapshot buildSnapshotFromDb(Project project) {
        ProjectVersionSnapshot.ProjectSnapshotData projectData = ProjectVersionSnapshot.ProjectSnapshotData.builder()
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus() != null ? project.getStatus().name() : null)
                .language(project.getLanguage())
                .thumbnailUrl(project.getThumbnailUrl())
                .build();

        Optional<Transcript> transcriptOpt = transcriptRepository.findByProjectId(project.getId());
        ProjectVersionSnapshot.TranscriptSnapshotData transcriptData = null;

        if (transcriptOpt.isPresent()) {
            Transcript transcript = transcriptOpt.get();
            List<TranscriptSegment> segments = transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId());

            List<ProjectVersionSnapshot.SegmentSnapshotData> segmentDatas = segments.stream()
                    .map(seg -> ProjectVersionSnapshot.SegmentSnapshotData.builder()
                            .startTime(seg.getStartTime())
                            .endTime(seg.getEndTime())
                            .text(seg.getText())
                            .speaker(seg.getSpeaker())
                            .confidence(seg.getConfidence())
                            .orderIndex(seg.getOrderIndex())
                            .build())
                    .toList();

            transcriptData = ProjectVersionSnapshot.TranscriptSnapshotData.builder()
                    .language(transcript.getLanguage())
                    .segments(segmentDatas)
                    .build();
        }

        return ProjectVersionSnapshot.builder()
                .project(projectData)
                .transcript(transcriptData)
                .build();
    }

    private ProjectVersionResponseDto mapToResponseDto(ProjectVersion version) {
        return ProjectVersionResponseDto.builder()
                .id(version.getId())
                .projectId(version.getProject().getId())
                .versionNumber(version.getVersionNumber())
                .createdBy(version.getCreatedBy().getId())
                .createdAt(version.getCreatedAt())
                .isAutoSave(version.getIsAutoSave())
                .message(version.getMessage())
                .build();
    }

    private ProjectVersionDetailResponseDto mapToDetailResponseDto(ProjectVersion version) {
        return ProjectVersionDetailResponseDto.builder()
                .id(version.getId())
                .projectId(version.getProject().getId())
                .versionNumber(version.getVersionNumber())
                .createdBy(version.getCreatedBy().getId())
                .createdAt(version.getCreatedAt())
                .isAutoSave(version.getIsAutoSave())
                .message(version.getMessage())
                .snapshot(version.getSnapshot())
                .build();
    }

    private void validateSegments(List<TranscriptSegment> segments) {
        if (segments == null || segments.isEmpty()) {
            return;
        }

        for (TranscriptSegment segment : segments) {
            if (segment.getStartTime() == null || segment.getEndTime() == null) {
                throw new BadRequestException("Start time and end time must not be null");
            }
            if (segment.getStartTime() < 0) {
                throw new BadRequestException("Start time cannot be negative: " + segment.getStartTime());
            }
            if (segment.getStartTime() >= segment.getEndTime()) {
                throw new BadRequestException("Start time must be less than end time: " + segment.getStartTime() + " >= " + segment.getEndTime());
            }
        }

        List<TranscriptSegment> sorted = segments.stream()
                .sorted(Comparator.comparing(TranscriptSegment::getStartTime))
                .toList();

        for (int i = 0; i < sorted.size() - 1; i++) {
            TranscriptSegment current = sorted.get(i);
            TranscriptSegment next = sorted.get(i + 1);
            if (current.getEndTime() > next.getStartTime()) {
                throw new BadRequestException(String.format(
                        "Overlapping timestamps detected: segment ending at %f overlaps with next segment starting at %f",
                        current.getEndTime(), next.getStartTime()
                ));
            }
        }
    }
}
