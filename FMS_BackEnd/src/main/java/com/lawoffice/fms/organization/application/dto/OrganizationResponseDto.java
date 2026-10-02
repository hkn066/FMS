package com.lawoffice.fms.organization.application.dto;

import com.lawoffice.fms.organization.domain.SubscriptionPlan;
import com.lawoffice.fms.organization.domain.SubscriptionStatus;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrganizationResponseDto {

    private String id;
    private String name;
    private String subDomain;
    private SubscriptionPlan subscriptionPlan;
    private SubscriptionStatus subscriptionStatus;
    private int maxUsers;
    private Instant expiresAt;
    private Instant createdAt;
    private Instant updatedAt;
}
