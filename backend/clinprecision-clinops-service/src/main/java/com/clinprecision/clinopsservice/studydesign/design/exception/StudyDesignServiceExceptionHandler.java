package com.clinprecision.clinopsservice.studydesign.design.exception;


import com.clinprecision.clinopsservice.studydesign.studymgmt.exception.StudyControllerExceptionHandler.ErrorResponse;
import com.clinprecision.clinopsservice.studydesign.studymgmt.exception.StudyNotFoundException;
import com.clinprecision.clinopsservice.studydesign.studymgmt.exception.StudyValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class StudyDesignServiceExceptionHandler {

    @ExceptionHandler(value = StudyValidationException.class)
    public ResponseEntity<ErrorResponse> handleException(StudyValidationException ex) {
        ErrorResponse error = new ErrorResponse("STUDY_VALIDATION_ERROR", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(value = StudyNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleException(StudyNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("STUDY_NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception ex) {
        ErrorResponse error = new ErrorResponse("INTERNAL_SERVER_ERROR", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}



