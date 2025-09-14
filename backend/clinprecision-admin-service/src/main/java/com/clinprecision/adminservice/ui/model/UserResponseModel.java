package com.clinprecision.adminservice.ui.model;

import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
public class UserResponseModel {
    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private List<Long> userTypes; // Added field for user types IDs
}
