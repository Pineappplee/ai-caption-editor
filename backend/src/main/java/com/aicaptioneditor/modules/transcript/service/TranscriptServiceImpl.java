package com.aicaptioneditor.modules.transcript.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.BadRequestException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.projects.repository.ProjectRepository;
import com.aicaptioneditor.modules.transcript.dto.*;
import com.aicaptioneditor.modules.transcript.mapper.TranscriptMapper;
import com.aicaptioneditor.modules.transcript.model.Transcript;
import com.aicaptioneditor.modules.transcript.model.TranscriptSegment;
import com.aicaptioneditor.modules.transcript.repository.TranscriptRepository;
import com.aicaptioneditor.modules.transcript.repository.TranscriptSegmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TranscriptServiceImpl implements TranscriptService {

    private final ProjectRepository projectRepository;
    private final TranscriptRepository transcriptRepository;
    private final TranscriptSegmentRepository transcriptSegmentRepository;
    private final TranscriptMapper transcriptMapper;

    @Override
    @Transactional
    public TranscriptResponseDto createTranscript(User user, UUID projectId, TranscriptCreateRequest request) {
        Project project = getProjectAndValidateOwner(user, projectId);

        // One transcript per project
        if (transcriptRepository.findByProjectId(projectId).isPresent()) {
            throw new BadRequestException("Transcript already exists for project: " + projectId);
        }

        Transcript transcript = transcriptMapper.toEntity(request, project);
        Transcript savedTranscript = transcriptRepository.save(transcript);

        List<TranscriptSegment> segments = new ArrayList<>();
        if (request.getSegments() != null) {
            segments = request.getSegments().stream()
                    .map(req -> transcriptMapper.toEntity(req, savedTranscript))
                    .sorted(Comparator.comparing(TranscriptSegment::getStartTime))
                    .toList();

            // Re-assign order index sequentially to guarantee chronological orderIndex matching startTime
            for (int i = 0; i < segments.size(); i++) {
                segments.get(i).setOrderIndex(i);
            }

            validateSegments(segments);
            segments = transcriptSegmentRepository.saveAll(segments);
        }

        return transcriptMapper.toResponseDto(savedTranscript, segments);
    }

    @Override
    @Transactional(readOnly = true)
    public TranscriptResponseDto getTranscript(User user, UUID projectId) {
        getProjectAndValidateOwner(user, projectId);

        Transcript transcript = transcriptRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Transcript not found for project: " + projectId));

        List<TranscriptSegment> segments = transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId());
        return transcriptMapper.toResponseDto(transcript, segments);
    }

    @Override
    @Transactional
    public TranscriptResponseDto updateTranscript(User user, UUID projectId, TranscriptUpdateRequest request) {
        getProjectAndValidateOwner(user, projectId);

        Transcript transcript = transcriptRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Transcript not found for project: " + projectId));

        // Update language
        transcript.setLanguage(request.getLanguage());
        transcript.setUpdatedAt(Instant.now());
        Transcript savedTranscript = transcriptRepository.save(transcript);

        // Delete existing segments
        List<TranscriptSegment> existingSegments = transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId());
        transcriptSegmentRepository.deleteAll(existingSegments);

        List<TranscriptSegment> newSegments = new ArrayList<>();
        if (request.getSegments() != null) {
            newSegments = request.getSegments().stream()
                    .map(req -> transcriptMapper.toEntity(req, savedTranscript))
                    .sorted(Comparator.comparing(TranscriptSegment::getStartTime))
                    .toList();

            for (int i = 0; i < newSegments.size(); i++) {
                newSegments.get(i).setOrderIndex(i);
            }

            validateSegments(newSegments);
            newSegments = transcriptSegmentRepository.saveAll(newSegments);
        }

        return transcriptMapper.toResponseDto(savedTranscript, newSegments);
    }

    @Override
    @Transactional
    public TranscriptSegmentResponseDto patchSegment(User user, UUID projectId, UUID segmentId, TranscriptSegmentUpdateRequest request) {
        // Ensure project exists and user has access
        getProjectAndValidateOwner(user, projectId);

        TranscriptSegment segment = transcriptSegmentRepository.findById(segmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Segment not found with id: " + segmentId));

        Transcript transcript = segment.getTranscript();
        
        // Safety check: ensure segment belongs to the project
        if (!transcript.getProject().getId().equals(projectId)) {
            throw new ApiException("Segment does not belong to the specified project", HttpStatus.BAD_REQUEST);
        }

        // Apply fields if present in request
        if (request.getStartTime() != null) {
            segment.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            segment.setEndTime(request.getEndTime());
        }
        if (request.getText() != null) {
            segment.setText(request.getText());
        }
        if (request.getSpeaker() != null) {
            segment.setSpeaker(request.getSpeaker());
        }
        if (request.getConfidence() != null) {
            segment.setConfidence(request.getConfidence());
        }
        if (request.getOrderIndex() != null) {
            segment.setOrderIndex(request.getOrderIndex());
        }

        // Get all segments for validation
        List<TranscriptSegment> allSegments = transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId());
        
        // Substitute updated segment in list for validation
        List<TranscriptSegment> checkList = allSegments.stream()
                .map(s -> s.getId().equals(segmentId) ? segment : s)
                .toList();

        validateSegments(checkList);

        // Re-sort and re-index sequentially to guarantee strict chronological orderIndex
        List<TranscriptSegment> sortedList = checkList.stream()
                .sorted(Comparator.comparing(TranscriptSegment::getStartTime))
                .toList();
        for (int i = 0; i < sortedList.size(); i++) {
            sortedList.get(i).setOrderIndex(i);
        }

        transcriptSegmentRepository.saveAll(sortedList);

        // Touch the transcript to update updatedAt and trigger version increment
        transcript.setUpdatedAt(Instant.now());
        transcriptRepository.save(transcript);

        // Fetch segment again to get the updated fields
        TranscriptSegment updatedSegment = transcriptSegmentRepository.findById(segmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Segment not found with id: " + segmentId));

        return transcriptMapper.toResponseDto(updatedSegment);
    }

    @Override
    @Transactional
    public void deleteSegment(User user, UUID projectId, UUID segmentId) {
        // Ensure project exists and user has access
        getProjectAndValidateOwner(user, projectId);

        TranscriptSegment segment = transcriptSegmentRepository.findById(segmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Segment not found with id: " + segmentId));

        Transcript transcript = segment.getTranscript();
        
        // Safety check: ensure segment belongs to the project
        if (!transcript.getProject().getId().equals(projectId)) {
            throw new ApiException("Segment does not belong to the specified project", HttpStatus.BAD_REQUEST);
        }

        transcriptSegmentRepository.delete(segment);

        // Fetch remaining, sort and re-index sequentially
        List<TranscriptSegment> remaining = transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId())
                .stream()
                .filter(s -> !s.getId().equals(segmentId))
                .sorted(Comparator.comparing(TranscriptSegment::getStartTime))
                .toList();

        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setOrderIndex(i);
        }
        transcriptSegmentRepository.saveAll(remaining);

        // Touch the transcript to update updatedAt and trigger version increment
        transcript.setUpdatedAt(Instant.now());
        transcriptRepository.save(transcript);
    }

    private Project getProjectAndValidateOwner(User user, UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (!project.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have permission to access this project", HttpStatus.FORBIDDEN);
        }

        return project;
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

        // Validate overlapping timestamps
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
