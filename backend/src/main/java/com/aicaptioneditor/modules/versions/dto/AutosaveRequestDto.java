package com.aicaptioneditor.modules.versions.dto;

import com.aicaptioneditor.modules.versions.model.ProjectVersionSnapshot;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutosaveRequestDto {

    @Size(max = 255, message = "Message length must not exceed 255 characters")
    private String message;

    private ProjectVersionSnapshot snapshot;
}
