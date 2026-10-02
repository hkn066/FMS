# FMS — Project Overview

## Proje Adı

**FMS (File / Firm Management System)** — Hukuk Ofisi Müvekkil ve Dosya Yönetim Platformu

## Vizyon

Kurumsal hukuk büroları için Clio, Filevine, iManage ve NetDocuments seviyesinde modern, güvenilir ve ölçeklenebilir bir SaaS platformu.

## Problem

Hukuk ofisleri müvekkil, dava, evrak, duruşma, görev ve bildirim süreçlerini dağınık araçlarla yönetiyor. FMS bu süreçleri tek platformda birleştirir.

## Hedef Kullanıcılar

| Rol | Açıklama |
|-----|----------|
| Partner / Avukat | Dava ve müvekkil yönetimi, evrak, duruşma takibi |
| Asistan | Görev, evrak yükleme, takvim |
| Muhasebe | Finans modülü (planlanan) |
| Admin | Kullanıcı, rol ve sistem ayarları |
| Müvekkil | Client Portal üzerinden dosya durumu ve evrak (planlanan) |

## Repo Yapısı

```
FMS/                 # Ana Çatı Repo (Git Submodule orkestrasyonu & AI-OS)
├── FMS-BE/          # Spring Boot modular monolith API (Alt Repo / Submodule)
├── FMS-FE/          # Next.js 15 web uygulaması (Alt Repo / Submodule)
├── .ai-os/          # AI Operating System — tek kaynak (agent bağlamı)
├── FMS.drawio       # Mimari diyagram
└── ai-context/      # DEPRECATED — yönlendirme stub'ları
```

## Teknoloji Özeti

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | Java 21, Spring Boot 3.4.x, Spring Security, JPA |
| Veritabanı | PostgreSQL + Flyway |
| Cache | Redis |
| Mesajlaşma | RabbitMQ |
| Dosya depolama | MinIO (S3 uyumlu) |
| Arama | Elasticsearch (hedef mimari; henüz entegre değil) |
| Mobil | Flutter (hedef; henüz başlanmadı) |

## Mimari Yaklaşım (Üst Seviye)

```
Frontend Layer          Backend API Layer           Data Layer
─────────────────       ───────────────────         ─────────────
Web App (Next.js)  ──►  API Gateway (REST)     ──►  PostgreSQL
Mobile (Flutter)        Auth / Case / Document      Redis
Client Portal           Workflow / Notification     Elasticsearch
                        AI / Search                 MinIO
                                                    RabbitMQ
```

Detay: `FMS.drawio` — "Hukuk Ofisi Platformu" diyagramı.

## Temel Modüller

1. Authentication & Authorization (JWT + RBAC)
2. Kullanıcı & Rol Yönetimi
3. Müvekkil Yönetimi
4. Dava / Dosya Yönetimi
5. Doküman Yönetimi (versiyon, etiket, MinIO)
6. Workflow & Görevler (Kanban)
7. Takvim & Duruşmalar
8. Bildirimler
9. Raporlama & Dashboard
10. Müvekkil Portalı (planlanan)
11. AI Service (hedef mimari)

## Başarı Kriterleri

- Production-ready, enterprise-grade kod kalitesi
- Modular monolith → gelecekte mikroservise ayrılabilir yapı
- Minimal, premium SaaS UX (Linear / Notion / Stripe Dashboard ilhamı)
- Güvenlik: JWT, RBAC, audit log
- Düşük teknik borç, yüksek bakım kolaylığı

## İlgili Dokümanlar

| Dosya | İçerik |
|-------|--------|
| `FMS_BackEnd/backend.md` | Backend mimari prompt / gereksinimler |
| `FMS_FrontEnd/frontend.md` | Frontend mimari prompt / gereksinimler |
| `FMS_FrontEnd/tasarim.md` | UI/UX tasarım sistemi |
| `.ai-os/000_START_HERE.md` | Agent boot sequence |
| `.ai-os/02_MEMORY/CURRENT_STATE.md` | Güncel implementasyon durumu |
| `.ai-os/03_PLANNING/TASKS.md` | Aktif görevler |
