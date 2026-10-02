package com.lawoffice.fms.subscription.infrastructure;

import com.lawoffice.fms.subscription.domain.Subscription;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {}
