-- DMS ↔ Tahkim entegrasyonu: belgeler ve klasörler arbitration_cases ile ilişkilendirilebilir
ALTER TABLE documents
    ADD COLUMN arbitration_case_id UUID REFERENCES arbitration_cases (id);

ALTER TABLE folders
    ADD COLUMN arbitration_case_id UUID REFERENCES arbitration_cases (id);

CREATE INDEX idx_documents_arbitration_case ON documents (arbitration_case_id);
CREATE INDEX idx_folders_arbitration_case ON folders (arbitration_case_id);
