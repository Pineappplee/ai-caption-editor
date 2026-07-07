package com.aicaptioneditor.modules.auth.service;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.auth.repository.UserRepository;
import com.aicaptioneditor.common.exception.ApiException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service("firebaseTokenVerifier")
@RequiredArgsConstructor
@Slf4j
public class FirebaseTokenVerifier implements TokenVerifier {

    @Value("${app.firebase.project-id:ai-caption-editor-dev}")
    private String firebaseProjectId;

    private final GooglePublicKeyProvider googlePublicKeyProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public Authentication verifyToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .keyLocator(header -> {
                        String kid = (String) header.get("kid");
                        return googlePublicKeyProvider.getPublicKey(kid);
                    })
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // Validate issuer and audience
            String expectedIssuer = "https://securetoken.google.com/" + firebaseProjectId;
            if (!expectedIssuer.equals(claims.getIssuer())) {
                throw new ApiException("Invalid token issuer", HttpStatus.UNAUTHORIZED);
            }
            if (!firebaseProjectId.equals(claims.getAudience().iterator().next())) {
                throw new ApiException("Invalid token audience", HttpStatus.UNAUTHORIZED);
            }

            String uid = claims.getSubject();
            if (uid == null || uid.trim().isEmpty()) {
                throw new ApiException("Invalid token subject (uid)", HttpStatus.UNAUTHORIZED);
            }

            String email = claims.get("email", String.class);
            if (email == null || email.trim().isEmpty()) {
                email = uid + "@firebase.placeholder";
            }

            String name = claims.get("name", String.class);
            if (name == null || name.trim().isEmpty()) {
                name = email.split("@")[0];
            }

            String picture = claims.get("picture", String.class);

            // Sync user to database
            User user = syncUser(email, name, picture);

            return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Firebase ID Token verification failed", e);
            throw new ApiException("Invalid Firebase ID Token", HttpStatus.UNAUTHORIZED);
        }
    }

    private User syncUser(String email, String name, String avatarUrl) {
        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    boolean updated = false;
                    if (!name.equals(existingUser.getName())) {
                        existingUser.setName(name);
                        updated = true;
                    }
                    if (avatarUrl != null && !avatarUrl.equals(existingUser.getAvatarUrl())) {
                        existingUser.setAvatarUrl(avatarUrl);
                        updated = true;
                    }
                    return updated ? userRepository.save(existingUser) : existingUser;
                })
                .orElseGet(() -> {
                    log.info("Creating new user from Firebase sync: {}", email);
                    User newUser = User.builder()
                            .name(name)
                            .email(email)
                            // A secure random password hash for synced users since they login via Firebase
                            .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .avatarUrl(avatarUrl)
                            .plan(UserPlan.free)
                            .build();
                    return userRepository.save(newUser);
                });
    }
}
