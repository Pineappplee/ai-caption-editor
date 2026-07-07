package com.aicaptioneditor.modules.auth.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.PublicKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class GooglePublicKeyProvider {

    private static final String GOOGLE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken-system@system.gserviceaccount.com";
    
    private final Map<String, PublicKey> publicKeysCache = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PublicKey getPublicKey(String kid) {
        if (publicKeysCache.containsKey(kid)) {
            return publicKeysCache.get(kid);
        }
        
        log.info("Key ID {} not found in cache. Refreshing Google public keys...", kid);
        refreshCerts();
        
        return publicKeysCache.get(kid);
    }

    private synchronized void refreshCerts() {
        try {
            String json = restTemplate.getForObject(GOOGLE_CERTS_URL, String.class);
            if (json == null) {
                return;
            }
            
            Map<String, String> certsMap = objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            
            Map<String, PublicKey> newKeys = new ConcurrentHashMap<>();
            for (Map.Entry<String, String> entry : certsMap.entrySet()) {
                String certContent = entry.getValue();
                ByteArrayInputStream bais = new ByteArrayInputStream(certContent.getBytes(StandardCharsets.UTF_8));
                X509Certificate cert = (X509Certificate) cf.generateCertificate(bais);
                newKeys.put(entry.getKey(), cert.getPublicKey());
            }
            
            publicKeysCache.clear();
            publicKeysCache.putAll(newKeys);
            log.info("Successfully refreshed {} Google public keys.", publicKeysCache.size());
        } catch (Exception e) {
            log.error("Failed to fetch/parse Google public certificates", e);
        }
    }
}
