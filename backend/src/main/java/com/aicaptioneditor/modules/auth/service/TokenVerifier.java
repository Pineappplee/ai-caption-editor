package com.aicaptioneditor.modules.auth.service;

import org.springframework.security.core.Authentication;

public interface TokenVerifier {
    Authentication verifyToken(String token);
}
