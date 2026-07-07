package com.aicaptioneditor.modules.transcript.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transcript_segments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptSegment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transcript_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Transcript transcript;

    @Column(name = "start_time", nullable = false)
    private Double startTime;

    @Column(name = "end_time", nullable = false)
    private Double endTime;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(length = 255)
    private String speaker;

    private Double confidence;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
