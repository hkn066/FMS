-- V11: DMS hiyerarşisi — Genel Dosyalar / Tahkim Dosyaları + tahkim durum klasörleri + case root FK

ALTER TABLE arbitration_cases
    ADD COLUMN IF NOT EXISTS dms_root_folder_id UUID REFERENCES folders (id);

-- Sistem kök klasör adları
UPDATE folders SET name = 'Genel Dosyalar' WHERE id = '88888888-8888-8888-8888-888888888801';
UPDATE folders SET name = 'Sigorta Tahkim' WHERE id = '88888888-8888-8888-8888-888888888802';

-- Genel evrak klasörlerini Genel Dosyalar altına taşı
UPDATE folders
SET parent_id = '88888888-8888-8888-8888-888888888801'
WHERE id IN (
    '88888888-8888-8888-8888-888888888811',
    '88888888-8888-8888-8888-888888888812',
    '88888888-8888-8888-8888-888888888813',
    '88888888-8888-8888-8888-888888888814',
    '88888888-8888-8888-8888-888888888817'
)
  AND parent_id IS NULL;

-- Tahkim durum klasörleri (sistem)
INSERT INTO folders (id, created_at, updated_at, created_by, version, deleted, organization_id, name, parent_id, case_id, is_system) VALUES
('88888888-8888-8888-8888-888888888821', NOW(), NOW(), 'system', 0, FALSE, '00000000-0000-0000-0000-000000000001', 'Ön Başvuru', '88888888-8888-8888-8888-888888888802', NULL, TRUE),
('88888888-8888-8888-8888-888888888822', NOW(), NOW(), 'system', 0, FALSE, '00000000-0000-0000-0000-000000000001', 'Komisyonda', '88888888-8888-8888-8888-888888888802', NULL, TRUE),
('88888888-8888-8888-8888-888888888823', NOW(), NOW(), 'system', 0, FALSE, '00000000-0000-0000-0000-000000000001', 'Eksper İncelemesi', '88888888-8888-8888-8888-888888888802', NULL, TRUE),
('88888888-8888-8888-8888-888888888824', NOW(), NOW(), 'system', 0, FALSE, '00000000-0000-0000-0000-000000000001', 'Karar', '88888888-8888-8888-8888-888888888802', NULL, TRUE),
('88888888-8888-8888-8888-888888888825', NOW(), NOW(), 'system', 0, FALSE, '00000000-0000-0000-0000-000000000001', 'Kapalı', '88888888-8888-8888-8888-888888888802', NULL, TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_arbitration_cases_dms_root_folder ON arbitration_cases (dms_root_folder_id);

-- Mevcut tahkim dosyaları için DMS kök klasörü oluştur
DO $$
DECLARE
    r RECORD;
    parent_folder_id UUID;
    new_folder_id UUID;
BEGIN
    FOR r IN
        SELECT id, organization_id, folder_name, status
        FROM arbitration_cases
        WHERE deleted = FALSE
          AND dms_root_folder_id IS NULL
    LOOP
        parent_folder_id := CASE r.status
            WHEN 'PRE_APPLICATION' THEN '88888888-8888-8888-8888-888888888821'::UUID
            WHEN 'IN_COMMISSION' THEN '88888888-8888-8888-8888-888888888822'::UUID
            WHEN 'EXPERT_REVIEW' THEN '88888888-8888-8888-8888-888888888823'::UUID
            WHEN 'DECIDED' THEN '88888888-8888-8888-8888-888888888824'::UUID
            WHEN 'CLOSED' THEN '88888888-8888-8888-8888-888888888825'::UUID
            ELSE '88888888-8888-8888-8888-888888888821'::UUID
        END;

        new_folder_id := gen_random_uuid();

        INSERT INTO folders (
            id, created_at, updated_at, created_by, version, deleted,
            organization_id, name, parent_id, arbitration_case_id, is_system
        ) VALUES (
            new_folder_id, NOW(), NOW(), 'system', 0, FALSE,
            r.organization_id, r.folder_name, parent_folder_id, r.id, FALSE
        );

        UPDATE arbitration_cases
        SET dms_root_folder_id = new_folder_id
        WHERE id = r.id;
    END LOOP;
END $$;
