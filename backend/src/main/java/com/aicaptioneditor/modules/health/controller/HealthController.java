package com.aicaptioneditor.modules.health.controller;

import com.aicaptioneditor.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check", description = "Operations related to system health monitoring")
public class HealthController {

    @GetMapping
    @Operation(summary = "Get system health status", description = "Checks the health status of the application and returns status UP if active.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200", 
                    description = "System is healthy",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            )
    })
    public ApiResponse<Map<String, Object>> checkHealth() {
        Map<String, Object> statusInfo = Map.of(
                "status", "UP",
                "message", "AI Caption Editor Backend Service is running",
                "systemTime", java.time.LocalDateTime.now().toString()
        );
        return ApiResponse.success("Health check succeeded", statusInfo);
    }
}
