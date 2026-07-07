package com.aicaptioneditor.modules.ai.service;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.ai.dto.*;

public interface AIService {
    TranscribeResponse transcribe(User user, TranscribeRequest request);
    RewriteResponse rewrite(User user, RewriteRequest request);
    TranslateResponse translate(User user, TranslateRequest request);
    SummarizeResponse summarize(User user, SummarizeRequest request);
    GenerateCaptionsResponse generateCaptions(User user, GenerateCaptionsRequest request);
}
