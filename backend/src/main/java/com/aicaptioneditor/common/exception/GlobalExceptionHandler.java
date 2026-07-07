package com.aicaptioneditor.common.exception;

import com.aicaptioneditor.common.api.ApiError;
import com.aicaptioneditor.common.api.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.HttpRequestMethodNotSupportedException;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleApiException(ApiException ex) {
        log.warn("API Exception occurred: {} - {}", ex.getStatus(), ex.getMessage());
        ApiError error = ApiError.builder()
                .code(ex.getCode())
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(ApiResponse.error(ex.getMessage(), error), ex.getStatus());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleNoResourceFoundException(NoResourceFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .code("NOT_FOUND")
                .message("The requested resource was not found")
                .build();
        return new ResponseEntity<>(ApiResponse.error("Not Found", error), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleMethodNotSupportedException(HttpRequestMethodNotSupportedException ex) {
        log.warn("Method not supported: {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .code("METHOD_NOT_ALLOWED")
                .message(ex.getMessage())
                .build();
        return new ResponseEntity<>(ApiResponse.error("Method Not Allowed", error), HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleValidationException(MethodArgumentNotValidException ex) {
        log.warn("Validation error occurred: {} fields failed validation", ex.getBindingResult().getFieldErrors().size());
        List<ApiError.ValidationError> details = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            details.add(ApiError.ValidationError.builder()
                    .field(fieldError.getField())
                    .message(fieldError.getDefaultMessage())
                    .rejectedValue(fieldError.getRejectedValue())
                    .build());
        }

        ApiError error = ApiError.builder()
                .code("VALIDATION_ERROR")
                .message("Request validation failed")
                .details(details)
                .build();

        return new ResponseEntity<>(ApiResponse.error("Validation failed", error), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiResponse<ApiError>> handleMethodValidationException(HandlerMethodValidationException ex) {
        log.warn("Method validation error occurred: {}", ex.getMessage());
        ApiError error = ApiError.builder()
                .code("VALIDATION_ERROR")
                .message(ex.getReason() != null ? ex.getReason() : "Request validation failed")
                .build();
        return new ResponseEntity<>(ApiResponse.error("Validation failed", error), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<ApiError>> handleGenericException(Exception ex) {
        log.error("Unhandled exception caught by global handler", ex);
        ApiError error = ApiError.builder()
                .code("INTERNAL_SERVER_ERROR")
                .message("An unexpected error occurred on the server")
                .build();
        return new ResponseEntity<>(ApiResponse.error("Internal Server Error", error), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
