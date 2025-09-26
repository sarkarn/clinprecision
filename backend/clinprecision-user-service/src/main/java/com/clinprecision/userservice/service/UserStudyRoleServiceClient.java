package com.clinprecision.userservice.service;


import com.clinprecision.common.dto.studydesign.StudyResponseDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "admin-ws", path = "/api/studies")
public interface UserStudyRoleServiceClient {

    @GetMapping("/{id}")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="findHighestPriorityActiveRoleByUserIdFallback")
    public ResponseEntity<StudyResponseDto> findHighestPriorityActiveRoleByUserId(@PathVariable Long id, @RequestHeader("Authorization") String authorization);

    default ResponseEntity<StudyResponseDto> findHighestPriorityActiveRoleByUserIdFallback(@PathVariable Long id, String authorization, Throwable exception) {
        System.out.println("Param = " + id);
        System.out.println("Exception class=" + exception.getClass().getName());
        System.out.println("Exception took place: " + exception.getMessage());
        StudyResponseDto dto = new StudyResponseDto();
        return ResponseEntity.ok(dto);
    }
}
