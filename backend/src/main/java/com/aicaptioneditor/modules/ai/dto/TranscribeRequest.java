package com.aicaptioneditor.modules.ai.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscribeRequest {
    @NotNull(message = "Media asset ID is required")
    private UUID mediaAssetId;
    
    private String language;
}
