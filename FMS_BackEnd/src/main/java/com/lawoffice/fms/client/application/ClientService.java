package com.lawoffice.fms.client.application;

import com.lawoffice.fms.audit.application.AuditService;
import com.lawoffice.fms.audit.domain.AuditAction;
import com.lawoffice.fms.client.application.dto.ClientRequest;
import com.lawoffice.fms.client.application.dto.ClientResponse;
import com.lawoffice.fms.client.domain.Client;
import com.lawoffice.fms.client.domain.ClientStatus;
import com.lawoffice.fms.client.infrastructure.ClientRepository;
import com.lawoffice.fms.common.dto.PageResponse;
import com.lawoffice.fms.common.exception.BusinessException;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.common.tenant.TenantContext;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final AuditService auditService;

    public ClientService(ClientRepository clientRepository, AuditService auditService) {
        this.clientRepository = clientRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public PageResponse<ClientResponse> findAll(Pageable pageable) {
        Page<Client> page = clientRepository.findAll(pageable);
        return toPageResponse(page);
    }

    @Cacheable(value = "clients", key = "#id")
    @Transactional(readOnly = true)
    public ClientResponse findById(UUID id) {
        return toResponse(getClient(id));
    }

    @Transactional
    @CacheEvict(value = "clients", allEntries = true)
    public ClientResponse create(ClientRequest request) {
        TenantContext.requireOrganizationId();

        if (clientRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Bu e-posta adresi zaten kayıtlı");
        }

        Client client = Client.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .taxNumber(request.getTaxNumber())
                .address(request.getAddress())
                .type(request.getType())
                .status(ClientStatus.ACTIVE)
                .build();

        Client saved = clientRepository.save(client);
        auditService.log(AuditAction.CREATE, "Client", saved.getId(), "Client created: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "clients", key = "#id")
    public ClientResponse update(UUID id, ClientRequest request) {
        Client client = getClient(id);
        client.setName(request.getName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setTaxNumber(request.getTaxNumber());
        client.setAddress(request.getAddress());
        client.setType(request.getType());

        Client saved = clientRepository.save(client);
        auditService.log(AuditAction.UPDATE, "Client", saved.getId(), "Client updated");
        return toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = "clients", key = "#id")
    public void delete(UUID id) {
        Client client = getClient(id);
        client.markDeleted();
        clientRepository.save(client);
        auditService.log(AuditAction.DELETE, "Client", id, "Client soft deleted");
    }

    private Client getClient(UUID id) {
        return clientRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Müvekkil bulunamadı"));
    }

    private ClientResponse toResponse(Client client) {
        return ClientResponse.builder()
                .id(client.getId().toString())
                .name(client.getName())
                .email(client.getEmail())
                .phone(client.getPhone())
                .taxNumber(client.getTaxNumber())
                .address(client.getAddress())
                .type(client.getType())
                .status(client.getStatus())
                .build();
    }

    private PageResponse<ClientResponse> toPageResponse(Page<Client> page) {
        return PageResponse.<ClientResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
