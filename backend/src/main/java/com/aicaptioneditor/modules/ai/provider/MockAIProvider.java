package com.aicaptioneditor.modules.ai.provider;

import com.aicaptioneditor.modules.ai.dto.CaptionSegmentDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("mockAIProvider")
@Slf4j
public class MockAIProvider implements AIProvider {

    @Override
    public String getName() {
        return "mock";
    }

    @Override
    public String transcribe(byte[] audioData, String language) {
        log.info("Mock transcribing audio data, length: {}", audioData != null ? audioData.length : 0);
        return "Welcome to the presentation. Today we will be discussing the latest advancements in AI technology and how they are transforming various industries.";
    }

    @Override
    public String translate(String text, String targetLanguage) {
        log.info("Mock translating text to {}", targetLanguage);
        if ("es".equalsIgnoreCase(targetLanguage) || "spanish".equalsIgnoreCase(targetLanguage)) {
            return "Bienvenidos a la presentación. Hoy estaremos discutiendo los últimos avances en la tecnología de IA y cómo están transformando varias industrias.";
        }
        return "Translated [" + targetLanguage + "]: " + text;
    }

    @Override
    public String rewrite(String text, String tone, String customPrompt) {
        log.info("Mock rewriting text with tone {} and prompt {}", tone, customPrompt);
        String prefix = "";
        if (tone != null && !tone.isBlank()) {
            prefix = "[" + tone + "] ";
        }
        return prefix + "Here is the refined version of your text: " + text;
    }

    @Override
    public String summarize(String text, Integer maxLength) {
        log.info("Mock summarizing text with maxLength {}", maxLength);
        String summary = "The discussion centers on AI advancements and their transformative impacts across multiple industries.";
        if (maxLength != null && summary.length() > maxLength) {
            return summary.substring(0, maxLength);
        }
        return summary;
    }

    @Override
    public List<CaptionSegmentDto> generateCaptions(String text, String language) {
        log.info("Mock generating captions for text");
        return List.of(
                CaptionSegmentDto.builder()
                        .text("Welcome to the presentation.")
                        .startTime(0.0)
                        .endTime(3.0)
                        .speaker("Speaker 1")
                        .confidence(0.98)
                        .orderIndex(0)
                        .build(),
                CaptionSegmentDto.builder()
                        .text("Today we will be discussing the latest advancements in AI technology")
                        .startTime(3.0)
                        .endTime(8.0)
                        .speaker("Speaker 1")
                        .confidence(0.95)
                        .orderIndex(1)
                        .build(),
                CaptionSegmentDto.builder()
                        .text("and how they are transforming various industries.")
                        .startTime(8.0)
                        .endTime(12.0)
                        .speaker("Speaker 1")
                        .confidence(0.97)
                        .orderIndex(2)
                        .build()
        );
    }

    @Override
    public String improveGrammar(String text) {
        log.info("Mock improving grammar");
        return "Grammar corrected: " + text;
    }

    @Override
    public String detectLanguage(String text) {
        log.info("Mock detecting language");
        return "en";
    }

    @Override
    public String generateTitle(String text) {
        log.info("Mock generating title");
        return "AI Advancements & Industry Transformation";
    }
}
