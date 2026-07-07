package com.aicaptioneditor.modules.transcript.service;

import com.aicaptioneditor.common.exception.ApiException;
import com.aicaptioneditor.common.exception.BadRequestException;
import com.aicaptioneditor.common.exception.ResourceNotFoundException;
import com.aicaptioneditor.modules.auth.model.User;
import com.aicaptioneditor.modules.projects.model.Project;
import com.aicaptioneditor.modules.projects.repository.ProjectRepository;
import com.aicaptioneditor.modules.transcript.dto.*;
import com.aicaptioneditor.modules.transcript.mapper.TranscriptMapper;
import com.aicaptioneditor.modules.transcript.model.Transcript;
import com.aicaptioneditor.modules.transcript.model.TranscriptSegment;
import com.aicaptioneditor.modules.transcript.repository.TranscriptRepository;
import com.aicaptioneditor.modules.transcript.repository.TranscriptSegmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TranscriptServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TranscriptRepository transcriptRepository;

    @Mock
    private TranscriptSegmentRepository transcriptSegmentRepository;

    @Mock
    private TranscriptMapper transcriptMapper;

    @InjectMocks
    private TranscriptServiceImpl transcriptService;

    private User mockUser;
    private User otherUser;
    private Project mockProject;
    private UUID projectId;

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
    }

    @Test
    void createTranscript_Success() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.empty());

        TranscriptCreateRequest request = TranscriptCreateRequest.builder()
                .language("en")
                .segments(List.of(
                        TranscriptSegmentCreateRequest.builder().startTime(0.0).endTime(2.5).text("Hello").build()
                ))
                .build();

        Transcript transcript = Transcript.builder().id(UUID.randomUUID()).project(mockProject).language("en").build();
        when(transcriptMapper.toEntity(any(TranscriptCreateRequest.class), any(Project.class))).thenReturn(transcript);
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(transcript);

        TranscriptSegment segment = TranscriptSegment.builder().id(UUID.randomUUID()).startTime(0.0).endTime(2.5).text("Hello").transcript(transcript).build();
        when(transcriptMapper.toEntity(request.getSegments().get(0), transcript)).thenReturn(segment);

        List<TranscriptSegment> savedSegments = List.of(segment);
        when(transcriptSegmentRepository.saveAll(anyList())).thenReturn(savedSegments);

        TranscriptResponseDto responseDto = new TranscriptResponseDto();
        when(transcriptMapper.toResponseDto(transcript, savedSegments)).thenReturn(responseDto);

        TranscriptResponseDto result = transcriptService.createTranscript(mockUser, projectId, request);
        assertNotNull(result);
    }

    @Test
    void createTranscript_AlreadyExists() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.of(new Transcript()));

        TranscriptCreateRequest request = TranscriptCreateRequest.builder().language("en").build();

        assertThrows(BadRequestException.class, () -> 
            transcriptService.createTranscript(mockUser, projectId, request)
        );
    }

    @Test
    void createTranscript_ShouldThrowForbidden_WhenUserIsNotOwner() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        TranscriptCreateRequest request = TranscriptCreateRequest.builder()
                .language("en")
                .build();

        ApiException exception = assertThrows(ApiException.class, () -> 
            transcriptService.createTranscript(otherUser, projectId, request)
        );

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatus());
    }

    @Test
    void createTranscript_ShouldThrowBadRequest_WhenSegmentsOverlap() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.empty());

        TranscriptCreateRequest request = TranscriptCreateRequest.builder()
                .language("en")
                .segments(List.of(
                        TranscriptSegmentCreateRequest.builder().startTime(0.0).endTime(3.5).text("First").build(),
                        TranscriptSegmentCreateRequest.builder().startTime(3.0).endTime(5.0).text("Second (overlaps)").build()
                ))
                .build();

        Transcript transcript = Transcript.builder().id(UUID.randomUUID()).project(mockProject).language("en").build();
        when(transcriptMapper.toEntity(any(TranscriptCreateRequest.class), any(Project.class))).thenReturn(transcript);

        TranscriptSegment segment1 = TranscriptSegment.builder().startTime(0.0).endTime(3.5).text("First").transcript(transcript).build();
        TranscriptSegment segment2 = TranscriptSegment.builder().startTime(3.0).endTime(5.0).text("Second").transcript(transcript).build();

        when(transcriptMapper.toEntity(request.getSegments().get(0), transcript)).thenReturn(segment1);
        when(transcriptMapper.toEntity(request.getSegments().get(1), transcript)).thenReturn(segment2);
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(transcript);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> 
            transcriptService.createTranscript(mockUser, projectId, request)
        );

        assertTrue(exception.getMessage().contains("Overlapping timestamps detected"));
    }

    @Test
    void createTranscript_ShouldThrowBadRequest_WhenEndTimeIsLessThanStartTime() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.empty());

        TranscriptCreateRequest request = TranscriptCreateRequest.builder()
                .language("en")
                .segments(List.of(
                        TranscriptSegmentCreateRequest.builder().startTime(4.0).endTime(2.0).text("Invalid times").build()
                ))
                .build();

        Transcript transcript = Transcript.builder().id(UUID.randomUUID()).project(mockProject).language("en").build();
        when(transcriptMapper.toEntity(any(TranscriptCreateRequest.class), any(Project.class))).thenReturn(transcript);

        TranscriptSegment segment = TranscriptSegment.builder().startTime(4.0).endTime(2.0).text("Invalid times").transcript(transcript).build();

        when(transcriptMapper.toEntity(request.getSegments().get(0), transcript)).thenReturn(segment);
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(transcript);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> 
            transcriptService.createTranscript(mockUser, projectId, request)
        );

        assertTrue(exception.getMessage().contains("Start time must be less than end time"));
    }

    @Test
    void createTranscript_ShouldThrowBadRequest_WhenStartTimeIsNegative() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.empty());

        TranscriptCreateRequest request = TranscriptCreateRequest.builder()
                .language("en")
                .segments(List.of(
                        TranscriptSegmentCreateRequest.builder().startTime(-1.0).endTime(2.0).text("Invalid time").build()
                ))
                .build();

        Transcript transcript = Transcript.builder().id(UUID.randomUUID()).project(mockProject).language("en").build();
        when(transcriptMapper.toEntity(any(TranscriptCreateRequest.class), any(Project.class))).thenReturn(transcript);

        TranscriptSegment segment = TranscriptSegment.builder().startTime(-1.0).endTime(2.0).text("Invalid time").transcript(transcript).build();

        when(transcriptMapper.toEntity(request.getSegments().get(0), transcript)).thenReturn(segment);
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(transcript);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> 
            transcriptService.createTranscript(mockUser, projectId, request)
        );

        assertTrue(exception.getMessage().contains("Start time cannot be negative"));
    }

    @Test
    void getTranscript_Success() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        Transcript transcript = Transcript.builder().id(UUID.randomUUID()).project(mockProject).language("en").build();
        when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.of(transcript));

        List<TranscriptSegment> segments = List.of(new TranscriptSegment());
        when(transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId())).thenReturn(segments);

        TranscriptResponseDto responseDto = new TranscriptResponseDto();
        when(transcriptMapper.toResponseDto(transcript, segments)).thenReturn(responseDto);

        TranscriptResponseDto result = transcriptService.getTranscript(mockUser, projectId);
        assertNotNull(result);
    }

    @Test
    void getTranscript_NotFound() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));
        when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> 
            transcriptService.getTranscript(mockUser, projectId)
        );
    }

    @Test
    void updateTranscript_Success() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        Transcript transcript = Transcript.builder().id(UUID.randomUUID()).project(mockProject).language("en").build();
        when(transcriptRepository.findByProjectId(projectId)).thenReturn(Optional.of(transcript));
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(transcript);

        List<TranscriptSegment> existing = List.of(new TranscriptSegment());
        when(transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId())).thenReturn(existing);

        TranscriptUpdateRequest request = TranscriptUpdateRequest.builder()
                .language("fr")
                .segments(List.of(
                        TranscriptSegmentCreateRequest.builder().startTime(0.0).endTime(2.0).text("Bonjour").build()
                ))
                .build();

        TranscriptSegment segment = TranscriptSegment.builder().id(UUID.randomUUID()).startTime(0.0).endTime(2.0).text("Bonjour").transcript(transcript).build();
        when(transcriptMapper.toEntity(request.getSegments().get(0), transcript)).thenReturn(segment);

        List<TranscriptSegment> saved = List.of(segment);
        when(transcriptSegmentRepository.saveAll(anyList())).thenReturn(saved);

        TranscriptResponseDto responseDto = new TranscriptResponseDto();
        when(transcriptMapper.toResponseDto(transcript, saved)).thenReturn(responseDto);

        TranscriptResponseDto result = transcriptService.updateTranscript(mockUser, projectId, request);
        assertNotNull(result);
        verify(transcriptSegmentRepository, times(1)).deleteAll(existing);
    }

    @Test
    void patchSegment_Success() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        Transcript transcript = Transcript.builder().id(UUID.randomUUID()).project(mockProject).language("en").build();
        UUID segmentId = UUID.randomUUID();
        TranscriptSegment segment = TranscriptSegment.builder()
                .id(segmentId)
                .startTime(1.0)
                .endTime(3.0)
                .text("Original")
                .transcript(transcript)
                .build();

        when(transcriptSegmentRepository.findById(segmentId)).thenReturn(Optional.of(segment));

        List<TranscriptSegment> allSegments = new ArrayList<>(List.of(segment));
        when(transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId())).thenReturn(allSegments);
        when(transcriptSegmentRepository.saveAll(anyList())).thenReturn(allSegments);
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(transcript);

        TranscriptSegmentUpdateRequest request = TranscriptSegmentUpdateRequest.builder()
                .startTime(1.5)
                .endTime(3.5)
                .text("Updated")
                .speaker("Speaker A")
                .confidence(0.99)
                .orderIndex(0)
                .build();

        TranscriptSegmentResponseDto responseDto = new TranscriptSegmentResponseDto();
        when(transcriptMapper.toResponseDto(any(TranscriptSegment.class))).thenReturn(responseDto);

        TranscriptSegmentResponseDto result = transcriptService.patchSegment(mockUser, projectId, segmentId, request);
        assertNotNull(result);
        assertEquals(1.5, segment.getStartTime());
        assertEquals(3.5, segment.getEndTime());
        assertEquals("Updated", segment.getText());
        assertEquals("Speaker A", segment.getSpeaker());
        assertEquals(0.99, segment.getConfidence());
    }

    @Test
    void patchSegment_NotBelongToProject() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        Project otherProject = Project.builder().id(UUID.randomUUID()).user(mockUser).build();
        Transcript otherTranscript = Transcript.builder().id(UUID.randomUUID()).project(otherProject).build();
        UUID segmentId = UUID.randomUUID();
        TranscriptSegment segment = TranscriptSegment.builder()
                .id(segmentId)
                .transcript(otherTranscript)
                .build();

        when(transcriptSegmentRepository.findById(segmentId)).thenReturn(Optional.of(segment));

        TranscriptSegmentUpdateRequest request = TranscriptSegmentUpdateRequest.builder().build();

        assertThrows(ApiException.class, () -> 
            transcriptService.patchSegment(mockUser, projectId, segmentId, request)
        );
    }

    @Test
    void deleteSegment_Success() {
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(mockProject));

        Transcript transcript = Transcript.builder().id(UUID.randomUUID()).project(mockProject).language("en").build();
        UUID segmentId = UUID.randomUUID();
        TranscriptSegment segment = TranscriptSegment.builder()
                .id(segmentId)
                .transcript(transcript)
                .build();

        when(transcriptSegmentRepository.findById(segmentId)).thenReturn(Optional.of(segment));
        when(transcriptSegmentRepository.findByTranscriptIdOrderByOrderIndexAsc(transcript.getId())).thenReturn(new ArrayList<>());

        transcriptService.deleteSegment(mockUser, projectId, segmentId);

        verify(transcriptSegmentRepository, times(1)).delete(segment);
    }
}
