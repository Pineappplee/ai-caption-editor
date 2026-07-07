package com.aicaptioneditor.modules.health.controller;

import com.aicaptioneditor.common.api.ApiResponse;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class HealthControllerTest {

    @Test
    void testCheckHealth() {
        HealthController healthController = new HealthController();
        ApiResponse<Map<String, Object>> response = healthController.checkHealth();

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("Health check succeeded", response.getMessage());
        
        Map<String, Object> data = response.getData();
        assertNotNull(data);
        assertEquals("UP", data.get("status"));
        assertEquals("AI Caption Editor Backend Service is running", data.get("message"));
        assertNotNull(data.get("systemTime"));
    }
}
