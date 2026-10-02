package com.lawoffice.fms.subscription.infrastructure;

import com.lawoffice.fms.subscription.domain.SubscriptionPlan;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, UUID> {}
