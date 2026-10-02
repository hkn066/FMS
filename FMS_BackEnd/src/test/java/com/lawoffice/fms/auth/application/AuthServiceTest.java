package com.lawoffice.fms.auth.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.lawoffice.fms.audit.application.AuditService;
import com.lawoffice.fms.auth.application.dto.LoginRequest;
import com.lawoffice.fms.auth.application.dto.TokenResponse;
import com.lawoffice.fms.auth.infrastructure.RefreshTokenRepository;
import com.lawoffice.fms.organization.domain.OrganizationConstants;
import com.lawoffice.fms.role.domain.Role;
import com.lawoffice.fms.role.domain.RoleName;
import com.lawoffice.fms.security.JwtProperties;
import com.lawoffice.fms.security.JwtService;
import com.lawoffice.fms.user.domain.User;
import com.lawoffice.fms.user.infrastructure.UserRepository;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private JwtProperties jwtProperties;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        Role role = Role.builder().name(RoleName.ROLE_ADMIN).build();
        user = User.builder()
                .email("admin@hukukofisi.com")
                .password("encoded")
                .firstName("System")
                .lastName("Admin")
                .roles(Set.of(role))
                .active(true)
                .build();
        user.setId(UUID.randomUUID());
        user.setOrganizationId(OrganizationConstants.DEFAULT_ORGANIZATION_ID);
    }

    @Test
    void login_shouldReturnTokens() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@hukukofisi.com");
        request.setPassword("Admin123!");

        var principal = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))
                .build();

        when(authenticationManager.authenticate(any()))
                .thenReturn(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
        when(userRepository.findByEmailAndDeletedFalse("admin@hukukofisi.com")).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(any(), any())).thenReturn("access-token");
        when(jwtService.generateRefreshTokenValue()).thenReturn("refresh-token");
        when(jwtProperties.getRefreshTokenExpirationMs()).thenReturn(604800000L);
        when(jwtProperties.getAccessTokenExpirationMs()).thenReturn(900000L);
        when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TokenResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals("admin@hukukofisi.com", response.getUser().getEmail());
    }
}
