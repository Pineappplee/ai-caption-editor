package com.aicaptioneditor.modules.transcript.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptSegmentUpdateRequest {
    private Double startTime;
    private Double endTime;
    private String text;
    private String speaker;
    private Double confidence;
    private Integer orderIndex;
}
