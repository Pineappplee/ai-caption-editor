package com.aicaptioneditor.modules.user.service;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.user.dto.UserResponseDto;
import com.aicaptioneditor.modules.user.dto.UserUpdateRequest;

public interface UserService {
    UserResponseDto getCurrentUserProfile(User user);
    UserResponseDto updateCurrentUserProfile(User user, UserUpdateRequest request);
    void deleteCurrentUser(User user);
}
