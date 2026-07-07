package com.aicaptioneditor.modules.user.dto;

import com.aicaptioneditor.modules.auth.model.UserPlan;
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
public class UserResponseDto {
    private UUID id;
    private String name;
    private String email;
    private String avatarUrl;
    private String bio;
    private UserPlan plan;
    private Instant createdAt;
    private Instant updatedAt;
}
