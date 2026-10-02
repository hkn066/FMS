package com.lawoffice.fms.notification.application;

import com.lawoffice.fms.config.RabbitMQConfig;
import java.util.Map;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.rabbitmq.enabled", havingValue = "true", matchIfMissing = true)
public class NotificationPublisher {

    private final RabbitTemplate rabbitTemplate;

    public NotificationPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(String title, String message, String userId) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_QUEUE,
                Map.of("title", title, "message", message, "userId", userId));
    }
}
