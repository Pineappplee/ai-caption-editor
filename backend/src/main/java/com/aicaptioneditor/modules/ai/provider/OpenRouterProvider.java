package com.aicaptioneditor.modules.ai.provider;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.modules.ai.dto.CaptionSegmentDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("openrouterAIProvider")
@Slf4j
@RequiredArgsConstructor
public class OpenRouterProvider implements AIProvider {

    @Value("${ai.openrouter.url:https://openrouter.ai/api/v1}")
    private String baseUrl;

    @Value("${ai.openrouter.api-key:}")
    private String apiKey;

    @Value("${ai.openrouter.model:meta-llama/llama-3-8b-instruct:free}")
    private String modelName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getName() {
        return "openrouter";
    }

    @Override
    public String transcribe(byte[] audioData, String language) {
        log.warn("Transcribe is not supported by OpenRouter chat completions API.");
        throw new ApiException("Transcription is not supported by the OpenRouter provider.", HttpStatus.BAD_REQUEST);
    }

    @Override
    public String translate(String text, String targetLanguage) {
        String prompt = String.format("Translate the following text to %s. Output ONLY the translation. Do not include any explanations, introduction, or conversational filler.\n\nText:\n%s", targetLanguage, text);
        return callOpenRouter(prompt, false);
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
        return callOpenRouter(prompt.toString(), false);
    }

    @Override
    public String summarize(String text, Integer maxLength) {
        StringBuilder prompt = new StringBuilder("Summarize the following text. Output ONLY the summary without explanations or introductory notes.");
        if (maxLength != null) {
            prompt.append(" Keep the summary under ").append(maxLength).append(" characters.");
        }
        prompt.append("\n\nText:\n").append(text);
        return callOpenRouter(prompt.toString(), false);
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

        String jsonResponse = callOpenRouter(prompt, true);
        try {
            String cleanedJson = cleanJsonText(jsonResponse);
            return objectMapper.readValue(cleanedJson, new TypeReference<List<CaptionSegmentDto>>() {});
        } catch (Exception e) {
            log.error("Failed to parse JSON captions from OpenRouter. Raw response: {}", jsonResponse, e);
            // Fallback: create a single segment
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
        return callOpenRouter(prompt, false);
    }

    @Override
    public String detectLanguage(String text) {
        String prompt = String.format("Identify the ISO 639-1 two-letter language code (e.g. 'en', 'es', 'fr', 'de') of the following text. Output ONLY the two-letter language code.\n\nText:\n%s", text);
        return callOpenRouter(prompt, false).trim().toLowerCase();
    }

    @Override
    public String generateTitle(String text) {
        String prompt = String.format("Generate a brief, engaging title for the following text. Output ONLY the title.\n\nText:\n%s", text);
        return callOpenRouter(prompt, false).trim();
    }

    private String callOpenRouter(String prompt, boolean forceJson) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new ApiException("OpenRouter API key is not configured. Please set the ai.openrouter.api-key property.", HttpStatus.BAD_REQUEST);
        }

        try {
            String url = baseUrl + "/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            headers.set("HTTP-Referer", "http://localhost:8080");
            headers.set("X-Title", "AI Caption Editor");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelName);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "user", "content", prompt));
            requestBody.put("messages", messages);

            if (forceJson) {
                requestBody.put("response_format", Map.of("type", "json_object"));
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);

            if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
                Map body = responseEntity.getBody();
                List choices = (List) body.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map firstChoice = (Map) choices.get(0);
                    Map message = (Map) firstChoice.get("message");
                    if (message != null && message.containsKey("content")) {
                        return ((String) message.get("content")).trim();
                    }
                }
            }
            throw new ApiException("Invalid response from OpenRouter API", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            log.error("OpenRouter API request failed", e);
            throw new ApiException("Failed to communicate with OpenRouter service: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
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
