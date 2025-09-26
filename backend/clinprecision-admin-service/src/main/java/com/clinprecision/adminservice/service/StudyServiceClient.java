package com.clinprecision.adminservice.service;


import com.clinprecision.common.dto.studydesign.StudyResponseDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "study-design-ws", path = "/api/studies")
public interface StudyServiceClient {

    @GetMapping("/{id}")
    @Retry(name="study-design-ws")
    @CircuitBreaker(name="study-design-ws", fallbackMethod="getStudyByIdFallback")
    public ResponseEntity<StudyResponseDto> getStudyById(@PathVariable Long id, @RequestHeader("Authorization") String authorization);

    default ResponseEntity<StudyResponseDto> getStudyByIdFallback(@PathVariable Long id, String authorization, Throwable exception) {
        System.out.println("Param = " + id);
        System.out.println("Exception class=" + exception.getClass().getName());
        System.out.println("Exception took place: " + exception.getMessage());
        StudyResponseDto dto = new StudyResponseDto();
        return ResponseEntity.ok(dto);
    }
}
