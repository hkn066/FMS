# CURSOR SYSTEM — FMS

Role: Software Implementation Agent (Cursor)

---

## Mission

Atanan görevleri minimum gerekli bağlamla uygula. Mimari karar verme. Gereksinim icat etme. AI-OS kurallarına uy.

---

## Boot Sequence & Session Bootstrapping (Her Oturum Başlangıcı)

Her yeni chat veya oturum başladığında AI sırasıyla şu adımları izlemek ZORUNDADIR:

1. `000_START_HERE.md` ve `AI_MANIFEST.md` oku.
2. Rolünü belirle → `05_AGENTS/<ROLE>.md`
3. Proje hafızası ve mevcut durum bağlamını yükle:
    - `02_MEMORY/CURRENT_STATE.md` (Sistemin mevcut mimari ve modül durumu)
    - `02_MEMORY/LAST_SESSION.md` (Önceki oturumda nerede kalındığı)
    - `03_PLANNING/NEXT_TASK.md` (Aktif / sıradaki kilit görev)
4. Görev için yalnızca gerekli teknik bağlamı yükle (`04_CONTEXT/`, `07_STANDARDS/`).
5. Kod yazmadan önce ilgili modül kodunu oku.
6. Planı oluştur ve onay alarak görevi uygula.
7. Oturum bitmeden proje hafızasını güncelle.

---

## Task State Synchronization (Görev Yönetimi ve Senkronizasyon)

- **Yeni Görev Başlatma:** Kullanıcı yeni bir task tanımladığında, bu görevi ilk olarak `03_PLANNING/NEXT_TASK.md` dosyasına yaz ve aktif duruma getir.
- **Görev Tamamlama:** Görev tamamlandığında `03_PLANNING/TASKS.md` ve `NEXT_TASK.md` üzerinden görevi çıkar, `03_PLANNING/DONE.md` dosyasına taşı (en yeni en üstte olacak şekilde).
- **Sonraki Adım:** Bir sonraki muhtemel adımı/görevi `03_PLANNING/NEXT_TASK.md` içerisine taslak olarak işle.

---

## Hafıza Güncelleme & Session Handover Protokolü (Zorunlu)

Her kodlama, refactor veya UI/UX görevi sonrasında, kod yazmayı bitirir bitirmez (veya kullanıcı "Oturumu kapat", "Kayıt et", "Session bitir" dediğinde) sırasıyla şu güncellemeleri yap:

1. `02_MEMORY/CURRENT_STATE.md` — Modül tamamlanma yüzdeleri, route/bileşen durumu, güncel mimari durum ve son güncelleme tarihi.
2. `03_PLANNING/TASKS.md` — Görev durumu (`[x]` tamamlandı).
3. `03_PLANNING/DONE.md` — Tamamlanan görevi sprint başlığı altına taşı.
4. `02_MEMORY/LAST_SESSION.md` — Oturum özeti, yapılan ana değişiklikler ve eklenen/düzenlenen dosyalar.
5. `02_MEMORY/CHANGELOG.md` — Önemli versiyon/değişiklik kaydı.
6. `03_PLANNING/NEXT_TASK.md` — Sonraki oturum için görev hazırlığı.

Kod değişikliği yaptıktan sonra bu dosyaları güncellemeden "görev tamamlandı" deme.

---

## Proje Haritası

FMS/
├── FMS_BackEnd/src/main/java/com/lawoffice/fms/
│   ├── auth/ casemanagement/ client/ document/ workflow/
│   ├── hearing/ notification/ reporting/ user/ role/
│   ├── security/ audit/ config/ common/ infrastructure/
│   └── FmsApplication.java
├── FMS_BackEnd/src/main/resources/db/migration/
├── FMS_FrontEnd/src/
│   ├── app/              # Next.js routes
│   ├── components/       # UI by feature
│   ├── services/         # API calls
│   ├── hooks/ store/ types/ lib/
│   └── constants/
└── .ai-os/               # AI Operating System

---

## Backend Talimatları

### Yeni endpoint eklerken

- Controller → `presentation/`
- Business logic → `application/`
- Entity → `domain/`
- Repository → `infrastructure/`
- DTO + validation
- `@PreAuthorize` ekle
- Swagger annotation
- Gerekirse Flyway migration

### Asla yapma

- Controller'da business logic
- Binary dosyayı PostgreSQL'e kaydet
- Hardcoded credential
- Migration olmadan şema değiştir

### Test

cd FMS_BackEnd
mvn test

---

## Frontend Talimatları

### Yeni sayfa / feature eklerken

- Route → `app/<feature>/page.tsx`
- Component → `components/<feature>/`
- API → `services/<feature>.service.ts`
- Types → `types/`
- Query hook → `hooks/use-api.ts` veya feature hook
- Mock data kullanma — backend endpoint varsa API'ye bağla

### UI standartları

- shadcn/ui component'lerini reuse et
- 8px spacing, rounded-2xl, shadow-sm
- Loading skeleton, empty state, error state
- `'use client'` yalnızca gerektiğinde
- Türkçe UI label'ları (`01_KNOWLEDGE/DOMAIN_KNOWLEDGE.md` terim tablosu)

### Test / doğrulama

cd FMS_FrontEnd
npm run lint
npm run build

---

## API Contract

Detay: `04_CONTEXT/API_CONTRACT.md`

- Base URL: `http://localhost:8080/api/v1`
- Auth header: `Authorization: Bearer <access_token>`
- Response format: `{ "success": true, "data": { ... } }`
- Frontend types backend DTO'larla uyumlu olmalı

---

## Commit & PR

- Commit yalnızca kullanıcı açıkça istediğinde
- Secret dosyaları commit etme
- PR: `gh pr create` (kullanıcı istediğinde)

---

## Dil

- Kod, değişken adları, commit mesajları: **İngilizce**
- UI metinleri, kullanıcıya yanıtlar: **Türkçe** (kullanıcı İngilizce yazmadıkça)
- `.ai-os/` dokümanları: **Türkçe** (standartlar İngilizce olabilir)

---

## Sık Referans Dosyalar

| Konu | Dosya |
|------|-------|
| Backend gereksinimler | `FMS_BackEnd/backend.md` |
| Frontend gereksinimler | `FMS_FrontEnd/frontend.md` |
| Tasarım sistemi | `FMS_FrontEnd/tasarim.md` |
| Mimari diyagram | `FMS.drawio` |
| Geliştirme kuralları | `07_STANDARDS/FMS_DEVELOPMENT_RULES.md` |

---

## Kaçınılacaklar

- Gereksiz README / markdown dosyası oluşturma
- Redux ekleme
- Microservice'e erken geçiş
- Mock data bırakma (API hazırsa)
- Geniş refactor (kullanıcı istemedikçe)
- `.env` / credential commit

---

## Oturum Sonu Checklist

- [ ] Lint / test geçti mi?
- [ ] API contract senkron mu?
- [ ] `CURRENT_STATE.md` güncellendi mi?
- [ ] `TASKS.md` ilgili görevler `[x]` yapıldı mı?
- [ ] Tamamlanan task `DONE.md`'ye taşındı mı?
- [ ] `LAST_SESSION.md` ve `CHANGELOG.md` güncellendi mi?
- [ ] `NEXT_TASK.md` sonraki adım için hazır mı?