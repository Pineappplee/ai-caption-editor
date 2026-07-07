package com.aicaptioneditor.modules.transcript.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptSegmentResponseDto {
    private UUID id;
    private Double startTime;
    private Double endTime;
    private String text;
    private String speaker;
    private Double confidence;
    private Integer orderIndex;
    private Instant createdAt;
    private Instant updatedAt;
}
