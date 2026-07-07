package com.aicaptioneditor.modules.user.config;

import com.aicaptioneditor.modules.user.provider.UserProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserConfig {

    @Value("${app.auth.provider:local}")
    private String authProvider;

    @Bean
    public UserProvider userProvider(ApplicationContext context) {
        if ("firebase".equalsIgnoreCase(authProvider)) {
            return context.getBean("firebaseUserProvider", UserProvider.class);
        } else {
            return context.getBean("localUserProvider", UserProvider.class);
        }
    }
}
