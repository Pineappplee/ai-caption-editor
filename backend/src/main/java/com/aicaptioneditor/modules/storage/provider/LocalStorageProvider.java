package com.aicaptioneditor.modules.storage.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Slf4j
@Service
@Primary
public class LocalStorageProvider implements StorageProvider {

    @Value("${storage.local.base-dir:uploads}")
    private String baseDir;

    @Override
    public void upload(String path, InputStream inputStream) {
        try {
            Path target = getFullPath(path);
            Files.createDirectories(target.getParent());
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            log.info("File successfully uploaded to: {}", target.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to upload file to path: {}", path, e);
            throw new RuntimeException("Failed to upload file to local storage", e);
        }
    }

    @Override
    public InputStream download(String path) {
        try {
            Path target = getFullPath(path);
            if (!Files.exists(target)) {
                throw new RuntimeException("File not found in local storage: " + path);
            }
            return Files.newInputStream(target);
        } catch (IOException e) {
            log.error("Failed to download file from path: {}", path, e);
            throw new RuntimeException("Failed to download file from local storage", e);
        }
    }

    @Override
    public void delete(String path) {
        try {
            Path target = getFullPath(path);
            boolean deleted = Files.deleteIfExists(target);
            if (deleted) {
                log.info("File successfully deleted from: {}", target.toAbsolutePath());
            } else {
                log.warn("File to delete did not exist: {}", target.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("Failed to delete file at path: {}", path, e);
            throw new RuntimeException("Failed to delete file from local storage", e);
        }
    }

    @Override
    public boolean exists(String path) {
        return Files.exists(getFullPath(path));
    }

    @Override
    public String getPublicUrl(String path) {
        // Expose via WebMvcConfigurer static resource handler
        return "/uploads/" + path;
    }

    private Path getFullPath(String path) {
        return Paths.get(baseDir).resolve(path).normalize();
    }
}
