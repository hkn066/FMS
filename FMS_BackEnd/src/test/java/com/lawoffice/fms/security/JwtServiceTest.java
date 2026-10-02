package com.lawoffice.fms.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.lawoffice.fms.organization.domain.OrganizationConstants;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("test-secret-key-that-is-long-enough-for-hmac-sha256");
        properties.setAccessTokenExpirationMs(900_000L);
        properties.setRefreshTokenExpirationMs(604_800_000L);
        jwtService = new JwtService(properties);
    }

    @Test
    void generateAccessToken_shouldIncludeOrganizationIdClaim() {
        UUID organizationId = OrganizationConstants.DEFAULT_ORGANIZATION_ID;
        User userDetails = new User(
                "admin@hukukofisi.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        String token = jwtService.generateAccessToken(userDetails, organizationId);

        assertEquals("admin@hukukofisi.com", jwtService.extractUsername(token));
        assertTrue(jwtService.extractOrganizationId(token).isPresent());
        assertEquals(organizationId, jwtService.extractOrganizationId(token).get());
    }

    @Test
    void generateAccessToken_withoutOrganizationId_shouldUseDefault() {
        User userDetails = new User(
                "admin@hukukofisi.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        String token = jwtService.generateAccessToken(userDetails);

        assertEquals(
                OrganizationConstants.DEFAULT_ORGANIZATION_ID,
                jwtService.extractOrganizationId(token).orElseThrow());
    }
}
