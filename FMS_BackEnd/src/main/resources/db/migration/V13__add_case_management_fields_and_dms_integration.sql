-- V13: Dava yönetim alanları ve DMS entegrasyonu (Esas no, karar no, taraf, araç, dms root folder)

ALTER TABLE cases
    ADD COLUMN IF NOT EXISTS court_basis_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS decision_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS client_role VARCHAR(30) DEFAULT 'DAVACI',
    ADD COLUMN IF NOT EXISTS counterparty_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS counterparty_lawyer VARCHAR(255),
    ADD COLUMN IF NOT EXISTS has_subject_vehicle BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS vehicle_plate VARCHAR(20),
    ADD COLUMN IF NOT EXISTS vehicle_info VARCHAR(255),
    ADD COLUMN IF NOT EXISTS claim_amount NUMERIC(15, 2),
    ADD COLUMN IF NOT EXISTS dms_root_folder_id UUID REFERENCES folders (id);

CREATE INDEX IF NOT EXISTS idx_cases_court_basis_number ON cases (court_basis_number);
CREATE INDEX IF NOT EXISTS idx_cases_vehicle_plate ON cases (vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_cases_dms_root_folder ON cases (dms_root_folder_id);

-- Mevcut genel davalar için DMS kök klasörü oluştur (dms_root_folder_id boş olanlar)
DO $$
DECLARE
    r RECORD;
    new_folder_id UUID;
    computed_name VARCHAR(500);
BEGIN
    FOR r IN
        SELECT c.id, c.organization_id, c.case_number, cl.name as client_name, c.court, c.court_basis_number
        FROM cases c
        LEFT JOIN clients cl ON c.client_id = cl.id
        WHERE c.deleted = FALSE
          AND c.dms_root_folder_id IS NULL
    LOOP
        computed_name := r.case_number || ' - ' || COALESCE(r.client_name, 'Müvekkil') || ' - ' || COALESCE(r.court_basis_number, '[Esas Bekleniyor]');
        new_folder_id := gen_random_uuid();

        INSERT INTO folders (
            id, created_at, updated_at, created_by, version, deleted,
            organization_id, name, parent_id, case_id, is_system
        ) VALUES (
            new_folder_id, NOW(), NOW(), 'system', 0, FALSE,
            r.organization_id, computed_name, '88888888-8888-8888-8888-888888888801'::UUID, r.id, FALSE
        );

        UPDATE cases
        SET dms_root_folder_id = new_folder_id
        WHERE id = r.id;
    END LOOP;
END $$;
