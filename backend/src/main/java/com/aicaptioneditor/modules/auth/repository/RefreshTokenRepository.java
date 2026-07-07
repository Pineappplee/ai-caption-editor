package com.aicaptioneditor.modules.auth.repository;

import com.aicaptioneditor.modules.auth.model.RefreshToken;
import com.aicaptioneditor.modules.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByToken(String token);
    void deleteByUser(User user);
}
