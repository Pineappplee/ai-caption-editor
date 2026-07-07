package com.aicaptioneditor.modules.export.queue;

import java.util.UUID;

public interface ExportQueue {
    void enqueue(UUID jobId);
}
