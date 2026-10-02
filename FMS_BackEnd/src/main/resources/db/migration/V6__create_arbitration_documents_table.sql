-- V6: Tahkim modülü belge metadata tablosu (MinIO: arbitration/{caseId}/{category}/{documentId})

CREATE TABLE arbitration_documents (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    arbitration_case_id UUID NOT NULL REFERENCES arbitration_cases(id),
    category VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    content_type VARCHAR(255),
    file_size BIGINT,
    storage_key VARCHAR(1000) NOT NULL,
    uploaded_by_id UUID REFERENCES users(id)
);

CREATE INDEX idx_arbitration_documents_organization ON arbitration_documents(organization_id);
CREATE INDEX idx_arbitration_documents_case ON arbitration_documents(arbitration_case_id);
CREATE INDEX idx_arbitration_documents_category ON arbitration_documents(category);
