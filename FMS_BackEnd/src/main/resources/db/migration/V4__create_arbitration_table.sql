-- V4: Tahkim (arbitration) modülü — casemanagement'tan bağımsız evrak tabanlı dosya yönetimi

CREATE TABLE arbitration_cases (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    license_plate VARCHAR(20) NOT NULL,
    client_name_surname VARCHAR(255) NOT NULL,
    arbitration_file_number VARCHAR(50) NOT NULL,
    court_basis_number VARCHAR(50) NOT NULL,
    folder_name VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PRE_APPLICATION'
);

CREATE INDEX idx_arbitration_cases_organization ON arbitration_cases(organization_id);
CREATE INDEX idx_arbitration_cases_status ON arbitration_cases(status);
CREATE INDEX idx_arbitration_cases_arbitration_file_number ON arbitration_cases(arbitration_file_number);
CREATE INDEX idx_arbitration_cases_folder_name ON arbitration_cases(folder_name);
