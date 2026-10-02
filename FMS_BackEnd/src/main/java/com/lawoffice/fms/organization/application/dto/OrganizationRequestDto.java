package com.lawoffice.fms.organization.application.dto;

import com.lawoffice.fms.organization.domain.SubscriptionPlan;
import com.lawoffice.fms.organization.domain.SubscriptionStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.Instant;
import lombok.Data;

@Data
public class OrganizationRequestDto {

    @NotBlank(message = "Kurum adı zorunludur")
    private String name;

    @NotBlank(message = "Alt alan adı zorunludur")
    @Pattern(
            regexp = "^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$",
            message = "Alt alan adı yalnızca küçük harf, rakam ve tire içerebilir")
    private String subDomain;

    @NotNull(message = "Abonelik planı zorunludur")
    private SubscriptionPlan subscriptionPlan;

    @NotNull(message = "Abonelik durumu zorunludur")
    private SubscriptionStatus subscriptionStatus;

    @Min(value = 1, message = "Maksimum kullanıcı sayısı en az 1 olmalıdır")
    private int maxUsers = 5;

    private Instant expiresAt;
}
