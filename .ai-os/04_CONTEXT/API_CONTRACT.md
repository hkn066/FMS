# API Contract

API Version: v1  
Base URL: `http://localhost:8080/api/v1`  
Authentication: JWT Bearer (`Authorization: Bearer <access_token>`)  
OpenAPI: `/swagger-ui.html` (SpringDoc)

Şablon: `08_TEMPLATES/API_TEMPLATE.md`  
Son senkron: 2026-08-05

---

## Standards

### Response Envelope

Başarılı:
```json
{
  "success": true,
  "message": "opsiyonel mesaj",
  "data": {}
}
```

Hata:
```json
{
  "success": false,
  "message": "Hata açıklaması",
  "errors": ["alan: mesaj"]
}
```

Kaynak: `com.lawoffice.fms.common.dto.ApiResponse`

### Pagination

Spring `Pageable` kullanan listelerde:

| Param | Default | Not |
|-------|---------|-----|
| `page` | 0 | 0-based |
| `size` | 20 (çoğu endpoint) | |
| `sort` | endpoint’e göre | örn. `sort=createdAt,desc` |

Yanıt genelde `PageResponse<T>` (`content`, `page`, `size`, `totalElements`, `totalPages`).

### Validation

Jakarta Validation (`@Valid`); alan hataları `errors` listesinde.

---

## HTTP Hata Kodları

| HTTP | Durum | Kaynak |
|------|--------|--------|
| 400 | Business / validation | `BusinessException`, `MethodArgumentNotValidException` |
| 401 | Auth / tenant yok | `BadCredentialsException`, `TenantNotFoundException` |
| 403 | Yetki yok | `AccessDeniedException` |
| 404 | Kayıt yok | `ResourceNotFoundException` |
| 500 | Beklenmeyen | `Exception` |

---

## Active Endpoints (özet)

| Grup | Path | Roller (özet) |
|------|------|----------------|
| Auth | `/auth/*` | login/refresh public; logout/password authenticated |
| Users | `/users/me` | authenticated |
| Clients | `/clients/*` | ADMIN, PARTNER, LAWYER, ASSISTANT |
| Cases | `/cases/*` | aynı |
| Documents | `/documents/*` | aynı (mutasyon: LAWYER+) |
| Folders | `/folders/*` | aynı (mutasyon: LAWYER+) |
| Tasks | `/tasks/*` | workflow |
| Hearings | `/hearings/*` | duruşma |
| Arbitration | `/arbitration/*` | tahkim (+ legacy documents alt path) |
| Reports | `/reports/*` | dashboard, lawyer-performance |
| Audit | `/audit` | aktivite feed |
| Search | `/search?q=` | global arama (≥2 karakter) |
| Organizations | `/organizations/*` | ADMIN |

Detaylı şema: controller + DTO. Aşağıda sık kullanılan sözleşmeler.

---

## Auth

### POST `/auth/login`

**Request:**
```json
{ "email": "admin@example.com", "password": "secret1" }
```

**Response `data`:** `TokenResponse` — `accessToken`, `refreshToken`, user/org claim alanları.

### POST `/auth/refresh`

**Request:** `{ "refreshToken": "..." }`

### POST `/auth/logout` — authenticated

### PUT `/auth/change-password` — authenticated

**Request:** current + new password (DTO: `ChangePasswordRequest`)

---

## DMS — Folders

Base: `/folders`  
Scope query: `caseId`, `arbitrationCaseId` (opsiyonel)

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/` | Klasör ağacı (`List<FolderResponse>`) |
| GET | `/{id}` | Detay |
| POST | `/` | Oluştur |
| PUT | `/{id}` | Yeniden adlandır |
| PUT | `/{id}/move` | Taşı |
| DELETE | `/{id}` | Sil (dolu klasör → 400) |

**POST/PUT body (`FolderRequest`):**
```json
{
  "name": "Klasör adı",
  "parentId": "uuid-or-null",
  "caseId": "uuid-or-null",
  "arbitrationCaseId": "uuid-or-null"
}
```

**Move body (`MoveFolderRequest`):**
```json
{ "targetParentId": "uuid-or-null" }
```

`targetParentId: null` → kök (scope kurallarına göre).

---

## DMS — Documents

Base: `/documents`

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/` | Sayfalı liste |
| GET | `/{id}` | Detay |
| POST | `/` | Multipart upload |
| GET | `/{id}/download` | Binary stream (envelope yok) |
| PUT | `/{id}/move` | Klasöre taşı |
| DELETE | `/{id}` | Soft delete |

**List query:** `folderId`, `caseId`, `arbitrationCaseId` + pageable

**Upload (multipart):** `file` (required), `caseId`, `arbitrationCaseId`, `folderId`, `folderPath` (optional)

**Move body:**
```json
{ "folderId": "uuid" }
```

---

## Search

### GET `/search?q=`

- `q` zorunlu, trim sonrası **min 2 karakter** (aksi halde 400)
- Kategoriler: clients, cases, arbitration, documents (limit ~10/kategori)
- Response: `GlobalSearchResponse`

---

## Reports & Audit

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/reports/dashboard` | KPI özeti |
| GET | `/reports/lawyer-performance` | Avukat performans |
| GET | `/audit` | Aktivite feed (pageable) |

---

## Arbitration (özet)

| Method | Path | Not |
|--------|------|-----|
| CRUD | `/arbitration`, `/arbitration/{id}` | create → DMS klasör provision |
| POST | `/{id}/documents` | Legacy multipart kategori evrak |
| GET | `/{id}/documents` | Legacy liste |
| DELETE | `/{id}/documents/{documentId}` | Legacy sil |

Yeni UI evrak akışı tercihen `/documents` + `/folders` + `arbitrationCaseId`.

---

## Diğer CRUD (standart pattern)

| Kaynak | List | Get | Create | Update | Extra |
|--------|------|-----|--------|--------|-------|
| Clients | GET `/clients` | GET `/{id}` | POST | PUT | DELETE soft |
| Cases | GET `/cases` | GET `/{id}` | POST | PUT | POST `/{id}/close` |
| Tasks | GET `/tasks` | — | POST | — | GET `/kanban`, PATCH `/{id}/status` |
| Hearings | GET `/hearings` | — | POST | — | |
| Organizations | GET `/organizations` | GET `/{id}` | POST | PUT | DELETE — **ADMIN** |
| Users | — | GET `/users/me` | — | — | |

Request/response alanları ilgili `*Request` / `*Response` DTO’larında; Swagger kaynak kabul edilir.

---

## Scope Parameters (DMS)

| Param | Kullanım |
|-------|----------|
| `caseId` | Dava kapsamlı klasör/belge |
| `arbitrationCaseId` | Tahkim kapsamlı klasör/belge |
| `folderId` | Belge listesi / upload hedefi |

---

## Frontend Sync Rules

- Types: `FMS_FrontEnd/src/types/`
- Services: `FMS_FrontEnd/src/services/`
- Client: `FMS_FrontEnd/src/lib/api-client.ts`
- Backend DTO değişince frontend types + service aynı PR/oturumda güncellenir
- Mock bırakılmaz; endpoint varsa API’ye bağlanır

---

## Notlar

- Subscription entity CRUD **yok** (TD-002)
- Forgot/reset password **yok** (TD-006)
- In-app notification list API **yok** (TASK-003)
