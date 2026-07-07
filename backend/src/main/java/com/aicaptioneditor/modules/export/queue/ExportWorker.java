package com.aicaptioneditor.modules.export.queue;

import java.util.UUID;

public interface ExportWorker {
    void processJob(UUID jobId);
}
