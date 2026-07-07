package com.aicaptioneditor.modules.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewriteRequest {
    @NotBlank(message = "Text is required")
    private String text;
    
    private String tone;
    
    private String prompt;
}
