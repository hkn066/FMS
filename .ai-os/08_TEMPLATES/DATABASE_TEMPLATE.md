# Database Table / Schema Entry

Table:

Module:

Migration version:

Owner Agent: Database

---

## Purpose

---

## Columns

| Column | Type | Nullable | Default | Constraints | Notes |
|--------|------|----------|---------|-------------|-------|
| id | UUID | NO | | PK | |
| organization_id | UUID | NO | | FK → organizations | tenant |
| created_at | TIMESTAMP | NO | NOW() | | |
| updated_at | TIMESTAMP | NO | NOW() | | |
| deleted | BOOLEAN | NO | FALSE | | soft delete |
| deleted_at | TIMESTAMP | YES | | | |

---

## Indexes

| Name | Columns | Unique |
|------|---------|--------|
| | | |

---

## Foreign Keys

| Column | References | On delete |
|--------|------------|-----------|
| | | |

---

## Relationships

-

---

## Soft Delete / Tenant

- Soft delete: yes / no
- Tenant scoped: yes / no

---

## Notes

-

---

## Sync Checklist

- [ ] Flyway migration eklendi
- [ ] Domain entity güncellendi
- [ ] `04_CONTEXT/DATABASE_SCHEMA.md` güncellendi
- [ ] Gerekirse `API_CONTRACT.md` / frontend types
