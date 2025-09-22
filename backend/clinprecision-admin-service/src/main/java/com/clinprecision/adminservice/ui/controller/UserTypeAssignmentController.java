package com.clinprecision.adminservice.ui.controller;

import com.clinprecision.adminservice.service.UserAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users/{userId}/types")
public class UserTypeAssignmentController {

    @Autowired
    private UserAssignmentService userAssignmentService;

    /**
     * Get all user types assigned to a user
     * @param userId User ID
     * @return List of user type IDs assigned to the user
     */
    @GetMapping(produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
   // @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN') or principal == #userId")
    public ResponseEntity<List<Long>> getUserTypes(@PathVariable("userId") String userId) {
        List<Long> userTypeIds = userAssignmentService.getUserTypeIds(userId);
        return ResponseEntity.ok(userTypeIds);
    }

    /**
     * Assign a user type to a user
     * @param userId User ID
     * @param typeId User type ID
     * @return Success message
     */
    @PostMapping(value = "/{typeId}", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<String> assignUserType(
            @PathVariable("userId") String userId,
            @PathVariable("typeId") Long typeId) {
        
        userAssignmentService.assignUserType(userId, typeId);
        return ResponseEntity.status(HttpStatus.OK).body("User type assigned successfully");
    }

    /**
     * Remove a user type from a user
     * @param userId User ID
     * @param typeId User type ID
     * @return Success message
     */
    @DeleteMapping(value = "/{typeId}", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<String> removeUserType(
            @PathVariable("userId") String userId,
            @PathVariable("typeId") Long typeId) {
        
        userAssignmentService.removeUserType(userId, typeId);
        return ResponseEntity.status(HttpStatus.OK).body("User type removed successfully");
    }
}
