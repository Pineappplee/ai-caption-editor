package com.aicaptioneditor.modules.user.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
    private String name;

    @Size(max = 2048, message = "Avatar URL must not exceed 2048 characters")
    private String avatarUrl;

    @Size(max = 1000, message = "Bio must not exceed 1000 characters")
    private String bio;
}
