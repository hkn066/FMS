# 04_CONTEXT

Teknik bağlam — API, veritabanı şeması, mimari, ortam çalıştırma ve güvenlik detayları.

**Birincil kaynak:** Bu dizin.

---

## Dosyalar

| Dosya | İçerik | Sorumlu |
|-------|--------|---------|
| `API_CONTRACT.md` | REST endpoint'ler, payload'lar, hata kodları | Backend / Implementer |
| `DATABASE_SCHEMA.md` | Flyway migrasyonları (V1–V12), tablolar, entity'ler | Database / Implementer |
| `RUNBOOK.md` | Docker Compose, Scoop fallback, portlar, ortam değişkenleri | DevOps / Implementer |
| `FRONTEND_ARCHITECTURE.md` | Next.js App Router, DMS mimarisi, tasarım token'ları | Frontend / Implementer |
| `SECURITY.md` | Multi-tenant izolasyonu, JWT, RBAC, Soft-Delete, Audit | Architect / Implementer |

---

## Güncelleme Protokolü

- Yeni endpoint veya payload değişikliği → `API_CONTRACT.md`
- Yeni Flyway migrasyonu veya kolon → `DATABASE_SCHEMA.md`
- Port, ortam değişkeni veya altyapı aracı değişikliği → `RUNBOOK.md`
- Tasarım dili, state veya DMS davranışı değişikliği → `FRONTEND_ARCHITECTURE.md`
- Tenant, yetki veya güvenlik kuralı değişikliği → `SECURITY.md`
