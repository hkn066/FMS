package com.lawoffice.fms.user.application.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private boolean active;
}
