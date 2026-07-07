package com.aicaptioneditor.modules.projects.repository;

import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.projects.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Page<Project> findByUser(User user, Pageable pageable);

    Optional<Project> findByIdAndUser(UUID id, User user);
}
