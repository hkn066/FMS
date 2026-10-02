-- V2: Seed roles, permissions, admin user
-- Password: Admin123! (BCrypt)

INSERT INTO roles (id, created_at, updated_at, version, deleted, name, description) VALUES
('11111111-1111-1111-1111-111111111101', NOW(), NOW(), 0, FALSE, 'ROLE_ADMIN', 'System Administrator'),
('11111111-1111-1111-1111-111111111102', NOW(), NOW(), 0, FALSE, 'ROLE_PARTNER', 'Managing Partner'),
('11111111-1111-1111-1111-111111111103', NOW(), NOW(), 0, FALSE, 'ROLE_LAWYER', 'Lawyer'),
('11111111-1111-1111-1111-111111111104', NOW(), NOW(), 0, FALSE, 'ROLE_ASSISTANT', 'Legal Assistant'),
('11111111-1111-1111-1111-111111111105', NOW(), NOW(), 0, FALSE, 'ROLE_ACCOUNTING', 'Accounting'),
('11111111-1111-1111-1111-111111111106', NOW(), NOW(), 0, FALSE, 'ROLE_CLIENT', 'Client Portal User');

INSERT INTO permissions (id, created_at, updated_at, version, deleted, name, description) VALUES
('22222222-2222-2222-2222-222222222201', NOW(), NOW(), 0, FALSE, 'USER_READ', 'Read users'),
('22222222-2222-2222-2222-222222222202', NOW(), NOW(), 0, FALSE, 'USER_WRITE', 'Write users'),
('22222222-2222-2222-2222-222222222203', NOW(), NOW(), 0, FALSE, 'CLIENT_READ', 'Read clients'),
('22222222-2222-2222-2222-222222222204', NOW(), NOW(), 0, FALSE, 'CLIENT_WRITE', 'Write clients'),
('22222222-2222-2222-2222-222222222205', NOW(), NOW(), 0, FALSE, 'CASE_READ', 'Read cases'),
('22222222-2222-2222-2222-222222222206', NOW(), NOW(), 0, FALSE, 'CASE_WRITE', 'Write cases'),
('22222222-2222-2222-2222-222222222207', NOW(), NOW(), 0, FALSE, 'DOCUMENT_READ', 'Read documents'),
('22222222-2222-2222-2222-222222222208', NOW(), NOW(), 0, FALSE, 'DOCUMENT_WRITE', 'Write documents'),
('22222222-2222-2222-2222-222222222209', NOW(), NOW(), 0, FALSE, 'REPORT_READ', 'Read reports');

INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111101', id FROM permissions;

INSERT INTO users (id, created_at, updated_at, version, deleted, email, password, first_name, last_name, phone, active) VALUES
('33333333-3333-3333-3333-333333333301', NOW(), NOW(), 0, FALSE,
 'admin@hukukofisi.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'System', 'Admin', '+905551234567', TRUE);

INSERT INTO user_roles (user_id, role_id) VALUES
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101');

INSERT INTO document_tags (id, created_at, updated_at, version, deleted, name, color) VALUES
('44444444-4444-4444-4444-444444444401', NOW(), NOW(), 0, FALSE, 'Dilekce', '#3B82F6'),
('44444444-4444-4444-4444-444444444402', NOW(), NOW(), 0, FALSE, 'Delil', '#EF4444'),
('44444444-4444-4444-4444-444444444403', NOW(), NOW(), 0, FALSE, 'Sozlesme', '#10B981');
