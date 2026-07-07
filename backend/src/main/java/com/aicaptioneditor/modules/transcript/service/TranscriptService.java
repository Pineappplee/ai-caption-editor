package com.aicaptioneditor.modules.transcript.service;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.transcript.dto.*;

import java.util.UUID;

public interface TranscriptService {
    TranscriptResponseDto createTranscript(User user, UUID projectId, TranscriptCreateRequest request);
    TranscriptResponseDto getTranscript(User user, UUID projectId);
    TranscriptResponseDto updateTranscript(User user, UUID projectId, TranscriptUpdateRequest request);
    TranscriptSegmentResponseDto patchSegment(User user, UUID projectId, UUID segmentId, TranscriptSegmentUpdateRequest request);
    void deleteSegment(User user, UUID projectId, UUID segmentId);
}
