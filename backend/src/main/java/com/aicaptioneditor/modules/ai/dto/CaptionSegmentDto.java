package com.aicaptioneditor.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaptionSegmentDto {
    private String text;
    private Double startTime;
    private Double endTime;
    private String speaker;
    private Double confidence;
    private Integer orderIndex;
}
