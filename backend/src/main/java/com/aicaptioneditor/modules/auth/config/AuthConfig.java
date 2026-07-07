package com.aicaptioneditor.modules.auth.config;

import com.aicaptioneditor.modules.auth.service.AuthService;
import com.aicaptioneditor.modules.auth.service.TokenVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuthConfig {

    @Value("${app.auth.provider:local}")
    private String authProvider;

    @Bean
    public AuthService authService(ApplicationContext context) {
        if ("firebase".equalsIgnoreCase(authProvider)) {
            return context.getBean("firebaseAuthService", AuthService.class);
        } else {
            return context.getBean("localAuthService", AuthService.class);
        }
    }

    @Bean
    public TokenVerifier tokenVerifier(ApplicationContext context) {
        if ("firebase".equalsIgnoreCase(authProvider)) {
            return context.getBean("firebaseTokenVerifier", TokenVerifier.class);
        } else {
            return context.getBean("localTokenVerifier", TokenVerifier.class);
        }
    }
}
