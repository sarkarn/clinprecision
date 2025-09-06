package com.clinprecision.datacaptureservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormData {

    @NotBlank(message = "Subject ID is required")
    private String subjectId;

    @NotBlank(message = "Subject Visit ID is required")
    private String subjectVisitId;

    @NotBlank(message = "Form Definition ID is required")
    private String formDefinitionId;

    @NotNull(message = "Form data is required")
    private Map<String, Object> data;
}