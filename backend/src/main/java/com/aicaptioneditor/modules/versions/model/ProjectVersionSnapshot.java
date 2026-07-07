package com.aicaptioneditor.modules.versions.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectVersionSnapshot implements Serializable {

    private ProjectSnapshotData project;
    private TranscriptSnapshotData transcript;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectSnapshotData implements Serializable {
        private String title;
        private String description;
        private String status;
        private String language;
        private String thumbnailUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TranscriptSnapshotData implements Serializable {
        private String language;
        private List<SegmentSnapshotData> segments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SegmentSnapshotData implements Serializable {
        private Double startTime;
        private Double endTime;
        private String text;
        private String speaker;
        private Double confidence;
        private Integer orderIndex;
    }
}
