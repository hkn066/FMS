package com.lawoffice.fms.auth.application;

import com.lawoffice.fms.audit.application.AuditService;
import com.lawoffice.fms.audit.domain.AuditAction;
import com.lawoffice.fms.auth.application.dto.ChangePasswordRequest;
import com.lawoffice.fms.auth.application.dto.LoginRequest;
import com.lawoffice.fms.auth.application.dto.RefreshTokenRequest;
import com.lawoffice.fms.auth.application.dto.TokenResponse;
import com.lawoffice.fms.auth.domain.RefreshToken;
import com.lawoffice.fms.auth.infrastructure.RefreshTokenRepository;
import com.lawoffice.fms.common.exception.BusinessException;
import com.lawoffice.fms.security.JwtProperties;
import com.lawoffice.fms.security.JwtService;
import com.lawoffice.fms.user.domain.User;
import com.lawoffice.fms.user.infrastructure.UserRepository;
import java.time.Instant;
import java.util.stream.Collectors;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            JwtProperties jwtProperties,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository
                .findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new BusinessException("Kullanıcı bulunamadı"));

        String accessToken = jwtService.generateAccessToken(
                (org.springframework.security.core.userdetails.User) authentication.getPrincipal(),
                user.getOrganizationId());

        refreshTokenRepository.deleteByUserId(user.getId());
        String refreshTokenValue = jwtService.generateRefreshTokenValue();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenValue)
                .user(user)
                .expiresAt(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpirationMs()))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        auditService.log(AuditAction.LOGIN, "User", user.getId(), "User logged in");

        return buildTokenResponse(user, accessToken, refreshTokenValue);
    }

    @Transactional
    public TokenResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByTokenAndRevokedFalse(request.getRefreshToken())
                .orElseThrow(() -> new BusinessException("Geçersiz refresh token"));

        if (refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new BusinessException("Refresh token süresi dolmuş");
        }

        User user = refreshToken.getUser();
        var userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                        .map(r -> r.getName().name())
                        .map(org.springframework.security.core.authority.SimpleGrantedAuthority::new)
                        .collect(Collectors.toSet()))
                .build();

        String accessToken = jwtService.generateAccessToken(userDetails, user.getOrganizationId());
        return buildTokenResponse(user, accessToken, refreshToken.getToken());
    }

    @Transactional
    public void logout() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        userRepository.findByEmailAndDeletedFalse(email).ifPresent(user -> {
            refreshTokenRepository.deleteByUserId(user.getId());
            auditService.log(AuditAction.LOGOUT, "User", user.getId(), "User logged out");
        });
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository
                .findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new BusinessException("Kullanıcı bulunamadı"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException("Mevcut şifre hatalı");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenRepository.deleteByUserId(user.getId());
    }

    private TokenResponse buildTokenResponse(User user, String accessToken, String refreshToken) {
        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getAccessTokenExpirationMs() / 1000)
                .user(TokenResponse.UserInfo.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .roles(user.getRoles().stream()
                                .map(r -> r.getName().name())
                                .collect(Collectors.toList()))
                        .build())
                .build();
    }
}
