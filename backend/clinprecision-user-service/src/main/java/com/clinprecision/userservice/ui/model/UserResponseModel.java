package com.clinprecision.userservice.ui.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
public class UserResponseModel {
    private Long id;        // Numeric primary key needed for UserStudyRole assignments
    private String userId;  // String username for display
    private String firstName;
    private String lastName;
    private String email;
    private List<Long> userTypes; // Added field for user types IDs
}
