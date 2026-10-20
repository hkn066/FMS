# Current State

Son güncelleme: 2026-10-20 (Dava Klasör Taşıma ve Dava İçeren Klasör Silme Koruması — TASK-DMS-012 ✅)

Bu dosya projenin **gerçek implementasyon durumunu** yansıtır. Her önemli milestone sonrası güncellenmelidir.

---

## Özet

| Bileşen | Durum | Tamamlanma |
|---------|-------|------------|
| Backend API | Çalışır durumda | ~96% |
| Frontend Web | Çalışır durumda | ~95% |
| Docker ortamı | Çalışır durumda (Postgres, Redis, RabbitMQ, MinIO) | ~95% |
| Git / GitHub | FMS (Ana Repo) + FMS-BE & FMS-FE (Submodule) hazır | Push bekliyor |
| Mobil (Flutter) | Başlanmadı | 0% |
| Client Portal | Başlanmadı | 0% |
| AI / Search servisleri | Global Search API + UI | ~50% |

---

## Backend (FMS-BE)

**Stack:** Java 21, Spring Boot 3.4.5, PostgreSQL, Redis, RabbitMQ, MinIO, Flyway, SpringDoc OpenAPI 2.8.6

### Modül Durumu

| Modül | Durum | Not |
|-------|-------|-----|
| auth | ✅ Tam | Login, logout, refresh, password change |
| user | ✅ Tam | CRUD, profil |
| role | ✅ Tam | RBAC, Permission |
| client | ✅ Tam | Müvekkil CRUD; tenant-aware repository |
| casemanagement | ✅ Tam | Dava CRUD; tenant-aware repository; yıl bazlı sıralı dosya no üretici (`CaseNumberService`), esas/karar no, taraf/vekil, araç (plaka/info), claim amount, **Dava klasör taşıma (`PUT /api/v1/cases/{id}/move-folder`)** |
| arbitration | ✅ Tam | CRUD REST + evrak MinIO; `/api/v1/arbitration/*` |
| document | ✅ Tam | MinIO + **DMS klasör hiyerarşisi** (`folders`, `/api/v1/folders`); `DmsFolderHierarchyService` org bootstrap (`Genel Davalar` / `Sigorta Tahkim`); tahkim otomatik klasör provision; Genel Davalar kök ve 5 şablon alt klasör otomasyonu (`CaseDmsFolderService`); **Dava dosyası içeren klasör silme koruması (`FolderService.deleteFolder`)** |
| workflow | ✅ Tam | Task CRUD, Kanban status |
| hearing | ✅ Tam | Duruşma CRUD |
| notification | ✅ Temel | RabbitMQ publish |
| reporting | ✅ Tam | Dashboard KPI + avukat performans özeti |
| search | ✅ Tam | Global Search endpoint; GET /api/v1/search (esas no, plaka, karşı taraf arama desteği) |
| audit | ✅ Tam | Async audit log + `GET /api/v1/audit` aktivite feed |
| organization | ✅ Tam (Async Tenant Propagation Hazır) | CRUD `/api/v1/organizations` (ADMIN); abonelik plan/lisans doğrulama |
| subscription | ✅ Skeleton | SubscriptionPlan + Subscription entity (endpoint yok) |
| **tenant (common)** | ✅ **Tam** | Global izolasyon filtresi, context, exception handling |

### SaaS-Ready & Tenant İzolasyonu (Sprint-0 + Sprint-1)

| Bileşen | Durum | Not |
|---------|-------|-----|
| Multi-tenant hazırlık | ✅ | `organization_id` kolonları, sistem tenant (V7 migration) |
| Global tenant filtresi | ✅ | Hibernate `organizationFilter` — transaction başında aktif |
| TenantContext | ✅ | ThreadLocal; JWT sonrası set, request sonunda clear |
| JWT organizationId claim | ✅ | Login/refresh token üretiminde aktif |
| Create akışı tenant güvenliği | ✅ | `@PrePersist` + `requireOrganizationId()` |
| TenantNotFoundException | ✅ | Boş context → HTTP 401 |
| Repository sadeleştirme | ✅ | Client/Case: `findAll`, `findById` (mükerrer filtreler kaldırıldı) |
| Soft delete altyapısı | ✅ | `deletedAt`, `@SQLRestriction`, `markDeleted()` |
| Async tenant propagation | ✅ | `TenantTaskDecorator` + `AsyncConfig` (`taskExecutor` bean) |

### API Endpoints (Aktif)

- `/api/v1/auth/*`
- `/api/v1/users/*`
- `/api/v1/clients/*`
- `/api/v1/cases/*` (`GET /next-number` sıralı dosya numarası üretici dahil)
- `/api/v1/documents/*` (folderId filtresi, belge taşıma `PUT /{id}/move`)
- `/api/v1/folders/*` (CRUD, ağaç listesi, `PUT /{id}/move`)
- `/api/v1/tasks/*`
- `/api/v1/hearings/*`
- `/api/v1/arbitration/*`
- `/api/v1/reports/*` (dashboard, lawyer-performance)
- `/api/v1/audit` (aktivite feed)
- `/api/v1/search?q=...` (Global Search)
- `/api/v1/organizations/*` (ADMIN only)

### Database Migrations

- `V1` … `V13` — detay ve kolon özeti: `04_CONTEXT/DATABASE_SCHEMA.md` (**Current Version: V13**)
- `V1__init_schema.sql` — Tam şema
- `V2__seed_data.sql` — Roller, permission, default admin
- `V3__saas_ready_infrastructure.sql` — DEFAULT organization, subscription tabloları, `organization_id`, `deleted_at`
- `V4__create_arbitration_table.sql` — `arbitration_cases` tablosu (tahkim modülü)
- `V5__arbitration_optional_fields.sql` — Esas no ve tahkim no opsiyonel alanlar
- `V6__create_arbitration_documents_table.sql` — `arbitration_documents` tablosu (tahkim evrak metadata)
- `V7__create_organizations_and_subscription.sql` — Organization abonelik alanları, sistem tenant seed, soft delete
- `V8__document_management_folders.sql` — `folders` tablosu, `documents.folder_id` FK (mantıksal hiyerarşi; MinIO yolları sabit)
- `V9__document_management_folder_seed.sql` — DEFAULT org sistem/başlangıç klasör seed verisi
- `V10__add_arbitration_document_relation.sql` — DMS ↔ tahkim FK (`documents`/`folders`.arbitration_case_id)
- `V11__dms_arbitration_folder_hierarchy.sql` — Genel Dosyalar / Sigorta Tahkim kökleri, durum alt klasörleri, `arbitration_cases.dms_root_folder_id`, mevcut kayıt backfill
- `V12__dms_sigorta_tahkim_root_fix.sql` — yetim kök klasörler `Genel Dosyalar` altına; `Ön Başvuru` durum adı
- `V13__add_case_management_fields_and_dms_integration.sql` — Genel davalar için esas no, karar no, taraf ve vekil bilgileri, araç bilgileri (plaka, info), claim_amount ve `dms_root_folder_id` entegrasyonu; mevcut davalara DMS kök klasör backfill

### Altyapı

- `docker-compose.yml`: backend, postgres, redis, rabbitmq, minio, pgadmin
- GitHub Actions CI: `.github/workflows/ci.yml`
- Swagger UI aktif

### Eksikler / Bilinen Boşluklar

- Subscription entity CRUD endpoint'leri yok (organization plan alanları mevcut)
- Elasticsearch entegrasyonu yok
- GraphQL yok
- Forgot / reset password akışı (gereksinimde var, doğrulanmalı)
- Email/SMS notification delivery (event var, kanal implementasyonu kısmi olabilir)
- Finans modülü backend'de yok

---

## Frontend (FMS-FE)

**Stack:** Next.js 15.3.3, React 19.1.0, Tailwind 4.1.8, TanStack Query 5.80.7, Zustand 5.0.5

### Son Değişiklikler (Sprint 2)

**Dava Klasör Taşıma ve Dava İçeren Klasör Silme Koruması (TASK-DMS-012 ✅, 2026-10-20)**
- **Backend:**
  - `CaseController` & `CaseService`: `PUT /api/v1/cases/{id}/move-folder` endpoint'i ve `moveCaseFolder` servisi eklendi. Yetim veya silinmiş kök klasörleri otomatik re-provision ederek hedef klasörün altına bağlar.
  - `CaseRepository` & `ArbitrationCaseRepository`: `countCasesByDmsRootFolderId` ve `countCasesByDmsRootFolderIdIn` metodları eklendi.
  - `FolderService.deleteFolder`: Bir klasörün veya onun alt dizinlerinin dava/tahkim dosyası barındırması durumunda silme işlemi engellendi.
  - `FolderServiceTest`: Yeni silme kısıtı birim testleri eklendi.
- **Frontend:**
  - `MoveCaseDialog`: Dava tablosunda `...` menüsünden çağrılabilen "Klasöre Taşı" modalı geliştirildi. `Genel Davalar` altındaki hedef klasörleri girintili liste olarak sunar ve anında taşımayı sağlar.
  - `CasesTable`: Dava satır menüsüne "Klasöre Taşı" seçeneği entegre edildi.
  - `folder-tree-utils.ts`: `folderHasCases` yardımcı fonksiyonu ve dava/tahkim dosyası içeren klasörler için `folderHasContent` denetimi eklendi.
  - `dms-explorer.tsx` & `folder-tree.tsx`: Dava içeren klasörlerin doğrudan silinmesi engellendi ve açıklayıcı uyarı modalı güncellendi.
  - `cases/page.tsx`: Dava kök klasörünün altındaki dosyaları da tespit eden filtreleme mekanizması güçlendirildi.

**DMS Klasör Ağacı İşlem İkonu Konumlandırması (TASK-DMS-011 ✅, 2026-09-22)**
- `folder-tree.tsx`: Klasör işlemlerini tetikleyen `...` (`MoreHorizontal`) butonu satır sonundan alınarak doğrudan klasör ikonunun (`Folder` / `FolderOpen`) hemen önüne taşındı. Menü açılış hizalaması `align="start"` yapılarak panel içine doğru açılması sağlandı. Sürükleme karışıklığını önlemek adına butona `onDragStart stopPropagation` eklendi.

**Expired JWT Yönetimi ve Login Giriş Hatası Düzeltmesi (BUGFIX-AUTH-001 ✅, 2026-09-22)**
- **Backend:** `JwtAuthenticationFilter.java` içerisinde `jwtService.extractUsername` çağrısı `try-catch (JwtException | IllegalArgumentException e)` ile koruma altına alındı. Süresi dolmuş token fırlattığı `ExpiredJwtException` yakalanarak `SecurityContext` temiz bırakıldı ve filtre zinciri sürdürüldü (public login rotasını kilitleyen unhandled 500 hatası giderildi). `JwtAuthenticationFilterTest.java` birim testleri eklendi.
- **Frontend:** `api-client.ts` request interceptor'ında `/auth/login` ve `/auth/refresh` çağrıları için `Authorization` başlığı kaldırıldı. `login/page.tsx` açılışında `useEffect` ile bayat oturum bilgileri temizlendi (`clearAuth`).

**Yeni Dava Ekleme Sihirbazı & Standart DMS Klasör Otomasyonu (TASK-CASE-001 ✅, 2026-09-16)**
- **Flyway V13:** `cases` tablosuna `court_basis_number`, `decision_number`, `client_role`, `counterparty_name`, `counterparty_lawyer`, `has_subject_vehicle`, `vehicle_plate`, `vehicle_info`, `claim_amount`, `dms_root_folder_id` alanları ve indeksleri eklendi; mevcut davalar için standart isimli DMS kök klasörleri backfill yapıldı.
- **Backend:** `CaseNumberService` ile yıl bazlı (`{YEAR}/{SEQ}`, örn. `2026/001`) sıralı dosya numarası üretimi ve `GET /api/v1/cases/next-number` endpoint'i eklendi. `CaseDmsFolderService` ile dava açıldığında DMS'te `Genel Davalar` altında standart formatta (`[DosyaNo] - [Plaka] - [Müvekkil] - [Mahkeme / Esas No]`) kök klasör ve 5 standart alt klasör (`01. Dilekçeler`, `02. Tutanaklar`, `03. Deliller`, `04. Raporlar`, `05. Karar`) otomatik oluşturuldu; dava güncellemesinde klasör adı senkronizasyonu sağlandı. Global Search'e plaka, esas no ve karşı taraf araması entegre edildi.
- **Frontend:** 3 adımlı `CreateCaseDialog` (Step Wizard Modal) geliştirildi (Adım 1: Temel/Mahkeme/Esas/Karar ve otomatik no, Adım 2: Müvekkil, Taraf, Talep Tutarı, Araç Switch/Plaka/Bilgi, Adım 3: DMS Klasör Önizleme ve Başlangıç Evrakları Yükleme). `/cases` sayfasındaki "Yeni Dava" butonu bu modala bağlandı; `CasesTable` ve `CaseSidebar` bileşenleri yeni alanlarla zenginleştirildi.

**Genel Davalar Klasör Kilitlenme Çözümü, Kök Dizin ve İsim Hizalaması (TASK-DMS-007 ✅, 2026-09-16)**
- `use-api.ts`: Sahte `tempId` optimistic yaklaşımı kaldırıldı; gerçek klasör sunucu yanıtından alınıp önbelleğe eklendi ve invalidate ile senkronize edildi. Klasör oluşturma/taşıma sonrası sayfa kilitlenmesi önlendi.
- `dms-explorer.tsx`: Çakışan `refetchFolders` çağrısı kaldırıldı; `showAllFoldersButton` fazlalığı `forceGeneralTree` için gizlendi.
- `cases/page.tsx`: Ağaçtaki **"Genel Davalar"** klasörü doğrudan kök dizin olarak çalıştırıldı; kök tıklandığında tüm davalar gösterilir, alt klasör tıklandığında filtreleme yapılır.
- `folder-tree-utils.ts`: `DMS_SYSTEM_ROOTS.GENERAL = "Genel Davalar"`; `getGeneralSidebarFolders` için döngüsel ağaç koruması (`visited Set`) eklendi.
- Backend: `DmsFolderHierarchyService.java` içinde kök isim `"Genel Davalar"` ile hizalandı.

**Genel Davalar Klasör Ağacı, Yönetimi, Dolu Klasör Koruması & Sidebar Entegrasyonu (TASK-DMS-006 ✅, 2026-09-14)**
- `/cases` — sol panelde `Genel Davalar` klasör ağacı (`DmsExplorer` tree-only, `mode=manage`); sağda dava tablosu (`CasesTable`); URL `?folder=[id]` filtre senkronizasyonu; seçili klasör rozeti ve "Filtreyi Temizle" butonu.
- `dms-explorer.tsx` — `forceGeneralTree` prop'u; kök dizin taşıma hedefi (`rootDropParentId={generalRoot?.id}`); **dolu klasör silme koruması**: `folderHasContent` olduğunda sil butonu kaldırılır, uyarı ikonu ve açıklayıcı metin ile engellenir.
- `CasesNavGroup` & `sidebar.tsx` — sol menüde "Dosyalar > Genel Davalar" altında hiyerarşik klasör listesi ve `/cases?folder=[id]` rotası ile aktif seçim vurgusu; collapsed mod tooltip entegrasyonu.
- `folder-tree-utils.ts` — `getGeneralFolderTree`, `getGeneralSidebarFolders` yardımcı fonksiyonları.

**Sol Menü Sigorta Tahkim Durum Navigasyonu & Tahkim Filtreleme (TASK-UI-001 ✅, 2026-09-11)**
- `CasesNavGroup` — Sigorta Tahkim altındaki Ön Başvuru, Yeni Başvuru, Komisyonda vb. durum klasörleri tıklandığında `/documents` yerine `/arbitration?status=[STATUS]` rotasına yönlendirme; query param duyarlı aktif durum vurgusu.
- `arbitration.ts` & `folder-tree-utils.ts` — "Yeni Başvuru" ve "Ön Başvuru" birbirine karışmayacak şekilde `NEW_APPLICATION` ve `PRE_APPLICATION` bağımsız statüler olarak modellendi; rozetler ve klasör haritalaması ayrıştırıldı.
- `/arbitration` — `status` query parametresi ile filtreleme desteği; filtre rozeti ve temizleme butonu; sol paneldeki `DmsExplorer` durum klasörü ile çift yönlü seçim senkronizasyonu.
- `DmsExplorer` — initialFolderId değiştiğinde veya temizlendiğinde seçim sıfırlama mekanizması güçlendirildi.

**Sigorta Tahkim UX — klasör ağacı liste sayfasına taşındı (TASK-DMS-005 ✅, 2026-07-13)**
- `/arbitration` — sol panelde `Sigorta Tahkim` klasör ağacı (`DmsExplorer` tree-only); sağda tahkim tablosu; dosya klasörü seçimi → detay sayfasına yönlendirme
- `/arbitration/[id]` — Dosyalar sekmesinde yalnızca belge listesi + yükleme (`showFolderTree={false}`)
- `DmsExplorer` — `showFolderTree`, `showDocumentPanel`, `forceArbitrationTree`, `onFolderSelect` prop'ları
- `useDocuments` — opsiyonel `enabled` (tree-only panelde gereksiz API çağrısı yok)

**TASK-DMS-004 — DMS klasör hiyerarşisi ✅ (2026-07-06, kullanıcı onayı)**
- Flyway **V11** + **V12** — `Genel Dosyalar` / `Sigorta Tahkim` kökleri; `Ön Başvuru` … `Kapalı` durum klasörleri; `dms_root_folder_id`
- `ArbitrationDmsFolderService` — tahkim create/update → `Sigorta Tahkim / {durum} / {folderName}`
- `DmsFolderHierarchyService` — her `/folders` isteğinde org hiyerarşisi bootstrap (yetim kökler düzeltilir)
- `DmsExplorer` — `getBrowseFolderTree` / `getArbitrationFolderTree`; browse'da sistem kökleri tree'de; tahkim modunda `Sigorta Tahkim` kökü
- `use-api.ts` — optimistic cache + `onSettled` invalidate (UI kilidi yok)
- `CasesNavGroup` — Sigorta Tahkim altında DMS klasörleri (durum + dosya klasörleri)

**TASK-DMS-003 — Tahkim klasör DnD + tree senkronizasyonu (2026-07-03)**
- `DropZone` — yalnızca OS dosya sürüklemelerinde upload overlay; `FOLDER`/`DOCUMENT` internal DnD engellenmez
- `DmsExplorer` — klasör ağacı **Belgeler ile aynı global ağaç** (scope filtresi kaldırıldı); belge listesi/yükleme scoped kalır
- `useFolders` — `staleTime: 0`, `refetchOnWindowFocus`; mutasyon sonrası `invalidateQueries(["folders"])`
- `folder-tree-utils.ts` — `flattenFolderTree`, `buildFolderTreeFromFlat`, `filterFolderTreeForScope`
- `FolderService` (backend) — scope filtresinde yetim düğümler köke yükseltilir; alt klasör oluştururken parent'tan `caseId`/`arbitrationCaseId` miras alınır
- `RootDropZone` — kök drop hedefi her zaman görünür (`border-slate-200`)

**TASK-SPRINT2-005 — Global Search + Tahkim DMS**
- Global Search: frontend gerçek API (`search.service.ts` → `/search`); backend arama alanları genişletildi; 10 sonuç/kategori limiti
- Flyway **V10** — `documents.arbitration_case_id`, `folders.arbitration_case_id` FK → `arbitration_cases`
- DMS API: `arbitrationCaseId` query param (`/folders`, `/documents` list/upload/create)
- `/arbitration/[id]` Dosyalar → `DmsExplorer` (`mode=manage`, `arbitrationCaseId` scoped)

**TASK-SPRINT2-004 — Folder-in-Folder DnD + Sidebar**
- `FolderTree` — paylaşımlı `draggedFolderIdRef`; sürükleme sırasında geçersiz hedef vurgusu; hedef klasör auto-expand; kök dizin drop zone
- `isInvalidFolderMove` (`folder-tree-utils.ts`) — döngüsel klasör taşıma koruması + Türkçe toast
- `MOVE_ITEM_TYPE` sabitleri (`types/document.ts`)
- `CasesNavGroup` — Sigorta Tahkim `/arbitration` alt menü öğesi; 8px spacing; `/arbitration` rotasında grup auto-expand + gold accent active

**TASK-SPRINT2-003 — DMS refactor**

- **`DmsExplorer`** (`components/documents/dms-explorer.tsx`) — paylaşılan DMS paneli; `mode=browse` (genel belgeler) / `mode=manage` (dava dosyaları)
- **Klasör yönetimi ayrımı:** Oluştur/sil/yeniden adlandır + klasör-içi-klasör DnD → `/cases/[id]` Dosyalar sekmesi; `/documents` yalnızca belge DnD + görüntüleme
- **TanStack Query donma fix:** Klasör mutasyonlarında `onSettled` + `invalidateQueries(["folders"])` kaldırıldı; cache doğrudan güncelleniyor (`replaceFolderInTree`, `renameFolderInTree`, optimistic rollback)
- **`FolderTree`:** `manageFolders` / `allowFolderDrag` prop'ları; dragover `setState` optimizasyonu
- **Tahkim Dosyalar sekmesi:** Mevcut `CategoryDocumentSection` kartları tab altına taşındı (DMS `folders` FK henüz yok — ADR-017)

### Route Durumu

| Route | Durum | API Bağlantısı |
|-------|-------|----------------|
| `/login` | ✅ | Auth API |
| `/dashboard` | ✅ | KPI, hearings, tasks, documents, audit aktivite, avukat performans — API bağlı |
| `/clients` | ✅ | Client API |
| `/cases` | ✅ | Case API |
| `/cases/[id]` | ✅ | Case detail API; **Dosyalar** sekmesi — `DmsExplorer` (`mode=manage`, `caseId` scoped klasör CRUD + DnD) |
| `/arbitration` | ✅ | Arbitration API — liste + **sol panel Sigorta Tahkim klasör ağacı** (manage, DnD) |
| `/arbitration/[id]` | ✅ | Tahkim detay; **Dosyalar** — belge listesi + yükleme (klasör ağacı yok; `dmsRootFolderId` auto-select) |
| `/documents` | ✅ | **browse** — `Genel Dosyalar` + `Sigorta Tahkim` tree kökleri; belge DnD |
| `/tasks` | ✅ | Task API |
| `/calendar` | ✅ UI | Hearing API (kısmen) |
| `/finance` | 🔶 UI shell | Mock / backend yok |
| `/messages` | 🔶 UI shell | Backend yok |
| `/notifications` | 🔶 UI shell | Kısmi |
| `/reports` | 🔶 UI shell | Reporting API kısmen |
| `/settings` | 🔶 UI shell | Kısmi |

### Bileşenler

**Layout:** `AppShell`, `Sidebar`, `CasesNavGroup` (collapsible **Dosyalar** — Genel Davalar + Sigorta Tahkim + **Sigorta Tahkim altı DMS klasörleri**; pathname auto-expand), `Topbar`, `SearchModal` (⌘K/Ctrl+K global arama), `MobileNav`, `AuthGuard`  
**Dashboard:** `StatCard`, `HearingList`, `PendingTasks`, `RecentDocuments`, `RevenueChart` (finans placeholder), `ActivityTimeline` (audit API), `ViewAllLink`, `QuickActions`, `LawyerPerformance` (reporting API)  
**Case:** `CasesTable`, `CaseTimeline`, `CaseSidebar` — kart/tipografi standardize (TECH-004)  
**Arbitration:** `ArbitrationTable`, `PendingEsasBadge`, `PendingEsasAlert`, `CategoryDocumentSection` — kart standardize (TECH-004)  
**Documents:** `DmsExplorer` (browse/manage; `showFolderTree`/`showDocumentPanel`/`forceArbitrationTree` modları), `DocumentList`, `DropZone`, `FolderTree` (folder-in-folder DnD, `isInvalidFolderMove`, kök drop zone, `manageFolders`/`allowFolderDrag`)  
**Services:** `document.service.ts` (belge + klasör API birleşik katman), `folder.service.ts` (geriye uyumlu adapter)  
**Types:** `types/document.ts` — `FolderNode`, `DocumentNode`, `MoveItemType`  
**UI:** `alert-dialog.tsx`, `sonner.tsx` (global toast)
**Shared:** `DataTable`, shadcn/ui primitives (`Card` — `rounded-2xl border-slate-100 shadow-sm bg-white`)

### Global Search (TASK-002)

- `services/search.service.ts` → `GET /api/v1/search?q=`
- `hooks/use-search.ts` — TanStack Query + 300ms debounce
- `SearchModal` — Linear/Stripe stili command palette; ⌘K / Ctrl+K; ok tuşları + Enter navigasyon; ARIA uyumlu
- Sonuç kategorileri: Müvekkiller, Genel Davalar, Sigorta Tahkim, Dokümanlar

### UI / Design System (Sprint-1.6 + TECH-004)

- Sidebar: **Dosyalar** collapsible grup — Genel Davalar (`/cases`) + Sigorta Tahkim (`/arbitration`); `usePathname` aktif durum
- Dashboard kartları: `rounded-2xl`, `border-slate-100`, `shadow-sm`, `p-6`, `gap-6`/`gap-8` grid
- Tipografi: başlıklar `font-medium text-slate-900`, alt metin `text-slate-500`
- Liste yoğunluğu: 3 duruşma, 4 görev, 4 belge, 5 aktivite + `ViewAllLink`
- Tahkim **Esas Bekleniyor** (tablo + detay): pastel **rose** paleti — zemin `#fff1f2`, çerçeve `#fecdd3`, metin `#9f1239` / `#be123c` (detay banner ile uyumlu)
- İç sayfa kartları (`/cases/[id]`, `/arbitration`, `/arbitration/[id]`): `rounded-2xl border-slate-100 shadow-sm bg-white p-6`, `gap-6`/`gap-8`, `font-medium text-slate-900`, `text-slate-500`

### Bilinen Sorunlar / Açık Noktalar

- Tahkim durum değişiminde klasör parent taşıması backend'de `ArbitrationDmsFolderService.syncRootFolder` ile desteklenir; edge case manuel test önerilir
- Legacy `arbitration_documents` tablosu paralel kalır (TD-001 migrasyon backlog)
- Backend dolu klasör silme kısıtı devrede; UI onay dialogu gösterse de API reddedebilir

### Mock Veri Kullanan Alanlar

- `mockFolders` — **kaldırıldı**; `/documents` sayfası `folder.service.ts` + `useFolders` kullanıyor
- `RevenueChart` — finans modülü bekleniyor (bilinçli placeholder; mock kaldırıldı)
- Finans modülü sayfası (`/finance`) — backend yok

**API base URL:** `http://localhost:8080/api/v1` (`.env.local`)

---

## Ortam Çalıştırma

Tüm çalıştırma adımları, portlar, ortam değişkenleri ve yerel Scoop fallback detayları tek kaynak olarak **`04_CONTEXT/RUNBOOK.md`** dosyasında toplanmıştır:

- **Tek Komutla Akıllı Başlatma / Restart:** `./run.sh` (Bash/Git Bash) veya `.\run.ps1` (PowerShell)
- **Tüm Servisleri Durdurma:** `./run.sh stop` veya `.\run.ps1 stop`
- **Durum Kontrolü:** `./run.sh status` veya `.\run.ps1 status`
- **Canlı Log:** `./run.sh logs backend` / `./run.sh logs frontend`
- **Ayrıntılı rehber:** Bkz. `04_CONTEXT/RUNBOOK.md`

**Windows PowerShell dayanıklılığı (2026-10-17):**
- `run.ps1`, Docker Compose eski proje etiketi nedeniyle mevcut `fms-*` konteynerlerini sahiplenemediğinde isimli konteyner fallback'i ile `fms-postgres`, `fms-redis`, `fms-rabbitmq`, `fms-minio` konteynerlerini veri silmeden başlatır.
- Backend başlatılmadan önce altyapı konteynerlerinin `healthy` durumuna gelmesi beklenir; bu sayede login'i bozan `localhost:5432 refused` başlangıç yarışı engellenir.
- `run.ps1 status`, compose çıktısı boş kaldığında isimli konteyner durumlarını doğrudan Docker üzerinden gösterir.

---

## AI-OS Dokümantasyon Durumu (2026-09-11)

| Katman | Durum |
|--------|--------|
| `04_CONTEXT/DATABASE_SCHEMA.md` | ✅ V12 senkron |
| `04_CONTEXT/API_CONTRACT.md` | ✅ Auth/DMS/Search/Org/Audit + hata kodları |
| `04_CONTEXT/RUNBOOK.md` | ✅ Docker Compose & yerel fallback runbook |
| `04_CONTEXT/FRONTEND_ARCHITECTURE.md` | ✅ Next.js App Router, DMS & Design System |
| `04_CONTEXT/SECURITY.md` | ✅ Multi-tenant izolasyon ve yetkilendirme modeli |
| `03_PLANNING/TASKS.md` | ✅ Yalnızca aktif işler |
| `09_LOGS/TECH_DEBT.md` & `RISKS.md` | ✅ 2026-09-11 senkron |

---

## Sonraki Öncelikler

> **Not:** Öncelik kullanıcı talebine göre belirlenir (DEC-002). Ürün/kalite işleri bu oturumda bilinçli ertelendi.

1. Notification in-app UI + backend delivery (TASK-003, TD-004)
2. Legacy `arbitration_documents` → DMS migrasyonu (TD-001)
3. Finans modülü backend + frontend (TD-003)
4. Elasticsearch full-text search (TASK-011, TD-007)
5. `/reports` sayfası — tam raporlama UI
6. TECH-002 / TECH-003 test altyapısı

Detay: `03_PLANNING/TASKS.md`, `09_LOGS/TECH_DEBT.md`, `09_LOGS/AI_OS_BACKLOG.md`
