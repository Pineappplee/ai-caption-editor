package com.aicaptioneditor.modules.auth.provider;

public interface OAuthProvider {
    OAuthProviderType getType();
    OAuthUser getUserInfo(String accessToken);
}
