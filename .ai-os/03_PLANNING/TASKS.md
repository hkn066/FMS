# Tasks

Aktif ve yakın vadeli görevler. Tamamlananlar yalnızca `03_PLANNING/DONE.md`'de tutulur.

Son temizlik: 2026-10-20 (tamamlanan TASK-DMS-012 DONE'a eklendi; aktif ürün backlog'u korunuyor)

---

## 🔴 Yüksek Öncelik

### TASK-003: Notification center
**Durum:** Bekliyor  
**Alan:** Backend + Frontend  
**Dosyalar:** `notification` module, `/notifications` page  
**İlgili borç:** TD-004

- [ ] In-app notification list API
- [ ] Okundu işaretleme
- [ ] Topbar notification badge gerçek sayaç

---

## 🟡 Orta Öncelik

### TASK-004: Doküman yönetimi gelişmiş UI
**Durum:** Kısmen tamamlandı (klasör hiyerarşisi ✅ — DONE)  
**Alan:** Frontend  
**Dosyalar:** `components/documents/`, `app/cases/`

- [x] Dinamik klasör ağacı + DnD (TASK-DMS-001)
- [x] Optimistic updates + toast (TASK-DMS-002)
- [x] Genel Davalar klasör ağacı, kök taşıma, dolu klasör koruması & Sidebar (TASK-DMS-006)
- [x] Genel Davalar klasör kilitlenme çözümü, kök dizin ve isim hizalaması (TASK-DMS-007)
- [x] Klasör işlemleri Radix UI pointer-events kilitlenme ve auto-expand çözümü (TASK-DMS-008)
- [x] Akıllı marquee animasyonu ve çift yönlü scroll (TASK-DMS-010)
- [x] Klasör işlem butonunun (`...`) klasör ikonu önüne taşınması ve başlangıca hizalama (TASK-DMS-011)
- [x] Dava klasör taşıma ve dava içeren klasör silme koruması (TASK-DMS-012)
- [ ] PDF preview component
- [ ] Version history modal
- [ ] Bulk select + bulk delete/download
- [ ] Metadata side panel
- [ ] Bulk select + bulk delete/download
- [ ] Metadata side panel

---

### TASK-005: Takvim tam entegrasyon
**Durum:** Bekliyor  
**Alan:** Frontend  
**Dosyalar:** `app/calendar/`, hearing service

- [ ] Günlük/haftalık/aylık görünüm
- [ ] Hearing CRUD modal
- [ ] Duruşma hatırlatma UI

---

### TASK-006: Settings sayfası
**Durum:** Bekliyor  
**Alan:** Frontend + Backend  
**Dosyalar:** `app/settings/`

- [ ] Profil güncelleme
- [ ] Şifre değiştirme (backend mevcut)
- [ ] Tema tercihi (local)
- [ ] Bildirim tercihleri

---

### TASK-007: Forgot / Reset password
**Durum:** Bekliyor  
**Alan:** Backend + Frontend  
**Dosyalar:** `auth` module, `app/login/`  
**İlgili borç:** TD-006

- [ ] Reset token + email flow
- [ ] Frontend forgot password sayfası

---

## 🟢 Düşük Öncelik / Faz 3+

### TASK-008: Finans modülü
**Durum:** Bekliyor  
**Alan:** Backend + Frontend  
**İlgili borç:** TD-003

- [ ] Entity: Invoice, Payment, CaseFinance
- [ ] API + `/finance` sayfası

---

### TASK-009: Mesajlaşma merkezi
**Durum:** Bekliyor  
**Alan:** Backend + Frontend

- [ ] Message entity + thread API
- [ ] `/messages` UI

---

### TASK-010: Müvekkil portalı MVP
**Durum:** Bekliyor  
**Alan:** Frontend (ayrı layout)

- [ ] `ROLE_CLIENT` ile sınırlı route group
- [ ] Dosya durumu + evrak listesi

---

### TASK-011: Elasticsearch
**Durum:** Bekliyor  
**Alan:** Backend + Infra  
**İlgili borç:** TD-007  
**Not:** Global Search (PostgreSQL) tamamlandı — DONE / TASK-002

- [ ] docker-compose'a elasticsearch ekle
- [ ] Document index sync
- [ ] Full-text search API

---

### TASK-012: Flutter mobil uygulama
**Durum:** Bekliyor  
**Alan:** Yeni repo / klasör

- [ ] Proje iskeleti
- [ ] Auth + dashboard + cases

---

## Teknik Borç (görev bağlantıları)

> Tam liste: `09_LOGS/TECH_DEBT.md`

| ID | Konu | Durum |
|----|------|--------|
| TD-001 | Legacy `arbitration_documents` → DMS | Açık |
| TD-002 | Subscription CRUD API | Açık |
| TD-004 | Notification delivery | Açık (→ TASK-003) |
| TECH-002 | E2E test altyapısı | Açık (ertelendi) |
| TECH-003 | Backend integration test | Açık (ertelendi) |

---

## Tamamlananlar (DONE'da)

Sprint-2, DMS-001…005, TASK-001, TASK-002 (ES hariç), TECH-001, TECH-004 → `03_PLANNING/DONE.md`

---

## Görev Ekleme Kuralı

```
### TASK-XXX: Başlık
**Durum:** Bekliyor | Devam ediyor | Tamamlandı
**Alan:** Backend | Frontend | Full-stack | Infra
**Dosyalar:** ilgili path'ler
- [ ] Alt görev
```

Tamamlanınca: `DONE.md`'ye taşı **ve bu dosyadan sil**.
