package com.aicaptioneditor.modules.user.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.repository.UserRepository;
import com.aicaptioneditor.modules.user.dto.UserResponseDto;
import com.aicaptioneditor.modules.user.dto.UserUpdateRequest;
import com.aicaptioneditor.modules.user.mapper.UserMapper;
import com.aicaptioneditor.modules.user.provider.UserProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserProvider userProvider;

    @Override
    @Transactional(readOnly = true)
    public UserResponseDto getCurrentUserProfile(User principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException("User profile not found", HttpStatus.NOT_FOUND));
        return userMapper.toResponseDto(user);
    }

    @Override
    @Transactional
    public UserResponseDto updateCurrentUserProfile(User principal, UserUpdateRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException("User profile not found", HttpStatus.NOT_FOUND));

        userMapper.updateEntityFromRequest(request, user);
        User updatedUser = userRepository.save(user);
        log.info("User profile updated for email: {}", updatedUser.getEmail());
        return userMapper.toResponseDto(updatedUser);
    }

    @Override
    @Transactional
    public void deleteCurrentUser(User principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ApiException("User profile not found", HttpStatus.NOT_FOUND));

        userProvider.onDeleteUser(user);
        userRepository.delete(user);
        log.info("User profile and all associated data deleted for email: {}", user.getEmail());
    }
}
