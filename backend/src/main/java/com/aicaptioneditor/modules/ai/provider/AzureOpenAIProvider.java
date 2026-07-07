package com.aicaptioneditor.modules.ai.provider;

import com.aicaptioneditor.modules.ai.dto.CaptionSegmentDto;
import org.springframework.stereotype.Service;
import java.util.List;

@Service("azureopenaiAIProvider")
public class AzureOpenAIProvider implements AIProvider {

    @Override
    public String getName() {
        return "azure";
    }

    @Override
    public String transcribe(byte[] audioData, String language) {
        throw new UnsupportedOperationException("Azure OpenAI provider is not implemented yet");
    }

    @Override
    public String translate(String text, String targetLanguage) {
        throw new UnsupportedOperationException("Azure OpenAI provider is not implemented yet");
    }

    @Override
    public String rewrite(String text, String tone, String customPrompt) {
        throw new UnsupportedOperationException("Azure OpenAI provider is not implemented yet");
    }

    @Override
    public String summarize(String text, Integer maxLength) {
        throw new UnsupportedOperationException("Azure OpenAI provider is not implemented yet");
    }

    @Override
    public List<CaptionSegmentDto> generateCaptions(String text, String language) {
        throw new UnsupportedOperationException("Azure OpenAI provider is not implemented yet");
    }

    @Override
    public String improveGrammar(String text) {
        throw new UnsupportedOperationException("Azure OpenAI provider is not implemented yet");
    }

    @Override
    public String detectLanguage(String text) {
        throw new UnsupportedOperationException("Azure OpenAI provider is not implemented yet");
    }

    @Override
    public String generateTitle(String text) {
        throw new UnsupportedOperationException("Azure OpenAI provider is not implemented yet");
    }
}
