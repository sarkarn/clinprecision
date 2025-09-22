package com.clinprecision.studydesignservice.service;


import com.clinprecision.common.dto.FormTemplateDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "admin-ws", path = "/api/form-templates")
public interface FormTemplateServiceClient {

    @GetMapping("/{id}")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="getFormTemplateByIdFallback")
    public ResponseEntity<FormTemplateDto> getFormTemplateById(@PathVariable Long id, @RequestHeader("Authorization") String authorization);

    default ResponseEntity<FormTemplateDto> getFormTemplateByIdFallback(@PathVariable Long id, String authorization, Throwable exception) {
        System.out.println("Param = " + id);
        System.out.println("Exception class=" + exception.getClass().getName());
        System.out.println("Exception took place: " + exception.getMessage());
        FormTemplateDto dto = new FormTemplateDto();
        return ResponseEntity.ok(dto);
    }

    /**
     * Increment template usage count
     * POST /api/form-templates/template/{templateId}
     */
    @PostMapping("/template/{templateId}")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="incrementTemplateUsageFallback")
    public void incrementTemplateUsage(@PathVariable Long templateId, @RequestHeader("Authorization") String authorization);

    default void incrementTemplateUsageFallback(@PathVariable Long templateId, String authorization, Throwable exception) {
        System.out.println("Param = " + templateId);
        System.out.println("Exception class=" + exception.getClass().getName());
        System.out.println("Exception took place: " + exception.getMessage());
    }
}
