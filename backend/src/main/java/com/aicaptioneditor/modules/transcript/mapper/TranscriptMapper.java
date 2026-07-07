package com.aicaptioneditor.modules.transcript.mapper;

import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.transcript.dto.*;
import com.aicaptioneditor.modules.transcript.model.Transcript;
import com.aicaptioneditor.modules.transcript.model.TranscriptSegment;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TranscriptMapper {

    public TranscriptResponseDto toResponseDto(Transcript transcript, List<TranscriptSegment> segments) {
        if (transcript == null) {
            return null;
        }

        List<TranscriptSegmentResponseDto> segmentDtos = segments != null 
                ? segments.stream().map(this::toResponseDto).collect(Collectors.toList())
                : Collections.emptyList();

        return TranscriptResponseDto.builder()
                .id(transcript.getId())
                .projectId(transcript.getProject() != null ? transcript.getProject().getId() : null)
                .language(transcript.getLanguage())
                .version(transcript.getVersion())
                .segments(segmentDtos)
                .createdAt(transcript.getCreatedAt())
                .updatedAt(transcript.getUpdatedAt())
                .build();
    }

    public TranscriptSegmentResponseDto toResponseDto(TranscriptSegment segment) {
        if (segment == null) {
            return null;
        }

        return TranscriptSegmentResponseDto.builder()
                .id(segment.getId())
                .startTime(segment.getStartTime())
                .endTime(segment.getEndTime())
                .text(segment.getText())
                .speaker(segment.getSpeaker())
                .confidence(segment.getConfidence())
                .orderIndex(segment.getOrderIndex())
                .createdAt(segment.getCreatedAt())
                .updatedAt(segment.getUpdatedAt())
                .build();
    }

    public Transcript toEntity(TranscriptCreateRequest request, Project project) {
        if (request == null) {
            return null;
        }

        return Transcript.builder()
                .project(project)
                .language(request.getLanguage())
                .build();
    }

    public TranscriptSegment toEntity(TranscriptSegmentCreateRequest request, Transcript transcript) {
        if (request == null) {
            return null;
        }

        return TranscriptSegment.builder()
                .transcript(transcript)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .text(request.getText())
                .speaker(request.getSpeaker())
                .confidence(request.getConfidence())
                .orderIndex(request.getOrderIndex())
                .build();
    }
}
