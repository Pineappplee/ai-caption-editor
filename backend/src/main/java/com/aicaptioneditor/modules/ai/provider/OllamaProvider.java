package com.aicaptioneditor.modules.ai.provider;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.ai.dto.CaptionSegmentDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("ollamaAIProvider")
@Slf4j
@RequiredArgsConstructor
public class OllamaProvider implements AIProvider {

    @Value("${ai.ollama.url:http://localhost:11434}")
    private String baseUrl;

    @Value("${ai.ollama.model:llama3}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getName() {
        return "ollama";
    }

    @Override
    public String transcribe(byte[] audioData, String language) {
        log.warn("Transcribe is not natively supported by Ollama.");
        throw new ApiException("Local transcription is not supported by the Ollama provider. Use mock or an external provider.", HttpStatus.BAD_REQUEST);
    }

    @Override
    public String translate(String text, String targetLanguage) {
        String prompt = String.format("Translate the following text to %s. Output ONLY the translation. Do not include any explanations, introduction, or conversational filler.\n\nText:\n%s", targetLanguage, text);
        return callOllama(prompt, false);
    }

    @Override
    public String rewrite(String text, String tone, String customPrompt) {
        StringBuilder prompt = new StringBuilder("Rewrite the following text");
        if (tone != null && !tone.isBlank()) {
            prompt.append(" in a ").append(tone).append(" tone");
        }
        if (customPrompt != null && !customPrompt.isBlank()) {
            prompt.append(". Additional instructions: ").append(customPrompt);
        }
        prompt.append(". Output ONLY the rewritten text without explanations or introductory notes.\n\nText:\n").append(text);
        return callOllama(prompt.toString(), false);
    }

    @Override
    public String summarize(String text, Integer maxLength) {
        StringBuilder prompt = new StringBuilder("Summarize the following text. Output ONLY the summary without explanations or introductory notes.");
        if (maxLength != null) {
            prompt.append(" Keep the summary under ").append(maxLength).append(" characters.");
        }
        prompt.append("\n\nText:\n").append(text);
        return callOllama(prompt.toString(), false);
    }

    @Override
    public List<CaptionSegmentDto> generateCaptions(String text, String language) {
        String prompt = "Task: Split the following transcript text into short caption segments (max 10 words per segment). Assign start and end timestamps in seconds sequentially.\n" +
                "Return the result strictly as a valid JSON array of objects, with no markdown formatting (do not include ```json), no explanations, and no extra text.\n" +
                "JSON schema:\n" +
                "[\n" +
                "  {\n" +
                "    \"text\": \"segment text\",\n" +
                "    \"startTime\": 0.0,\n" +
                "    \"endTime\": 2.5,\n" +
                "    \"speaker\": \"Speaker 1\",\n" +
                "    \"confidence\": 0.95,\n" +
                "    \"orderIndex\": 0\n" +
                "  }\n" +
                "]\n\n" +
                "Transcript text:\n" +
                text;

        String jsonResponse = callOllama(prompt, true);
        try {
            String cleanedJson = cleanJsonText(jsonResponse);
            return objectMapper.readValue(cleanedJson, new TypeReference<List<CaptionSegmentDto>>() {});
        } catch (Exception e) {
            log.error("Failed to parse JSON captions from Ollama. Raw response: {}", jsonResponse, e);
            // Fallback: create a single segment with the original text
            List<CaptionSegmentDto> fallbackList = new ArrayList<>();
            fallbackList.add(CaptionSegmentDto.builder()
                    .text(text)
                    .startTime(0.0)
                    .endTime(10.0)
                    .speaker("Speaker 1")
                    .confidence(0.5)
                    .orderIndex(0)
                    .build());
            return fallbackList;
        }
    }

    @Override
    public String improveGrammar(String text) {
        String prompt = String.format("Correct all grammatical, spelling, and punctuation errors in the following text while preserving its original meaning. Output ONLY the corrected text.\n\nText:\n%s", text);
        return callOllama(prompt, false);
    }

    @Override
    public String detectLanguage(String text) {
        String prompt = String.format("Identify the ISO 639-1 two-letter language code (e.g. 'en', 'es', 'fr', 'de') of the following text. Output ONLY the two-letter language code.\n\nText:\n%s", text);
        return callOllama(prompt, false).trim().toLowerCase();
    }

    @Override
    public String generateTitle(String text) {
        String prompt = String.format("Generate a brief, engaging title for the following text. Output ONLY the title.\n\nText:\n%s", text);
        return callOllama(prompt, false).trim();
    }

    private String callOllama(String prompt, boolean forceJson) {
        try {
            String url = baseUrl + "/api/generate";
            Map<String, Object> request = new HashMap<>();
            request.put("model", modelName);
            request.put("prompt", prompt);
            request.put("stream", false);
            if (forceJson) {
                request.put("format", "json");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            if (response != null && response.containsKey("response")) {
                return ((String) response.get("response")).trim();
            }
            throw new ApiException("Invalid response from Ollama API", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            log.error("Ollama API connection failed", e);
            throw new ApiException("Failed to communicate with local Ollama service: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String cleanJsonText(String rawText) {
        if (rawText == null) return "[]";
        String clean = rawText.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }
}
