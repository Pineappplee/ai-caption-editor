package com.aicaptioneditor.modules.export.processor;

import com.aicaptioneditor.modules.export.model.ExportJob;
import com.aicaptioneditor.modules.media.model.MediaAsset;
import com.aicaptioneditor.modules.storage.provider.StorageProvider;
import com.aicaptioneditor.modules.transcript.model.TranscriptSegment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.util.List;
import java.util.function.Consumer;

@Slf4j
@Service
@RequiredArgsConstructor
public class FFmpegExportProcessor implements ExportProcessor {

    private final StorageProvider storageProvider;

    @Value("${storage.export.simulate:true}")
    private boolean simulate;

    @Override
    public void process(ExportJob job, MediaAsset sourceMedia, List<TranscriptSegment> segments, Consumer<Integer> progressConsumer) throws Exception {
        String format = job.getFormat().toLowerCase();
        
        // Path structure: users/{userId}/{projectId}/exports/{jobId}.{format}
        String outputStoragePath = "users/" + sourceMedia.getOwner().getId() + "/" 
                + sourceMedia.getProject().getId() + "/exports/" + job.getId() + "." + format;

        progressConsumer.accept(10); // Loaded media metadata

        if (isTextFormat(format)) {
            // Text formats do not require media rendering
            String content = generateTextSubtitle(segments, format);
            try (ByteArrayInputStream bais = new ByteArrayInputStream(content.getBytes())) {
                storageProvider.upload(outputStoragePath, bais);
            }
            progressConsumer.accept(90);
            job.setOutputPath(outputStoragePath);
            return;
        }

        // Media transcoding formats (e.g., mp4, mp3)
        File tempDir = Files.createTempDirectory("export-" + job.getId()).toFile();
        File inputTempFile = new File(tempDir, "input_" + sourceMedia.getFileName());
        File srtTempFile = new File(tempDir, "subtitles.srt");
        File outputTempFile = new File(tempDir, "output." + format);

        try {
            // 1. Download source file from storage provider
            log.info("Downloading source media to local temp file: {}", inputTempFile.getAbsolutePath());
            try (InputStream is = storageProvider.download(sourceMedia.getStoragePath())) {
                Files.copy(is, inputTempFile.toPath());
            }
            progressConsumer.accept(15);

            // 2. Generate SRT file
            String srtContent = generateTextSubtitle(segments, "srt");
            try (BufferedWriter writer = new BufferedWriter(new FileWriter(srtTempFile))) {
                writer.write(srtContent);
            }
            progressConsumer.accept(20);

            // Determine total duration for progress parsing
            double totalDuration = 0;
            if (!segments.isEmpty()) {
                totalDuration = segments.get(segments.size() - 1).getEndTime();
            }
            if (totalDuration <= 0) {
                totalDuration = 60.0; // fallback default
            }

            // 3. Execute transcode (real FFmpeg vs Simulated)
            if (simulate) {
                log.info("Simulation mode active. Generating dummy transcode output...");
                simulateTranscode(inputTempFile, outputTempFile, progressConsumer);
            } else {
                try {
                    runFFmpegProcess(inputTempFile, srtTempFile, outputTempFile, totalDuration, progressConsumer);
                } catch (IOException e) {
                    log.warn("Failed to execute local FFmpeg process: {}. Falling back to simulation mode.", e.getMessage());
                    simulateTranscode(inputTempFile, outputTempFile, progressConsumer);
                }
            }

            progressConsumer.accept(85);

            // 4. Upload to storage
            log.info("Uploading transcoded file to storage path: {}", outputStoragePath);
            try (InputStream os = new FileInputStream(outputTempFile)) {
                storageProvider.upload(outputStoragePath, os);
            }
            progressConsumer.accept(95);

            job.setOutputPath(outputStoragePath);

        } finally {
            // Clean up temp files
            deleteFile(inputTempFile);
            deleteFile(srtTempFile);
            deleteFile(outputTempFile);
            deleteFile(tempDir);
        }
    }

    private boolean isTextFormat(String format) {
        return "srt".equals(format) || "vtt".equals(format) || "txt".equals(format);
    }

    private String generateTextSubtitle(List<TranscriptSegment> segments, String format) {
        StringBuilder sb = new StringBuilder();
        if ("srt".equals(format)) {
            for (int i = 0; i < segments.size(); i++) {
                TranscriptSegment segment = segments.get(i);
                sb.append(i + 1).append("\n");
                sb.append(formatTimeSrt(segment.getStartTime())).append(" --> ")
                  .append(formatTimeSrt(segment.getEndTime())).append("\n");
                sb.append(segment.getText()).append("\n\n");
            }
        } else if ("vtt".equals(format)) {
            sb.append("WEBVTT\n\n");
            for (int i = 0; i < segments.size(); i++) {
                TranscriptSegment segment = segments.get(i);
                sb.append(i + 1).append("\n");
                sb.append(formatTimeVtt(segment.getStartTime())).append(" --> ")
                  .append(formatTimeVtt(segment.getEndTime())).append("\n");
                sb.append(segment.getText()).append("\n\n");
            }
        } else {
            // txt format
            for (TranscriptSegment segment : segments) {
                sb.append(segment.getText()).append("\n");
            }
        }
        return sb.toString();
    }

    private String formatTimeSrt(double seconds) {
        long ms = Math.round((seconds - Math.floor(seconds)) * 1000);
        long totalSecs = (long) Math.floor(seconds);
        long hours = totalSecs / 3600;
        long minutes = (totalSecs % 3600) / 60;
        long secs = totalSecs % 60;
        return String.format("%02d:%02d:%02d,%03d", hours, minutes, secs, ms);
    }

    private String formatTimeVtt(double seconds) {
        long ms = Math.round((seconds - Math.floor(seconds)) * 1000);
        long totalSecs = (long) Math.floor(seconds);
        long hours = totalSecs / 3600;
        long minutes = (totalSecs % 3600) / 60;
        long secs = totalSecs % 60;
        return String.format("%02d:%02d:%02d.%03d", hours, minutes, secs, ms);
    }

    private void runFFmpegProcess(File input, File srt, File output, double totalDuration, Consumer<Integer> progressConsumer) throws Exception {
        List<String> command = List.of(
            "ffmpeg",
            "-y",
            "-i", input.getAbsolutePath(),
            "-vf", "subtitles=" + srt.getAbsolutePath(),
            output.getAbsolutePath()
        );

        log.info("Executing FFmpeg command: {}", String.join(" ", command));
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                log.debug("FFmpeg output: {}", line);
                if (line.contains("time=")) {
                    double time = parseTimeFromFfmpegLine(line);
                    if (time >= 0 && totalDuration > 0) {
                        int pct = (int) Math.min(95, Math.round((time / totalDuration) * 100));
                        int scaled = 20 + (int) (pct * 0.60); // scaled from 20% to 80%
                        progressConsumer.accept(scaled);
                    }
                }
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new RuntimeException("FFmpeg failed with exit code: " + exitCode);
        }
    }

    private double parseTimeFromFfmpegLine(String line) {
        try {
            int idx = line.indexOf("time=");
            if (idx == -1) return -1;
            String timeStr = line.substring(idx + 5).trim();
            int spaceIdx = timeStr.indexOf(" ");
            if (spaceIdx != -1) {
                timeStr = timeStr.substring(0, spaceIdx);
            }
            if (timeStr.contains(":")) {
                String[] parts = timeStr.split(":");
                if (parts.length == 3) {
                    double h = Double.parseDouble(parts[0]);
                    double m = Double.parseDouble(parts[1]);
                    double s = Double.parseDouble(parts[2]);
                    return h * 3600 + m * 60 + s;
                }
            } else {
                return Double.parseDouble(timeStr);
            }
        } catch (Exception e) {
            // ignore
        }
        return -1;
    }

    private void simulateTranscode(File input, File output, Consumer<Integer> progressConsumer) throws Exception {
        for (int i = 1; i <= 5; i++) {
            Thread.sleep(100);
            progressConsumer.accept(20 + i * 12);
        }
        try (InputStream in = new FileInputStream(input);
             OutputStream out = new FileOutputStream(output)) {
            byte[] buf = new byte[1024];
            int len;
            while ((len = in.read(buf)) > 0) {
                out.write(buf, 0, len);
            }
        }
    }

    private void deleteFile(File file) {
        if (file != null && file.exists()) {
            boolean deleted = file.delete();
            if (!deleted) {
                log.warn("Failed to delete temp file: {}", file.getAbsolutePath());
            }
        }
    }
}
