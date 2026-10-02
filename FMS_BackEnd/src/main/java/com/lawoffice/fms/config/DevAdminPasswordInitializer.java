package com.lawoffice.fms.config;

import com.lawoffice.fms.user.domain.User;
import com.lawoffice.fms.user.infrastructure.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DevAdminPasswordInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DevAdminPasswordInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        userRepository.findByEmailAndDeletedFalse("admin@hukukofisi.com").ifPresent(user -> {
            user.setPassword(passwordEncoder.encode("Admin123!"));
            userRepository.save(user);
        });
    }
}
