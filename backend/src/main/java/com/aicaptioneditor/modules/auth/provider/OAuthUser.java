package com.aicaptioneditor.modules.auth.provider;

public record OAuthUser(
    String providerId,
    String email,
    String name,
    String avatarUrl
) {}
