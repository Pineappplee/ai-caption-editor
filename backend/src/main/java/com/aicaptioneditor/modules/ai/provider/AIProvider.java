package com.aicaptioneditor.modules.ai.provider;

import com.aicaptioneditor.modules.ai.dto.CaptionSegmentDto;
import java.util.List;

public interface AIProvider {
    /**
     * Gets the unique identifier name of the AI provider.
     */
    String getName();

    /**
     * Transcribes audio data to text.
     */
    String transcribe(byte[] audioData, String language);

    /**
     * Translates text into the target language.
     */
    String translate(String text, String targetLanguage);

    /**
     * Rewrites text based on a specified tone and/or custom prompts.
     */
    String rewrite(String text, String tone, String customPrompt);

    /**
     * Summarizes text, optionally enforcing a maximum length.
     */
    String summarize(String text, Integer maxLength);

    /**
     * Segments text into timestamped caption segments.
     */
    List<CaptionSegmentDto> generateCaptions(String text, String language);

    /**
     * Fixes and improves grammar and spelling in the text.
     */
    String improveGrammar(String text);

    /**
     * Detects the language of the text, returning the language code.
     */
    String detectLanguage(String text);

    /**
     * Generates an engaging title for the text.
     */
    String generateTitle(String text);
}
