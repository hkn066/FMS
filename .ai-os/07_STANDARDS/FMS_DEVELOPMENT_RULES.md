# FMS Development Rules

FMS geliştirmesinde tüm katkılar bu kurallara uymalıdır.

---

## Genel İlkeler

1. **Uzun vadeli düşün** — Kısa vadeli hack yerine sürdürülebilir çözüm
2. **Minimal scope** — İstenmeyen dosya/değişiklik ekleme
3. **Mevcut convention'ları takip et** — Yeni pattern icat etme
4. **Over-engineering yapma** — Gereksiz abstraction, wrapper, helper yok
5. **Production-ready kod** — Test, validation, error handling unutulmasın

---

## Backend Kuralları (FMS_BackEnd)

### Teknoloji

- Java 21 LTS
- Spring Boot 3.x
- Maven build
- Jakarta Validation (`@Valid`, `@NotNull`, `@NotBlank`, `@Size`)

### Mimari

- Feature modülü içinde katman ayrımına uy
- Domain logic controller'a yazılmaz
- Repository doğrudan controller'dan çağrılmaz
- Global exception handler kullan; standart API response formatına uy

### Güvenlik

- JWT Bearer token
- `@PreAuthorize` ile method-level authorization
- Hassas veri loglama
- `.env` ve credential dosyalarını commit etme

### Veritabanı

- Şema değişikliği yalnızca Flyway migration ile
- Migration dosya adı: `V{n}__açıklama.sql`
- Entity'ler `BaseEntity`'den türetilir (varsa ortak alanlar)

### API

- RESTful naming
- Versiyon prefix: `/api/v1/`
- Swagger/OpenAPI dokümantasyonu güncel tutulur
- Pagination ve filtreleme tutarlı olsun

### Test

- JUnit 5 + Mockito
- Integration testlerde Testcontainers tercih edilir
- Kritik auth ve domain logic unit test ile korunur

### Docker

- Multi-stage Dockerfile
- `docker-compose.yml` healthcheck ve volume tanımları korunur

---

## Frontend Kuralları (FMS_FrontEnd)

### Teknoloji

- Next.js 15 App Router
- React 19 + TypeScript (strict)
- Tailwind CSS 4
- shadcn/ui + Radix primitives
- **Redux kullanılmaz**

### State Yönetimi

| Tür | Araç |
|-----|------|
| Server state | TanStack Query (`hooks/use-api.ts`) |
| Auth / UI | Zustand (`store/`) |
| Form | React Hook Form + Zod |

### Mimari

```
src/
├── app/           # Routes, layouts
├── components/    # Feature + ui + shared
├── services/      # API çağrıları
├── hooks/
├── store/
├── types/
├── lib/           # api-client, utils, mock-data
└── constants/
```

- API çağrıları component içinde değil `services/` katmanında
- Mock data yalnızca backend hazır olmayan alanlar için (`lib/mock-data.ts`)
- Yeni endpoint bağlantısı mock'tan API'ye taşınırken mock kaldırılır

### UI / UX

- 8px spacing sistemi
- Inter font, rounded-2xl kartlar, shadow-sm
- Light + dark mode destekli
- Loading: skeleton; boş: empty state; hata: error state
- Accessibility: keyboard navigation, anlamlı aria label'lar
- Responsive: desktop-first, mobil uyumlu layout

### Kod Kalitesi

- ESLint + Prettier (`npm run lint`)
- Server Component tercih edilir; client component yalnızca interactivity gerektiğinde
- `'use client'` gereksiz kullanılmaz

---

## Git & Commit

- Commit yalnızca kullanıcı istediğinde
- Anlamlı commit mesajları (why odaklı)
- Secret içeren dosyalar commit edilmez (`.env`, `.env.local`)

---

## Dokümantasyon (AI-OS)

- Yeni mimari karar → `01_KNOWLEDGE/ARCHITECTURE_DECISIONS.md`
- Tamamlanan iş → `03_PLANNING/DONE.md`
- Aktif iş → `03_PLANNING/TASKS.md`
- Durum değişikliği → `02_MEMORY/CURRENT_STATE.md`
- Oturum özeti → `02_MEMORY/LAST_SESSION.md`

`.ai-os/` dışında markdown dosyası oluşturma; kullanıcı açıkça istemedikçe README vb. ekleme.

---

## Agent Davranışı

- Değişiklik yapmadan önce ilgili modül kodunu oku
- Backend ve frontend contract'ını (`types/`, DTO'lar) senkron tut
- Büyük refactor yerine odaklı diff
- Test çalıştır: backend `mvn test`, frontend `npm run lint` / `npm run build`
