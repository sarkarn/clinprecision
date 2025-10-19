package com.clinprecision.clinopsservice.visit.controller;

import com.clinprecision.clinopsservice.visit.dto.UnscheduledVisitConfigDto;
import com.clinprecision.clinopsservice.visit.entity.UnscheduledVisitConfigEntity;
import com.clinprecision.clinopsservice.visit.repository.UnscheduledVisitConfigRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for managing unscheduled visit configurations.
 * 
 * Provides CRUD operations for system-wide unscheduled visit types that are
 * automatically created during study builds.
 * 
 * SECURITY: Should be restricted to system administrators
 * USE CASE: Configure available unscheduled visit types (Discontinuation, AE, Safety, etc.)
 */
@RestController
@RequestMapping("/api/clinops/unscheduled-visit-config")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UnscheduledVisitConfigController {

    private final UnscheduledVisitConfigRepository repository;

    /**
     * Get all unscheduled visit configurations (enabled and disabled)
     * 
     * GET /api/clinops/unscheduled-visit-config
     */
    @GetMapping
    public ResponseEntity<List<UnscheduledVisitConfigDto>> getAllConfigurations() {
        log.info("Fetching all unscheduled visit configurations");
        
        List<UnscheduledVisitConfigEntity> entities = repository.findAllByOrderByVisitOrderAsc();
        List<UnscheduledVisitConfigDto> dtos = entities.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
        
        log.info("Found {} unscheduled visit configurations", dtos.size());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get only enabled unscheduled visit configurations
     * 
     * GET /api/clinops/unscheduled-visit-config/enabled
     */
    @GetMapping("/enabled")
    public ResponseEntity<List<UnscheduledVisitConfigDto>> getEnabledConfigurations() {
        log.info("Fetching enabled unscheduled visit configurations");
        
        List<UnscheduledVisitConfigEntity> entities = repository.findByIsEnabledTrueOrderByVisitOrderAsc();
        List<UnscheduledVisitConfigDto> dtos = entities.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
        
        log.info("Found {} enabled unscheduled visit configurations", dtos.size());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Get a specific configuration by ID
     * 
     * GET /api/clinops/unscheduled-visit-config/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UnscheduledVisitConfigDto> getConfigurationById(@PathVariable Long id) {
        log.info("Fetching unscheduled visit configuration: id={}", id);
        
        return repository.findById(id)
            .map(entity -> {
                log.info("Found configuration: id={}, code={}", id, entity.getVisitCode());
                return ResponseEntity.ok(toDto(entity));
            })
            .orElseGet(() -> {
                log.warn("Configuration not found: id={}", id);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Get a specific configuration by visit code
     * 
     * GET /api/clinops/unscheduled-visit-config/by-code/{code}
     */
    @GetMapping("/by-code/{code}")
    public ResponseEntity<UnscheduledVisitConfigDto> getConfigurationByCode(@PathVariable String code) {
        log.info("Fetching unscheduled visit configuration by code: {}", code);
        
        return repository.findByVisitCode(code)
            .map(entity -> {
                log.info("Found configuration: code={}, name={}", code, entity.getVisitName());
                return ResponseEntity.ok(toDto(entity));
            })
            .orElseGet(() -> {
                log.warn("Configuration not found: code={}", code);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Create a new unscheduled visit configuration
     * 
     * POST /api/clinops/unscheduled-visit-config
     */
    @PostMapping
    public ResponseEntity<?> createConfiguration(
            @Valid @RequestBody UnscheduledVisitConfigDto dto,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        
        log.info("Creating new unscheduled visit configuration: code={}, name={}", 
                dto.getVisitCode(), dto.getVisitName());
        
        // Check if visit code already exists
        if (repository.existsByVisitCode(dto.getVisitCode())) {
            log.warn("Visit code already exists: {}", dto.getVisitCode());
            return ResponseEntity.badRequest()
                .body("Visit code '" + dto.getVisitCode() + "' already exists");
        }
        
        UnscheduledVisitConfigEntity entity = toEntity(dto);
        entity.setCreatedBy(userEmail != null ? userEmail : "SYSTEM");
        
        UnscheduledVisitConfigEntity saved = repository.save(entity);
        
        log.info("Created unscheduled visit configuration: id={}, code={}", 
                saved.getId(), saved.getVisitCode());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    /**
     * Update an existing unscheduled visit configuration
     * 
     * PUT /api/clinops/unscheduled-visit-config/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateConfiguration(
            @PathVariable Long id,
            @Valid @RequestBody UnscheduledVisitConfigDto dto,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        
        log.info("Updating unscheduled visit configuration: id={}", id);
        
        return repository.findById(id)
            .map(existing -> {
                // Check if visit code is being changed and if new code already exists
                if (!existing.getVisitCode().equals(dto.getVisitCode()) &&
                    repository.existsByVisitCode(dto.getVisitCode())) {
                    log.warn("Visit code already exists: {}", dto.getVisitCode());
                    return ResponseEntity.badRequest()
                        .body("Visit code '" + dto.getVisitCode() + "' already exists");
                }
                
                // Update fields
                existing.setVisitCode(dto.getVisitCode());
                existing.setVisitName(dto.getVisitName());
                existing.setDescription(dto.getDescription());
                existing.setVisitOrder(dto.getVisitOrder());
                existing.setIsEnabled(dto.getIsEnabled());
                existing.setUpdatedBy(userEmail != null ? userEmail : "SYSTEM");
                
                UnscheduledVisitConfigEntity saved = repository.save(existing);
                
                log.info("Updated unscheduled visit configuration: id={}, code={}", 
                        saved.getId(), saved.getVisitCode());
                
                return ResponseEntity.ok(toDto(saved));
            })
            .orElseGet(() -> {
                log.warn("Configuration not found for update: id={}", id);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Enable/disable a configuration (soft enable/disable)
     * 
     * PATCH /api/clinops/unscheduled-visit-config/{id}/toggle
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<UnscheduledVisitConfigDto> toggleConfiguration(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        
        log.info("Toggling unscheduled visit configuration: id={}", id);
        
        return repository.findById(id)
            .map(entity -> {
                boolean newState = !entity.getIsEnabled();
                entity.setIsEnabled(newState);
                entity.setUpdatedBy(userEmail != null ? userEmail : "SYSTEM");
                
                UnscheduledVisitConfigEntity saved = repository.save(entity);
                
                log.info("Toggled configuration: id={}, code={}, enabled={}", 
                        saved.getId(), saved.getVisitCode(), newState);
                
                return ResponseEntity.ok(toDto(saved));
            })
            .orElseGet(() -> {
                log.warn("Configuration not found for toggle: id={}", id);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Delete a configuration (hard delete)
     * 
     * DELETE /api/clinops/unscheduled-visit-config/{id}
     * 
     * WARNING: This will prevent future studies from using this visit type.
     * Existing studies that already have this visit type will not be affected.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable Long id) {
        log.info("Deleting unscheduled visit configuration: id={}", id);
        
        if (!repository.existsById(id)) {
            log.warn("Configuration not found for deletion: id={}", id);
            return ResponseEntity.notFound().build();
        }
        
        repository.deleteById(id);
        
        log.info("Deleted unscheduled visit configuration: id={}", id);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // DTO Conversion Methods
    // ============================================================

    private UnscheduledVisitConfigDto toDto(UnscheduledVisitConfigEntity entity) {
        return UnscheduledVisitConfigDto.builder()
            .id(entity.getId())
            .visitCode(entity.getVisitCode())
            .visitName(entity.getVisitName())
            .description(entity.getDescription())
            .visitOrder(entity.getVisitOrder())
            .isEnabled(entity.getIsEnabled())
            .createdBy(entity.getCreatedBy())
            .updatedBy(entity.getUpdatedBy())
            .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
            .updatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null)
            .build();
    }

    private UnscheduledVisitConfigEntity toEntity(UnscheduledVisitConfigDto dto) {
        return UnscheduledVisitConfigEntity.builder()
            .id(dto.getId())
            .visitCode(dto.getVisitCode())
            .visitName(dto.getVisitName())
            .description(dto.getDescription())
            .visitOrder(dto.getVisitOrder())
            .isEnabled(dto.getIsEnabled() != null ? dto.getIsEnabled() : true)
            .build();
    }
}
