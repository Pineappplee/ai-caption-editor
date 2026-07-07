package com.aicaptioneditor.modules.ai.config;

import com.aicaptioneditor.modules.ai.provider.AIProvider;
import com.aicaptioneditor.modules.ai.provider.MockAIProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
@Slf4j
@RequiredArgsConstructor
public class AIConfig {

    @Value("${ai.provider:mock}")
    private String activeProviderName;

    private final ApplicationContext applicationContext;

    @Bean
    public AIProvider activeAIProvider() {
        log.info("Configuring active AI Provider: {}", activeProviderName);
        Map<String, AIProvider> providers = applicationContext.getBeansOfType(AIProvider.class);

        AIProvider provider = providers.values().stream()
                .filter(p -> p.getName().equalsIgnoreCase(activeProviderName))
                .findFirst()
                .orElse(null);

        if (provider == null) {
            log.warn("AI Provider '{}' not found. Falling back to MockAIProvider.", activeProviderName);
            provider = providers.values().stream()
                    .filter(p -> p instanceof MockAIProvider)
                    .findFirst()
                    .orElseGet(MockAIProvider::new);
        }

        log.info("Resolved active AI Provider bean: {}", provider.getClass().getSimpleName());
        return provider;
    }
}
