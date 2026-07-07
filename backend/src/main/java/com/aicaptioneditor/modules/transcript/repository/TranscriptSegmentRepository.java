package com.aicaptioneditor.modules.transcript.repository;

import com.aicaptioneditor.modules.transcript.model.TranscriptSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TranscriptSegmentRepository extends JpaRepository<TranscriptSegment, UUID> {
    List<TranscriptSegment> findByTranscriptIdOrderByOrderIndexAsc(UUID transcriptId);
}
