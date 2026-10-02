# AI-OS Backlog

AI-OS altyapısında takip edilen eksikler.  
**Durum:** Dokümantasyon sync oturumu 2026-08-05 ile büyük ölçüde kapatıldı.

Proje feature görevleri → `03_PLANNING/TASKS.md` (bu dosya değil).

---

## Nasıl Kullanılır

- Yeni AI-OS işi başlamadan önce bu dosyadan ID seç
- Tamamlanınca durumu `✅` yap; ilgili dosyayı güncelle; `02_MEMORY/CHANGELOG.md`'ye kayıt düş

---

## BACKLOG-AIOS-001 — Database Schema Tam Dokümantasyon

| Alan | Değer |
|------|-------|
| Öncelik | Orta |
| Owner Agent | Database |
| Hedef dosya | `04_CONTEXT/DATABASE_SCHEMA.md` |
| Durum | ✅ Tamamlandı (2026-08-05) |

**Yapılan:** V11/V12 sync, DMS kolonları, sistem hiyerarşisi, mermaid ER, legacy notu, index özeti. Tam her-tablo kolon dump'ı Flyway+entity kaynak kabul edilir.

---

## BACKLOG-AIOS-002 — Platform Prompt'ları (Claude / ChatGPT / Gemini)

| Alan | Değer |
|------|-------|
| Öncelik | Düşük |
| Owner Agent | Architect |
| Hedef dosyalar | `06_PROMPTS/CLAUDE_SYSTEM.md`, `CHATGPT_SYSTEM.md`, `GEMINI_SYSTEM.md` |
| Durum | ✅ Tamamlandı (2026-08-05) |

**Yapılan:** FMS boot sequence, hafıza protokolü, dil kuralları, rol odaklı mission.

---

## BACKLOG-AIOS-003 — Template Kullanım Protokolü

| Alan | Değer |
|------|-------|
| Öncelik | Düşük |
| Owner Agent | Architect |
| Hedef dosya | `08_TEMPLATES/README.md` + `05_AGENTS/README.md` |
| Durum | ✅ Tamamlandı (2026-08-05) |

**Yapılan:** Agent ↔ şablon tablosu; `DATABASE_TEMPLATE.md` eklendi; agents README'ye protokol bağlandı.

---

## BACKLOG-AIOS-004 — Decision Log İlk Kayıtlar

| Alan | Değer |
|------|-------|
| Öncelik | Düşük |
| Owner Agent | Architect |
| Hedef dosya | `09_LOGS/DECISIONS.md` |
| Durum | ✅ Tamamlandı (önceden: DEC-001, DEC-002) |

**Not:** 2026-07 backlog maddesi stale idi; DEC kayıtları mevcuttu. 2026-08-05 doğrulandı.

---

## BACKLOG-AIOS-005 — API Contract Genişletme

| Alan | Değer |
|------|-------|
| Öncelik | Orta |
| Owner Agent | Backend |
| Hedef dosya | `04_CONTEXT/API_CONTRACT.md` |
| Durum | ✅ Tamamlandı (2026-08-05) |

**Yapılan:** Hata kodları, pagination, Auth/DMS/Search örnekleri, endpoint tabloları. Swagger hâlâ alan-level kaynak.

---

## BACKLOG-AIOS-006 — RISKS.md Oluşturma

| Alan | Değer |
|------|-------|
| Öncelik | Düşük |
| Owner Agent | Architect |
| Hedef dosya | `09_LOGS/RISKS.md` |
| Durum | ✅ Tamamlandı (önceden mevcut; 2026-08-05 backlog düzeltildi) |

---

## BACKLOG-AIOS-007 — ROADMAP Faz 2 Senkronizasyonu

| Alan | Değer |
|------|-------|
| Öncelik | Düşük |
| Owner Agent | Product Manager |
| Hedef dosya | `03_PLANNING/ROADMAP.md` |
| Durum | 🟡 Kısmen — ürün fazı; feature oturumlarında güncellenir |

**Açık maddeler (ürün — ertelendi):**
- [ ] Revenue chart — finans modülü
- [ ] Takvim tam API entegrasyonu
- [ ] DMS gelişmiş UI (PDF preview, metadata, bulk)
- [ ] Notification center
- [ ] Settings sayfası
- [ ] Forgot / reset password

---

## BACKLOG-AIOS-008 — TECH_DEBT → TASKS Çapraz Referans

| Alan | Değer |
|------|-------|
| Öncelik | Düşük |
| Owner Agent | QA / Reviewer |
| Hedef dosyalar | `09_LOGS/TECH_DEBT.md`, `03_PLANNING/TASKS.md` |
| Durum | ✅ Tamamlandı (2026-08-05) |

**Yapılan:** TASKS yalnızca aktif iş + TD/TECH link tablosu; tamamlananlar silindi; tek kaynak TECH_DEBT.

---

## BACKLOG-AIOS-009 — Kod ↔ Hafıza Senkron Disiplini

| Alan | Değer |
|------|-------|
| Öncelik | Yüksek (süreç) |
| Owner Agent | Tüm agent'lar |
| Durum | ✅ Bu oturumda uygulandı; sürekli kural |

**Kural:** Şema/API değişince aynı oturumda `04_CONTEXT` + memory güncelle. Tamamlanan task DONE'a taşınır, TASKS'tan silinir.

---

## BACKLOG-AIOS-010 — AI-OS Sistem Sadeleştirme ve Mimari Konsolidasyon

| Alan | Değer |
|------|-------|
| Öncelik | Yüksek |
| Owner Agent | Full-Stack Implementer |
| Hedef dosyalar | `AI_MANIFEST.md`, `04_CONTEXT/`, `05_AGENTS/`, `07_STANDARDS/` |
| Durum | ✅ Tamamlandı (2026-09-11) |

**Yapılan:**
- Manifest'te hafıza güncelleyici kuralı pratikleştirildi, task lifecycle sadeleştirildi.
- `FULLSTACK_IMPLEMENTER` ana ajan rolü tanımlandı, yapay rol sınırları kaldırıldı.
- `04_CONTEXT/` altına `RUNBOOK.md`, `FRONTEND_ARCHITECTURE.md`, `SECURITY.md` eklendi; `CURRENT_STATE` yükü azaltıldı.
- `NAMING_STANDARD.md` Interface `I` öneki kaldırıldı.
- ADR-009 eksik endpoint grupları tamamlandı.
- Dış gölge dosyalar temizlendi/arşivlendi; `DONE.md` eski kısımları `ARCHIVE/DONE_2026_Q2.md`'ye aktarıldı.

