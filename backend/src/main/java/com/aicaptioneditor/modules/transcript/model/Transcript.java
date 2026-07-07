package com.aicaptioneditor.modules.transcript.model;

import com.aicaptioneditor.modules.projects.model.Project;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transcripts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transcript {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Project project;

    @Column(length = 100)
    private String language;

    @Version
    @Column(nullable = false)
    @Builder.Default
    private Integer version = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
