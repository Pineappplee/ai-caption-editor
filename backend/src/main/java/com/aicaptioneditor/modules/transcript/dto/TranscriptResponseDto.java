package com.aicaptioneditor.modules.transcript.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptResponseDto {
    private UUID id;
    private UUID projectId;
    private String language;
    private Integer version;
    private List<TranscriptSegmentResponseDto> segments;
    private Instant createdAt;
    private Instant updatedAt;
}
