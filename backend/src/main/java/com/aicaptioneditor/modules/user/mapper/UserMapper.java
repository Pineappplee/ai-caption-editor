package com.aicaptioneditor.modules.user.mapper;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.user.dto.UserResponseDto;
import com.aicaptioneditor.modules.user.dto.UserUpdateRequest;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponseDto toResponseDto(User user) {
        if (user == null) {
            return null;
        }

        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .plan(user.getPlan())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public void updateEntityFromRequest(UserUpdateRequest request, User user) {
        if (request == null || user == null) {
            return;
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
    }
}
