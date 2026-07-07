package com.aicaptioneditor.modules.media.controller;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.auth.model.UserPlan;
import com.aicaptioneditor.modules.media.dto.MediaAssetResponseDto;
import com.aicaptioneditor.modules.media.service.MediaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class MediaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MediaService mediaService;

    private User mockUser;
    private UsernamePasswordAuthenticationToken mockAuth;
    private MediaAssetResponseDto mockMediaResponse;
    private UUID projectId;
    private UUID mediaId;

    @BeforeEach
    void setUp() {
        UUID userId = UUID.randomUUID();
        mockUser = User.builder()
                .id(userId)
                .name("John Doe")
                .email("john@example.com")
                .avatarUrl("https://example.com/john.png")
                .plan(UserPlan.free)
                .build();

        mockAuth = new UsernamePasswordAuthenticationToken(mockUser, null, mockUser.getAuthorities());

        projectId = UUID.randomUUID();
        mediaId = UUID.randomUUID();

        mockMediaResponse = MediaAssetResponseDto.builder()
                .id(mediaId)
                .projectId(projectId)
                .ownerId(userId)
                .fileName("generated-uuid-video.mp4")
                .originalName("video.mp4")
                .mimeType("video/mp4")
                .size(1024L)
                .storagePath("users/" + userId + "/" + projectId + "/generated-uuid-video.mp4")
                .provider("LOCAL")
                .publicUrl("/uploads/users/" + userId + "/" + projectId + "/generated-uuid-video.mp4")
                .createdAt(Instant.now())
                .build();
    }

    @Test
    void uploadMedia_ShouldReturnUploadedMetadata_WhenRequestIsValid() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "video.mp4",
                "video/mp4",
                "mock video bytes".getBytes()
        );

        Mockito.when(mediaService.uploadMedia(any(MultipartFile.class), eq(projectId), any(User.class)))
                .thenReturn(mockMediaResponse);

        mockMvc.perform(multipart("/api/v1/media/upload")
                        .file(mockFile)
                        .param("projectId", projectId.toString())
                        .with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("File uploaded successfully"))
                .andExpect(jsonPath("$.data.id").value(mediaId.toString()))
                .andExpect(jsonPath("$.data.originalName").value("video.mp4"))
                .andExpect(jsonPath("$.data.publicUrl").value("/uploads/users/" + mockUser.getId() + "/" + projectId + "/generated-uuid-video.mp4"));
    }

    @Test
    void uploadMedia_ShouldReturnUnauthorized_WhenNotAuthenticated() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "video.mp4",
                "video/mp4",
                "mock video bytes".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/media/upload")
                        .file(mockFile)
                        .param("projectId", projectId.toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.code").value("UNAUTHORIZED"));
    }

    @Test
    void uploadMedia_ShouldReturnForbidden_WhenUserDoesNotOwnProject() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "video.mp4",
                "video/mp4",
                "mock video bytes".getBytes()
        );

        Mockito.when(mediaService.uploadMedia(any(MultipartFile.class), eq(projectId), any(User.class)))
                .thenThrow(new ApiException("You do not have permission to upload files to this project", HttpStatus.FORBIDDEN));

        mockMvc.perform(multipart("/api/v1/media/upload")
                        .file(mockFile)
                        .param("projectId", projectId.toString())
                        .with(authentication(mockAuth)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("You do not have permission to upload files to this project"))
                .andExpect(jsonPath("$.data.code").value("FORBIDDEN"));
    }

    @Test
    void getProjectMedia_ShouldReturnMediaAssets_WhenUserOwnsProject() throws Exception {
        Mockito.when(mediaService.getProjectMedia(eq(projectId), any(User.class)))
                .thenReturn(List.of(mockMediaResponse));

        mockMvc.perform(get("/api/v1/media/project/" + projectId).with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Media assets retrieved successfully"))
                .andExpect(jsonPath("$.data[0].id").value(mediaId.toString()));
    }

    @Test
    void deleteMedia_ShouldReturnSuccess_WhenUserOwnsMedia() throws Exception {
        Mockito.doNothing().when(mediaService).deleteMedia(eq(mediaId), any(User.class));

        mockMvc.perform(delete("/api/v1/media/" + mediaId).with(authentication(mockAuth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Media asset deleted successfully"));

        Mockito.verify(mediaService, Mockito.times(1)).deleteMedia(eq(mediaId), any(User.class));
    }

    @Test
    void deleteMedia_ShouldReturnNotFound_WhenAssetDoesNotExist() throws Exception {
        Mockito.doThrow(new ResourceNotFoundException("Media asset not found with id: " + mediaId))
                .when(mediaService).deleteMedia(eq(mediaId), any(User.class));

        mockMvc.perform(delete("/api/v1/media/" + mediaId).with(authentication(mockAuth)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Media asset not found with id: " + mediaId))
                .andExpect(jsonPath("$.data.code").value("RESOURCE_NOT_FOUND"));
    }
}
