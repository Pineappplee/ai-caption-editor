package com.aicaptioneditor.modules.export.model;

import com.aicaptioneditor.modules.projects.model.Project;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "export_jobs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportJob {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Project project;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExportStatus status = ExportStatus.QUEUED;

    @Column(nullable = false, length = 50)
    private String format;

    @Builder.Default
    @Column(nullable = false)
    private Integer progress = 0;

    @Column(name = "output_path", length = 1000)
    private String outputPath;

    @Column(name = "error_message")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}
