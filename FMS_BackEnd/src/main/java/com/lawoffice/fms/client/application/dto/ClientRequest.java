package com.lawoffice.fms.client.application.dto;

import com.lawoffice.fms.client.domain.ClientType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClientRequest {

    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    private String phone;
    private String taxNumber;
    private String address;

    @NotNull
    private ClientType type;
}
