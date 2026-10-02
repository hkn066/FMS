# Technical Debt

Teknik borç kaydı — görünür ve bilinçli yönetilir.  
Yeni borç eklendiğinde append-only; çözülünce durum güncellenir.

Son güncelleme: 2026-09-11

---

## Aktif Teknik Borç

### TD-001 — Legacy `arbitration_documents` Tablosu

| Alan | Değer |
|------|-------|
| Öncelik | Orta |
| Durum | 🔵 Açık |
| İlgili | `CURRENT_STATE.md`, V6 migration |

**Açıklama:** Tahkim evrakları hem legacy `arbitration_documents` hem DMS (`documents`/`folders` + V10 FK) üzerinden paralel duruyor.

**Etki:** Veri tutarsızlığı riski, çift bakım.

**Çözüm planı:** Kategori eşlemesi → DMS migrasyonu → legacy tablo deprecate.

---

### TD-002 — Subscription CRUD Endpoint Eksikliği

| Alan | Değer |
|------|-------|
| Öncelik | Orta |
| Durum | 🔵 Açık |
| İlgili | TASK-SPRINT2-001 (kısmen), organization modülü |

**Açıklama:** `SubscriptionPlan` + `Subscription` entity var; tam CRUD API yok.

**Etki:** SaaS lisans yönetimi UI/backend tamamlanamaz.

---

### TD-003 — Finans Modülü Yok

| Alan | Değer |
|------|-------|
| Öncelik | Orta |
| Durum | 🔵 Açık |
| İlgili | TASK-008, `/finance`, `RevenueChart` |

**Açıklama:** Backend finans modülü yok; frontend `/finance` UI shell + RevenueChart placeholder.

---

### TD-004 — Notification Delivery Kısmi

| Alan | Değer |
|------|-------|
| Öncelik | Yüksek |
| Durum | 🔵 Açık |
| İlgili | TASK-003, RabbitMQ notification modülü |

**Açıklama:** Event altyapısı var; in-app list API, okundu işaretleme, email/SMS kanalları eksik.

---

### TD-005 — UI Shell Sayfaları (Mock / Backend Yok)

| Alan | Değer |
|------|-------|
| Öncelik | Orta |
| Durum | 🔵 Açık |
| İlgili | `CURRENT_STATE.md` route tablosu |

**Açıklama:** `/finance`, `/messages`, `/notifications`, `/reports`, `/settings` kısmen veya tamamen shell.

---

### TD-006 — Forgot / Reset Password Akışı

| Alan | Değer |
|------|-------|
| Öncelik | Orta |
| Durum | 🔵 Açık |
| İlgili | TASK-007, auth modülü |

---

### TD-007 — Elasticsearch Entegrasyonu

| Alan | Değer |
|------|-------|
| Öncelik | Düşük |
| Durum | 🔵 Açık |
| İlgili | TASK-011, ADR planlanan kararlar |

**Açıklama:** Global Search PostgreSQL/JPA ile çalışıyor; full-text için Elasticsearch hedefleniyor.

---

### TECH-002 — E2E Test Altyapısı

| Alan | Değer |
|------|-------|
| Öncelik | Orta |
| Durum | 🔵 Açık |
| Owner | QA |

- Playwright veya Cypress kurulumu
- Login → dashboard → case detail happy path

---

### TECH-003 — Backend Integration Test Coverage

| Alan | Değer |
|------|-------|
| Öncelik | Orta |
| Durum | 🔵 Açık |
| Owner | QA |

- Testcontainers ile auth, case, document flow testleri

---

## Kapatılan Teknik Borç

### TECH-001 — Frontend Mock-data Temizliği ✅

2026-06-22 itibarıyla tamamlandı. `mockFolders`, dashboard mock'ları, ActivityTimeline/LawyerPerformance API'ye bağlandı.

### TECH-004 — Frontend Design System Uyumu ✅

2026-06-22 itibarıyla tamamlandı. Sidebar, kartlar, tipografi, tahkim badge paleti standardize edildi.
