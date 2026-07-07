package com.aicaptioneditor.modules.ai.provider;

import com.aicaptioneditor.modules.ai.dto.CaptionSegmentDto;
import org.springframework.stereotype.Service;
import java.util.List;

@Service("geminiAIProvider")
public class GeminiProvider implements AIProvider {

    @Override
    public String getName() {
        return "gemini";
    }

    @Override
    public String transcribe(byte[] audioData, String language) {
        throw new UnsupportedOperationException("Google Gemini provider is not implemented yet");
    }

    @Override
    public String translate(String text, String targetLanguage) {
        throw new UnsupportedOperationException("Google Gemini provider is not implemented yet");
    }

    @Override
    public String rewrite(String text, String tone, String customPrompt) {
        throw new UnsupportedOperationException("Google Gemini provider is not implemented yet");
    }

    @Override
    public String summarize(String text, Integer maxLength) {
        throw new UnsupportedOperationException("Google Gemini provider is not implemented yet");
    }

    @Override
    public List<CaptionSegmentDto> generateCaptions(String text, String language) {
        throw new UnsupportedOperationException("Google Gemini provider is not implemented yet");
    }

    @Override
    public String improveGrammar(String text) {
        throw new UnsupportedOperationException("Google Gemini provider is not implemented yet");
    }

    @Override
    public String detectLanguage(String text) {
        throw new UnsupportedOperationException("Google Gemini provider is not implemented yet");
    }

    @Override
    public String generateTitle(String text) {
        throw new UnsupportedOperationException("Google Gemini provider is not implemented yet");
    }
}
