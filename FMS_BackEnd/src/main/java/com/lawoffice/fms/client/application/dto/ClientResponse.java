package com.lawoffice.fms.client.application.dto;

import com.lawoffice.fms.client.domain.ClientStatus;
import com.lawoffice.fms.client.domain.ClientType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClientResponse {

    private String id;
    private String name;
    private String email;
    private String phone;
    private String taxNumber;
    private String address;
    private ClientType type;
    private ClientStatus status;
}
