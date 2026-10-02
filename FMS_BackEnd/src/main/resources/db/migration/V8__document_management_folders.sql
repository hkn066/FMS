-- V8: Doküman yönetimi mantıksal klasör hiyerarşisi (MinIO fiziksel yolları değişmez)

CREATE TABLE folders (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version BIGINT NOT NULL DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES folders(id),
    case_id UUID REFERENCES cases(id),
    is_system BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_folders_organization ON folders(organization_id);
CREATE INDEX idx_folders_parent ON folders(parent_id);
CREATE INDEX idx_folders_case ON folders(case_id);

ALTER TABLE documents ADD COLUMN folder_id UUID REFERENCES folders(id);
CREATE INDEX idx_documents_folder ON documents(folder_id);
