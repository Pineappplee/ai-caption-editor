package com.aicaptioneditor.modules.export.processor;

import com.aicaptioneditor.modules.export.model.ExportJob;
import com.aicaptioneditor.modules.media.model.MediaAsset;
import com.aicaptioneditor.modules.transcript.model.TranscriptSegment;

import java.util.List;
import java.util.function.Consumer;

public interface ExportProcessor {
    void process(ExportJob job, MediaAsset sourceMedia, List<TranscriptSegment> segments, Consumer<Integer> progressConsumer) throws Exception;
}
