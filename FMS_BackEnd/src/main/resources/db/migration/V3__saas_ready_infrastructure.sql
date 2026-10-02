-- V3: SaaS-ready infrastructure — default organization, tenant columns, soft delete timestamp

CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO organizations (id, name, code, active, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'DEFAULT', 'DEFAULT', TRUE, NOW(), NOW());

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_users INT NOT NULL,
    max_storage_gb INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    subscription_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    start_date DATE NOT NULL,
    end_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_subscriptions_organization ON subscriptions(organization_id);

-- Soft delete timestamp
ALTER TABLE roles ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE permissions ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE refresh_tokens ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE clients ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE client_contacts ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE cases ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE case_notes ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE document_tags ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE documents ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE document_versions ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE tasks ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE task_comments ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE hearings ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE notifications ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE audit_logs ADD COLUMN deleted_at TIMESTAMP;

-- Tenant organization reference
ALTER TABLE roles ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE permissions ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE users ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE refresh_tokens ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE clients ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE client_contacts ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE cases ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE case_notes ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE document_tags ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE documents ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE document_versions ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE tasks ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE task_comments ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE hearings ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE notifications ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE audit_logs ADD COLUMN organization_id UUID REFERENCES organizations(id);

UPDATE roles SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE permissions SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE users SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE refresh_tokens SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE clients SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE client_contacts SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE cases SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE case_notes SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE document_tags SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE documents SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE document_versions SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE tasks SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE task_comments SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE hearings SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE notifications SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE audit_logs SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;

ALTER TABLE users ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE clients ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE cases ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE documents ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE hearings ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE audit_logs ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_clients_organization ON clients(organization_id);
CREATE INDEX idx_cases_organization ON cases(organization_id);
CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_hearings_organization ON hearings(organization_id);
CREATE INDEX idx_tasks_organization ON tasks(organization_id);
CREATE INDEX idx_notifications_organization ON notifications(organization_id);
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
