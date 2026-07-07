package com.aicaptioneditor.modules.storage.provider;

import java.io.InputStream;

public interface StorageProvider {
    void upload(String path, InputStream inputStream);
    InputStream download(String path);
    void delete(String path);
    boolean exists(String path);
    String getPublicUrl(String path);
}
