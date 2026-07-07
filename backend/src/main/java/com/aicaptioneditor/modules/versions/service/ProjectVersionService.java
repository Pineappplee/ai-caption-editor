package com.aicaptioneditor.modules.versions.service;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.projects.dto.ProjectResponseDto;
import com.aicaptioneditor.modules.versions.dto.AutosaveRequestDto;
import com.aicaptioneditor.modules.versions.dto.ProjectVersionDetailResponseDto;
import com.aicaptioneditor.modules.versions.dto.ProjectVersionResponseDto;

import java.util.List;
import java.util.UUID;

public interface ProjectVersionService {

    ProjectVersionResponseDto saveAutosave(User user, UUID projectId, AutosaveRequestDto request);

    List<ProjectVersionResponseDto> getVersions(User user, UUID projectId);

    ProjectVersionDetailResponseDto getVersion(User user, UUID projectId, UUID versionId);

    ProjectResponseDto restoreVersion(User user, UUID projectId, UUID versionId);
}
