package com.aicaptioneditor.modules.export.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportRequestDto {

    @NotBlank(message = "Format is required")
    private String format;
}
