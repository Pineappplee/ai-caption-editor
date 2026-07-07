package com.aicaptioneditor.modules.transcript.repository;

import com.aicaptioneditor.modules.transcript.model.Transcript;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, UUID> {
    Optional<Transcript> findByProjectId(UUID projectId);
}
