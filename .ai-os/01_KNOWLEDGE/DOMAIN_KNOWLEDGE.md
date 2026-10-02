# DOMAIN KNOWLEDGE

## Business Domain

FMS, hukuk bürolarının **müvekkil → dava/dosya → evrak → duruşma → görev → bildirim** süreçlerini tek platform üzerinden yönetmesini sağlayan kurumsal bir platformdur.

---

# Core Concepts

| Kavram | Açıklama |
|--------|----------|
| Müvekkil (Client) | Hukuki hizmet alan gerçek veya tüzel kişi |
| Dava / Dosya (Legal Case) | Müvekkile bağlı hukuki süreç |
| Sigorta Tahkim Dosyası | Genel dava yönetiminden bağımsız yürüyen süreç |
| Evrak (Document) | Versiyonlanabilir dijital belge |
| Duruşma (Hearing) | Mahkeme veya toplantı kaydı |
| Görev (Task) | Workflow içinde atanabilir iş |
| Bildirim (Notification) | In-App / Email / SMS uyarıları |

---

# Client Management

## Desteklenen Müvekkil Tipleri

- Bireysel
- Kurumsal

## Özellikler

- Birden fazla iletişim bilgisi
- Bir müvekkile bağlı birden fazla dava
- Planlanan Client Portal

---

# Legal Case Management

## Yaşam Döngüsü

Oluşturuldu

↓

Aktif

↓

Beklemede

↓

Kapatıldı

↓

Arşivlendi

---

## Case Detail

- Genel Bilgiler
- Evraklar
- Duruşmalar
- Görevler
- Finans
- Timeline
- Notlar

---

# Arbitration Module

Bu modül genel Case Management modülünden tamamen bağımsızdır.

Sebepler

- Evrak odaklı çalışma
- Duruşma süreci bulunmaması
- Ayrı yaşam döngüsü

---

## Folder Naming

Araç Plakası

↓

Müvekkil

↓

Esas Numarası

Esas numarası henüz oluşmadıysa

```
[Esas Bekleniyor]
```

otomatik eklenir.

---

## Arbitration Status

PRE_APPLICATION

↓

IN_COMMISSION

↓

EXPERT_REVIEW

↓

DECIDED

↓

CLOSED

---

## Document Categories

- Ruhsat
- Vekaletname
- Bilirkişi Raporu
- Eksper Raporu
- Kaza Fotoğrafları
- Diğer

---

## Storage Strategy

Binary Dosya

↓

MinIO

Metadata

↓

PostgreSQL

Object Key

```
arbitration/{arbitrationCaseId}/{category}/{documentId}
```

---

# Document Management

Platformun en kritik modülüdür.

## Özellikler

- Folder Tree
- Grid View
- List View
- Drag & Drop Upload
- Version History
- Tagging
- Metadata
- OCR Status
- Full Text Search (Planned)

---

## UI References

- Notion
- Dropbox
- Google Drive
- NetDocuments
- Linear

---

# Workflow

Kanban

Bekliyor

↓

Devam Ediyor

↓

İnceleme

↓

Tamamlandı

Task alanları

- Priority
- Deadline
- Assignee
- Comment
- Labels

---

# Calendar

- Günlük görünüm
- Haftalık görünüm
- Aylık görünüm
- Duruşma yönetimi
- Hatırlatmalar

---

# Notifications

Desteklenen Kanallar

- In-App
- Email
- SMS (Planned)

Altyapı

RabbitMQ Event Driven

---

# Reporting

Dashboard KPI

- Aktif Dava Sayısı
- Bekleyen Görevler
- Yaklaşan Duruşmalar
- Son Belgeler
- Finans Özeti
- Avukat Performansı

---

# Authorization

## Roller

- Admin
- Partner
- Lawyer
- Assistant
- Accounting
- Client

RBAC yapısı Permission entity üzerinden yönetilir.

---

# Audit

Loglanan işlemler

- Login
- Logout
- Müvekkil CRUD
- Dava CRUD
- Dosya Yükleme
- Dosya Silme

Async AuditLog altyapısı kullanılır.

---

# Core Entities

Authentication

- User
- Role
- Permission
- RefreshToken

Client

- Client
- ClientContact

Case

- LegalCase
- CaseStatus
- CaseNote

Arbitration

- ArbitrationCase
- ArbitrationStatus

Documents

- Document
- DocumentVersion
- DocumentTag

Workflow

- Task
- TaskComment

Other

- Hearing
- Notification
- AuditLog
- BaseEntity

---

# UI Terminology

| English | Türkçe |
|----------|---------|
| Dashboard | Gösterge Paneli |
| Clients | Müvekkiller |
| Cases | Dosyalar |
| Documents | Belgeler |
| Tasks | Görevler |
| Calendar | Takvim |
| Hearings | Duruşmalar |
| Reports | Raporlar |
| Settings | Ayarlar |
| Notifications | Bildirimler |

---

# Related Documents

- PROJECT_OVERVIEW.md
- ARCHITECTURE_DECISIONS.md
- DATABASE_SCHEMA.md
- API_CONTRACT.md