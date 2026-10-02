-- V7: Organization subscription fields, soft delete, system tenant seed

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS sub_domain VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) NOT NULL DEFAULT 'FREE';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS max_users INT NOT NULL DEFAULT 5;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS organization_id UUID;

UPDATE organizations
SET sub_domain = LOWER(code)
WHERE sub_domain IS NULL AND code IS NOT NULL;

UPDATE organizations
SET subscription_status = CASE WHEN active THEN 'ACTIVE' ELSE 'CANCELED' END
WHERE subscription_status = 'ACTIVE' AND active IS NOT NULL;

UPDATE organizations
SET subscription_plan = 'FREE'
WHERE subscription_plan IS NULL OR subscription_plan = 'FREE';

INSERT INTO organizations (
    id,
    name,
    code,
    active,
    sub_domain,
    subscription_plan,
    subscription_status,
    max_users,
    created_at,
    updated_at,
    deleted,
    version
)
SELECT
    '00000000-0000-0000-0000-000000000000',
    'Sistem Yönetimi / Default Tenant',
    'SYSTEM',
    TRUE,
    'system',
    'ENTERPRISE',
    'ACTIVE',
    999,
    NOW(),
    NOW(),
    FALSE,
    0
WHERE NOT EXISTS (
    SELECT 1 FROM organizations WHERE id = '00000000-0000-0000-0000-000000000000'
);

UPDATE organizations
SET
    name = 'Sistem Yönetimi / Default Tenant',
    sub_domain = 'system',
    subscription_plan = 'ENTERPRISE',
    subscription_status = 'ACTIVE',
    max_users = 999,
    updated_at = NOW(),
    deleted = FALSE
WHERE id = '00000000-0000-0000-0000-000000000000';

UPDATE roles SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE permissions SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE users SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE refresh_tokens SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE clients SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE client_contacts SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE cases SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE case_notes SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE document_tags SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE documents SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE document_versions SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE tasks SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE task_comments SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE hearings SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE notifications SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE audit_logs SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE arbitration_cases SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';
UPDATE arbitration_documents SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';

UPDATE subscriptions SET organization_id = '00000000-0000-0000-0000-000000000000'
WHERE organization_id = '00000000-0000-0000-0000-000000000001';

UPDATE organizations
SET deleted = TRUE, deleted_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';

ALTER TABLE organizations DROP COLUMN IF EXISTS code;
ALTER TABLE organizations DROP COLUMN IF EXISTS active;

ALTER TABLE organizations ALTER COLUMN sub_domain SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uk_organizations_sub_domain ON organizations (sub_domain);
