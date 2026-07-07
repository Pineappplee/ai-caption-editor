package com.aicaptioneditor.modules.media.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.BadRequestException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.media.dto.MediaAssetResponseDto;
import com.aicaptioneditor.modules.media.mapper.MediaAssetMapper;
import com.aicaptioneditor.modules.media.model.MediaAsset;
import com.aicaptioneditor.modules.media.repository.MediaAssetRepository;
import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.projects.repository.ProjectRepository;
import com.aicaptioneditor.modules.storage.provider.StorageProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

@ExtendWith(MockitoExtension.class)
public class MediaServiceImplTest {

    @Mock
    private MediaAssetRepository mediaAssetRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private StorageProvider storageProvider;

    @Mock
    private MediaAssetMapper mediaAssetMapper;

    @InjectMocks
    private MediaServiceImpl mediaService;

    private User mockUser;
    private User otherUser;
    private Project mockProject;
    private UUID projectId;
    private MediaAsset mockAsset;
    private UUID assetId;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(UUID.randomUUID())
                .name("Owner")
                .email("owner@example.com")
                .build();

        otherUser = User.builder()
                .id(UUID.randomUUID())
                .name("Other")
                .email("other@example.com")
                .build();

        projectId = UUID.randomUUID();
        mockProject = Project.builder()
                .id(projectId)
                .user(mockUser)
                .title("Test Project")
                .build();

        assetId = UUID.randomUUID();
        mockAsset = MediaAsset.builder()
                .id(assetId)
                .project(mockProject)
                .owner(mockUser)
                .fileName("test.mp4")
                .storagePath("users/owner/test.mp4")
                .build();
    }

    @Test
    void uploadMedia_ShouldThrowBadRequest_WhenFileIsEmpty() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "", "video/mp4", new byte[0]);

        assertThrows(BadRequestException.class, () ->
                mediaService.uploadMedia(emptyFile, projectId, mockUser)
        );
    }

    @Test
    void uploadMedia_ShouldThrowBadRequest_WhenFileExceedsSize() {
        // Exceeds 100MB limit (101MB)
        byte[] largeBytes = new byte[101 * 1024 * 1024];
        MockMultipartFile largeFile = new MockMultipartFile("file", "large.mp4", "video/mp4", largeBytes);

        assertThrows(BadRequestException.class, () ->
                mediaService.uploadMedia(largeFile, projectId, mockUser)
        );
    }

    @Test
    void uploadMedia_ShouldThrowBadRequest_WhenMimeTypeIsUnsupported() {
        MockMultipartFile unsupportedFile = new MockMultipartFile("file", "doc.pdf", "application/pdf", "pdf content".getBytes());

        assertThrows(BadRequestException.class, () ->
                mediaService.uploadMedia(unsupportedFile, projectId, mockUser)
        );
    }

    @Test
    void uploadMedia_ShouldThrowForbidden_WhenUserIsNotOwner() {
        MockMultipartFile file = new MockMultipartFile("file", "test.mp4", "video/mp4", "content".getBytes());
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        ApiException exception = assertThrows(ApiException.class, () ->
                mediaService.uploadMedia(file, projectId, otherUser)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void uploadMedia_ShouldUploadToStorageAndSave_WhenRequestIsValid() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.mp4", "video/mp4", "content".getBytes());
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        Mockito.doNothing().when(storageProvider).upload(any(String.class), any(InputStream.class));
        Mockito.when(mediaAssetRepository.save(any(MediaAsset.class))).thenReturn(mockAsset);

        MediaAssetResponseDto mockResponse = MediaAssetResponseDto.builder()
                .id(assetId)
                .fileName("test.mp4")
                .build();
        Mockito.when(mediaAssetMapper.toResponseDto(mockAsset)).thenReturn(mockResponse);

        MediaAssetResponseDto response = mediaService.uploadMedia(file, projectId, mockUser);

        assertNotNull(response);
        assertEquals(assetId, response.getId());
        Mockito.verify(storageProvider, Mockito.times(1)).upload(any(String.class), any(InputStream.class));
        Mockito.verify(mediaAssetRepository, Mockito.times(1)).save(any(MediaAsset.class));
    }

    @Test
    void getProjectMedia_ShouldReturnMediaList_WhenOwnerRequests() {
        Mockito.when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        Mockito.when(mediaAssetRepository.findByProjectIdAndOwnerId(projectId, mockUser.getId()))
                .thenReturn(List.of(mockAsset));
        
        MediaAssetResponseDto mockResponse = MediaAssetResponseDto.builder()
                .id(assetId)
                .fileName("test.mp4")
                .build();
        Mockito.when(mediaAssetMapper.toResponseDto(mockAsset)).thenReturn(mockResponse);

        List<MediaAssetResponseDto> mediaList = mediaService.getProjectMedia(projectId, mockUser);

        assertNotNull(mediaList);
        assertEquals(1, mediaList.size());
        assertEquals(assetId, mediaList.get(0).getId());
    }

    @Test
    void deleteMedia_ShouldDeleteFromStorageAndDb_WhenOwnerDeletes() {
        Mockito.when(mediaAssetRepository.findById(assetId)).thenReturn(Optional.of(mockAsset));
        Mockito.doNothing().when(storageProvider).delete(mockAsset.getStoragePath());
        Mockito.doNothing().when(mediaAssetRepository).delete(mockAsset);

        assertDoesNotThrow(() -> mediaService.deleteMedia(assetId, mockUser));

        Mockito.verify(storageProvider, Mockito.times(1)).delete(mockAsset.getStoragePath());
        Mockito.verify(mediaAssetRepository, Mockito.times(1)).delete(mockAsset);
    }

    @Test
    void deleteMedia_ShouldThrowForbidden_WhenNonOwnerDeletes() {
        Mockito.when(mediaAssetRepository.findById(assetId)).thenReturn(Optional.of(mockAsset));

        assertThrows(ApiException.class, () ->
                mediaService.deleteMedia(assetId, otherUser)
        );
    }
}
