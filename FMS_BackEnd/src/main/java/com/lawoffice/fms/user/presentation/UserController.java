package com.lawoffice.fms.user.presentation;

import com.lawoffice.fms.common.dto.ApiResponse;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.user.application.dto.UserResponse;
import com.lawoffice.fms.user.infrastructure.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "Kullanıcı yönetimi")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mevcut kullanıcı profili")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository
                .findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));

        UserResponse response = UserResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .active(user.isActive())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
