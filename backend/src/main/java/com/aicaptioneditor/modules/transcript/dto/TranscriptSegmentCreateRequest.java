package com.aicaptioneditor.modules.transcript.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptSegmentCreateRequest {

    @NotNull(message = "Start time is required")
    private Double startTime;

    @NotNull(message = "End time is required")
    private Double endTime;

    @NotBlank(message = "Text is required")
    private String text;

    private String speaker;

    private Double confidence;

    private Integer orderIndex;
}
