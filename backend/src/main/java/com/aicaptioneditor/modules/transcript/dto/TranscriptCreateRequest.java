package com.aicaptioneditor.modules.transcript.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptCreateRequest {

    @NotBlank(message = "Language is required")
    private String language;

    @Valid
    private List<TranscriptSegmentCreateRequest> segments;
}
