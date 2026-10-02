package com.lawoffice.fms.notification.infrastructure;

import com.lawoffice.fms.notification.domain.Notification;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(UUID userId);

    long countByUserIdAndReadFalseAndDeletedFalse(UUID userId);
}
