package com.aicaptioneditor.modules.media.repository;

import com.aicaptioneditor.modules.media.model.MediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MediaAssetRepository extends JpaRepository<MediaAsset, UUID> {

    List<MediaAsset> findByProjectIdAndOwnerId(UUID projectId, UUID ownerId);

    Optional<MediaAsset> findByIdAndOwnerId(UUID id, UUID ownerId);
}
