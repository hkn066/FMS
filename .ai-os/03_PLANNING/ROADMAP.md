# Roadmap

FMS geliştirme yol haritası. Fazlar öncelik sırasına göre düzenlenmiştir.

---

## Faz 0 — Temel Altyapı ✅ (Tamamlandı)

- [x] Backend modular monolith iskeleti
- [x] PostgreSQL + Flyway migrations
- [x] JWT auth + RBAC
- [x] Docker Compose (postgres, redis, rabbitmq, minio)
- [x] Frontend Next.js iskeleti + design system
- [x] Login + auth guard
- [x] Swagger / OpenAPI

---

## Faz 1 — Core CRM ✅ (Büyük ölçüde tamamlandı)

- [x] Müvekkil CRUD (backend + frontend)
- [x] Dava CRUD (backend + frontend)
- [x] Dava detay sayfası (tabs, timeline, sidebar)
- [x] Doküman yükleme / indirme / versiyon (MinIO)
- [x] Görev yönetimi + Kanban (backend + frontend)
- [x] Duruşma yönetimi (backend + frontend)
- [x] Dashboard KPI (backend reporting)
- [x] Audit log

---

## Faz 2 — UX Tamamlama 🔄 (Devam ediyor)

- [x] Dashboard mock widget'larını gerçek API'ye bağla
  - [x] Activity timeline
  - [ ] Revenue chart (finans modülü gerekli)
  - [x] Lawyer performance
- [ ] Takvim sayfası — tam API entegrasyonu
- [x] Doküman yönetimi — klasör hiyerarşisi + DnD (gelişmiş UI kısmen)
  - [ ] PDF preview
  - [ ] Metadata panel
  - [ ] Bulk actions
- [x] Global search (backend search endpoint + frontend)
- [ ] Notification center (in-app)
- [ ] Settings sayfası (profil, tema, bildirim tercihleri)
- [ ] Forgot / reset password akışı

---

## Faz 3 — Finans & Raporlama 📋 (Planlanan)

- [ ] Finans modülü backend (fatura, ödeme, bakiye)
- [ ] Finans frontend (`/finance`)
- [ ] Gelişmiş raporlama (`/reports`)
- [ ] Export (PDF, Excel)
- [ ] KPI dashboard genişletme

---

## Faz 4 — İletişim & Portal 📋 (Planlanan)

- [ ] Mesajlaşma merkezi (backend + frontend)
- [ ] Email / SMS notification delivery
- [ ] Müvekkil portalı (ayrı route veya subdomain)
  - Dosya durumu görüntüleme
  - Evrak paylaşımı
  - Mesajlaşma
  - E-imza süreçleri (entegrasyon)

---

## Faz 5 — Arama & AI 📋 (Planlanan)

- [ ] Elasticsearch entegrasyonu
- [ ] Full-text document search
- [ ] OCR pipeline
- [ ] AI Service
  - Doküman özetleme
  - Akıllı etiketleme
  - Dava notu asistanı

---

## Faz 6 — Mobil & Ölçekleme 📋 (Gelecek)

- [ ] Flutter mobil uygulama
  - Dashboard, dosyalar, takvim, belgeler, bildirimler
- [ ] API Gateway ayrıştırması (opsiyonel)
- [ ] Mikroservis ayrıştırma değerlendirmesi
- [ ] GraphQL layer (opsiyonel)
- [ ] Production deployment (K8s / cloud)
- [ ] Monitoring & observability (metrics, tracing)

---

## Zaman Çizelgesi (Tahmini)

| Faz | Hedef |
|-----|-------|
| Faz 2 (UX Tamamlama) | Q3 2026 (Devam Ediyor) |
| Faz 3 (Finans & Raporlama) | Q4 2026 |
| Faz 4 (İletişim & Portal) | Q1 2027 |
| Faz 5 (Arama & AI) | Q2 2027 |
| Faz 6 (Mobil & Ölçekleme) | 2027+ |

*Tarihler tahminidir; `03_PLANNING/TASKS.md` ve sprint önceliklerine göre güncellenir.*

---

## Başarı Metrikleri

- Tüm core modüller E2E test edilebilir
- Frontend'de mock veri oranı <%10
- API response time p95 < 500ms (core endpoints)
- Zero critical security findings
- Lighthouse performance score > 85 (dashboard)
