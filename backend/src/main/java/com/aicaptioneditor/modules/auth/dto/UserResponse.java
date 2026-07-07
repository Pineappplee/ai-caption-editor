package com.aicaptioneditor.modules.auth.dto;

import com.aicaptioneditor.modules.auth.model.UserPlan;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String avatarUrl;
    private UserPlan plan;
}
