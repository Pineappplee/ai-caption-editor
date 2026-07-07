package com.aicaptioneditor.modules.versions.model;

import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.auth.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_versions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"project_id", "version_number"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Project project;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "snapshot", nullable = false, columnDefinition = "jsonb")
    private ProjectVersionSnapshot snapshot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "is_autosave", nullable = false)
    @Builder.Default
    private Boolean isAutoSave = true;

    @Column(name = "message", length = 255)
    private String message;
}
