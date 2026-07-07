package com.aicaptioneditor.modules.media.service;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.media.dto.MediaAssetResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MediaService {
    MediaAssetResponseDto uploadMedia(MultipartFile file, UUID projectId, User user);
    List<MediaAssetResponseDto> getProjectMedia(UUID projectId, User user);
    void deleteMedia(UUID id, User user);
}
