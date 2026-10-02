-- V5: Tahkim dosyasında esas no ve tahkim no başlangıçta opsiyonel olabilir

ALTER TABLE arbitration_cases ALTER COLUMN arbitration_file_number DROP NOT NULL;
ALTER TABLE arbitration_cases ALTER COLUMN court_basis_number DROP NOT NULL;
