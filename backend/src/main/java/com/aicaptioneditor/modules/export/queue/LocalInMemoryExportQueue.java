package com.aicaptioneditor.modules.export.queue;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

@Slf4j
@Component
public class LocalInMemoryExportQueue implements ExportQueue {

    private final BlockingQueue<UUID> queue = new LinkedBlockingQueue<>();
    private final ExportWorker exportWorker;
    private ExecutorService executorService;
    private volatile boolean running = true;

    public LocalInMemoryExportQueue(@Lazy ExportWorker exportWorker) {
        this.exportWorker = exportWorker;
    }

    @PostConstruct
    public void start() {
        executorService = Executors.newSingleThreadExecutor(r -> {
            Thread thread = new Thread(r, "export-worker-thread");
            thread.setDaemon(true);
            return thread;
        });
        executorService.submit(this::workerLoop);
        log.info("In-memory export queue worker started.");
    }

    private void workerLoop() {
        while (running) {
            try {
                UUID jobId = queue.take();
                log.info("Processing job from queue: {}", jobId);
                exportWorker.processJob(jobId);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("Error in export queue worker loop", e);
            }
        }
    }

    @Override
    public void enqueue(UUID jobId) {
        queue.add(jobId);
        log.debug("Enqueued job: {}", jobId);
    }

    @PreDestroy
    public void stop() {
        running = false;
        if (executorService != null) {
            executorService.shutdownNow();
        }
        log.info("In-memory export queue worker stopped.");
    }
}
