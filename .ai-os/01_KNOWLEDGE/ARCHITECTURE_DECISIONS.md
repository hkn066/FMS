# Architecture Decisions

Bu dosya FMS için alınmış veya planlanmış mimari kararları kaydeder. Yeni kararlar buraya eklenmeli; mevcut kararlar keyfi değiştirilmemeli.

---

## ADR-001: Modular Monolith (Mikroservis Değil)

**Durum:** Kabul edildi  
**Tarih:** Proje başlangıcı

**Karar:** İlk sürümde mikroservis kurulmayacak. Spring Boot tabanlı **modular monolith** kullanılacak.

**Gerekçe:**
- MVP değil, sağlam temel hedefleniyor
- Operasyonel karmaşıklık düşük
- Her modül kendi domain/application/infrastructure/presentation katmanlarına sahip; ileride ayrı servise taşınabilir

**Modüller:** `auth`, `user`, `role`, `client`, `casemanagement`, `arbitration`, `document`, `workflow`, `hearing`, `notification`, `reporting`, `audit`, `security`, `config`, `common`, `infrastructure`

---

## ADR-002: Clean Architecture — Feature-Based Packages

**Durum:** Kabul edildi

**Karar:** Paket yapısı `com.lawoffice.fms.<module>` altında feature bazlı; her modülde katman ayrımı:

```
domain/          → Entities, enums, domain rules
application/     → Services, DTOs, use cases
infrastructure/  → JPA repositories, adapters
presentation/    → REST controllers
```

**Gerekçe:** SOLID, test edilebilirlik, modül sınırlarının korunması.

---

## ADR-003: JWT + Refresh Token + RBAC

**Durum:** Uygulandı

**Karar:** Stateless JWT authentication; refresh token tablosu; method-level security (`@PreAuthorize`).

**Roller:**
- `ROLE_ADMIN`
- `ROLE_PARTNER`
- `ROLE_LAWYER`
- `ROLE_ASSISTANT`
- `ROLE_ACCOUNTING`
- `ROLE_CLIENT`

---

## ADR-004: PostgreSQL + Flyway Migrations

**Durum:** Uygulandı

**Karar:** Şema Flyway ile yönetilir (`V1__init_schema.sql`, `V2__seed_data.sql`). Runtime DB: PostgreSQL; test: H2.

---

## ADR-005: Dosya İçeriği MinIO, Metadata PostgreSQL

**Durum:** Uygulandı

**Karar:** Binary dosyalar PostgreSQL'de tutulmaz. MinIO (S3 uyumlu) depolama; `Document`, `DocumentVersion`, `DocumentTag` entity'leri metadata tutar.

---

## ADR-006: Async Audit Log

**Durum:** Uygulandı

**Karar:** Kritik işlemler (login, dosya işlemleri, müvekkil/dava CRUD) async audit log ile kaydedilir.

---

## ADR-007: RabbitMQ ile Bildirim Yayını

**Durum:** Uygulandı (temel)

**Karar:** Notification modülü event-driven; RabbitMQ üzerinden mesaj yayını. Email/SMS kanalları genişletilebilir.

---

## ADR-008: Redis Cache

**Durum:** Yapılandırıldı

**Karar:** Spring Data Redis ile cache altyapısı hazır; modül bazlı cache stratejisi ihtiyaç halinde genişletilir.

---

## ADR-009: REST API — `/api/v1/*`

**Durum:** Uygulandı

**Karar:** RESTful API; OpenAPI 3 + Swagger UI. GraphQL hedef mimaride (draw.io) ancak şu an uygulanmadı.

**Endpoint grupları:**
- `/api/v1/auth` — Kimlik doğrulama, token yenileme, şifre
- `/api/v1/users` — Kullanıcı yönetimi ve profil
- `/api/v1/clients` — Müvekkil CRUD ve ilişkili dosyalar
- `/api/v1/cases` — Genel dava dosyaları ve aşama takibi
- `/api/v1/arbitration` — Sigorta Tahkim dosyaları ve süreç yönetimi
- `/api/v1/documents` — MinIO belge yükleme, indirme, taşıma (`PUT /{id}/move`)
- `/api/v1/folders` — DMS mantıksal klasör hiyerarşisi CRUD, ağaç ve taşıma
- `/api/v1/tasks` — Görev ve iş akışı yönetimi
- `/api/v1/hearings` — Duruşma takvimi ve ajanda
- `/api/v1/reports` — KPI, dashboard ve avukat performans raporları
- `/api/v1/search` — Global arama (müvekkil, dava, tahkim, belge)
- `/api/v1/organizations` — Multi-tenant organizasyon yönetimi (ADMIN)
- `/api/v1/audit` — Sistem denetim izi ve aktivite akışı

**Standart response:**
```json
{ "success": true, "message": "", "data": {} }
{ "success": false, "message": "", "errors": [] }
```

---

## ADR-010: Frontend — Next.js App Router + Feature Modules

**Durum:** Uygulandı

**Karar:**
- Next.js 15 App Router, React 19, TypeScript
- Feature-based `components/` (case, dashboard, documents, layout, shared, ui)
- TanStack Query (server state), Zustand (auth + UI state)
- Axios tabanlı service layer (`services/`, `lib/api-client`)
- Redux kullanılmaz

---

## ADR-011: Design System — Enterprise Minimal SaaS

**Durum:** Uygulandı (kısmen)

**Karar:** Inter font; lacivert sidebar (`#0F172A`); gold accent (`#C8A96B`); soft gray yüzeyler; dark mode (`next-themes`).

**İlham:** Linear, Notion, Vercel Dashboard, Stripe, Clerk.

---

## ADR-012: Docker Compose Geliştirme Ortamı

**Durum:** Uygulandı

**Karar:** `docker-compose.yml` ile backend, postgres, redis, rabbitmq, minio, pgadmin. Multi-stage Dockerfile.

---

## ADR-013: CI — GitHub Actions

**Durum:** Uygulandı (backend)

**Karar:** `.github/workflows/ci.yml` — Maven build + test pipeline.

---

## ADR-014: Multi-Tenant Ready — Tenant Strategy

**Durum:** Kabul edildi ve uygulandı (Sprint-1)  
**Tarih:** 2026-06-12

**Karar:** FMS ilk aşamada tek hukuk ofisi gibi çalışır; mimari gelecekte Multi-Tenant SaaS'a hazırdır.

**Yaklaşım:**
- Tek ofis modunda varsayılan tenant: `DEFAULT` (`00000000-0000-0000-0000-000000000001`)
- `Organization` entity ve `organization_id` kolonları hazırdır
- JWT içinde `organizationId` claim bulunur
- `TenantContext` (ThreadLocal) request boyunca tenant bilgisini taşır
- Hibernate `organizationFilter` (`organization_id = :orgId`) transaction başında aktive edilir
- `TenantContext` boşken filtre devreye girmez (seed, login, async süreçler)
- `@PrePersist` yeni kayıtlara `TenantContext.getOrganizationId()` enjekte eder (DTO'dan alınmaz)
- `TenantNotFoundException` — authenticated create akışında boş context → HTTP 401
- Client/Case repository'ler global filtreye güvenecek şekilde sadeleştirildi

**Gelecekte:** Birden fazla hukuk ofisi, tenant bazlı abonelik ve lisanslama.

**Gerekçe:** MVP hızını korurken yeniden mimari maliyetini önlemek.

---

## ADR-015: Soft Delete

**Durum:** Kabul edildi (Sprint-0 altyapı)  
**Tarih:** 2026-06-12

**Karar:** Fiziksel silme yapılmaz; soft delete kullanılır.

**Alanlar:**
- `deleted` (Boolean, default `false`) — mevcut
- `deletedAt` (Instant, nullable) — silme zamanı

**Uygulama:**
- `BaseEntity.markDeleted()` ile silme işaretlenir
- Hibernate `@SQLRestriction("deleted = false")` global filtre altyapısı
- `@FilterDef` / `@Filter` gelecekteki özel sorgular için hazır
- Client/Case modüllerinde mükerrer `findByDeletedFalse` sorguları kaldırıldı; `@SQLRestriction` yeterli

---

## ADR-016: Tenant Repository Filtreleme

**Durum:** Kabul edildi ve uygulandı  
**Tarih:** 2026-06-12

**Karar:** Tenant izolasyonu repository sorgularında Hibernate global filtresi ile sağlanır; elle yazılmış `organization_id` / `deleted` koşulları kullanılmaz.

**Teknik özet:**
- `BaseEntity` üzerinde `@FilterDef(name = "organizationFilter")` ve `@Filter(condition = "organization_id = :orgId")`
- `TenantFilterEnabler` + `TenantJpaConfig` (transaction `doBegin`) + `TenantFilterAspect` (@Transactional) ile filtre aktivasyonu
- `TenantContext` doluysa filtre aktif; boşsa devreye girmez (seed, login, async)
- `TenantContext.requireOrganizationId()` create akışlarında zorunlu tenant doğrulaması
- `ClientRepository` / `CaseRepository` → `findAll`, `findById`, domain-spesifik `exists*` / `count*` metodları

---

## ADR-017: Bağımsız Sigorta Tahkim Modülü

**Durum:** Kabul edildi  
**Tarih:** 2026-06-13

**Karar:** Sigorta tahkim süreçleri için `casemanagement` modülünden ayrı, bağımsız `arbitration` modülü kurulacaktır.

**Gerekçe:** Tahkim süreçlerinin duruşmasız, evrak üzerinden yürümesi ve genel dava akışlarından (`casemanagement`) yapısal olarak farklı olması sebebiyle modüler izolasyon sağlanmıştır.

**Teknik özet:**
- Paket: `com.lawoffice.fms.arbitration` (domain / application / infrastructure / presentation)
- Entity: `ArbitrationCase` (`BaseEntity`), enum: `ArbitrationStatus`
- Tablo: `arbitration_cases` — Flyway `V4__create_arbitration_table.sql`
- `casemanagement` ile entity veya FK bağımlılığı yok; evrak entegrasyonu sonraki adımlarda

---

## Henüz Alınmamış / Planlanan Kararlar

| Konu | Durum | Not |
|------|-------|-----|
| Elasticsearch entegrasyonu | Planlanan | Full-text search için |
| GraphQL API | Planlanan | Draw.io'da gateway'de belirtilmiş |
| AI Service | Planlanan | Doküman özetleme, OCR sonrası analiz |
| Flutter mobil uygulama | Planlanan | Draw.io Frontend Layer |
| Client Portal | Planlanan | Ayrı frontend veya route grubu |
| Mikroservis ayrıştırma | Gelecek | Modular monolith hazır olduğunda |