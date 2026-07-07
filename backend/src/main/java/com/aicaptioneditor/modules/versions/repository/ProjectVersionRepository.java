package com.aicaptioneditor.modules.versions.repository;

import com.aicaptioneditor.modules.versions.model.ProjectVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectVersionRepository extends JpaRepository<ProjectVersion, UUID> {

    List<ProjectVersion> findByProjectIdOrderByVersionNumberDesc(UUID projectId);

    @Query("SELECT COALESCE(MAX(pv.versionNumber), 0) FROM ProjectVersion pv WHERE pv.project.id = :projectId")
    Integer findMaxVersionNumberByProjectId(@Param("projectId") UUID projectId);
}
