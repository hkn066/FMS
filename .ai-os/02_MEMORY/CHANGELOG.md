# CHANGELOG

Tüm önemli proje değişiklikleri burada kayıt altına alınır.

---

## 2026-10-02

### Altyapı — FMS Ana Repo + FMS-BE & FMS-FE Git Submodule Mimarisi (INFRA-GIT-002 ✅)

- Proje yapısı Git Submodule mimarisine dönüştürüldü: `FMS` ana repo altında `FMS-BE` ve `FMS-FE` iki bağımsız alt repo olarak entegre edildi.
- Klasör isimleri tireli standarda (`FMS-BE`, `FMS-FE`) dönüştürüldü.
- `run.ps1`, `run.sh`, `scripts/setup-github.ps1`, `.gitmodules` ve ilgili tüm AI-OS dokümanları senkronize edildi.
- Kolay push için `scripts/push-all.ps1` oluşturuldu.

### Altyapı — Kök .gitignore, Git İndeks Temizliği ve Kullanıcı Prompt Kılavuzu (INFRA-GIT-001 ✅)

**Git / Depo Yönetimi & Güvenlik**
- Kök dizine kapsamlı `.gitignore` eklendi (`logs/`, `*.log`, `*.pid`, `.env*`, `.idea/`, `.vscode/`, `node_modules/`, `target/` desenleri korumaya alındı).
- Yanlışlıkla Git geçmişine giren runtime dosyaları (`logs/`), IDE ayarları (`.idea/`, `.vscode/`) ve yerel `komut_promtu.txt` dosyası diskteki içeriğe dokunulmadan Git indeksinden (`git rm --cached`) çıkarıldı.

**AI-OS (Prompt Katmanı)**
- `.ai-os/06_PROMPTS/USER_PROMPT_GUIDE.md` oluşturuldu; standart kullanıcı görev formatı, full-stack, UI iyileştirme, hata bildirme ve oturum kapatma prompt şablonları resmi AI-OS dokümantasyonuna dahil edildi.
- `06_PROMPTS/README.md` dosyası yeni kılavuzu içerecek şekilde güncellendi.

---

## 2026-09-22

### UI/UX — DMS Klasör Ağacı İşlem İkonu Konumlandırması (TASK-DMS-011 ✅)

**Frontend (Next.js 15 & React 19)**
- `components/documents/folder-tree.tsx`: Klasör işlemlerini tetikleyen `...` (`MoreHorizontal`) işlem butonu satır sonundan alınarak hiyerarşi chevron'u ile klasör ikonu (`Folder` / `FolderOpen`) arasına (klasör ikonunun hemen önüne) taşındı.
- Dropdown menünün sol kenara yaslanarak taşmasını önlemek amacıyla menü içeriği `align="start"` olarak güncellendi.
- Sürükleme işlemlerinde işlem butonunun kazara klasör taşımasını tetiklememesi için `onDragStart stopPropagation` eklendi.

### Bugfix — Expired JWT Yönetimi ve Login Giriş Hatası Düzeltmesi (BUGFIX-AUTH-001 ✅)

**Backend (Spring Boot 3.4.5 & Spring Security 6.4.5)**
- `JwtAuthenticationFilter.java`: `jwtService` çağrısı `try-catch (JwtException | IllegalArgumentException e)` ile korumaya alındı. Süresi dolmuş (`ExpiredJwtException`) veya geçersiz token'larda Tomcat'e fırlayan ve HTTP 500 hatasına neden olan istisna yakalandı; filtre zincirinin (`filterChain.doFilter`) güvenle devam etmesi sağlandı.
- `JwtAuthenticationFilterTest.java`: Süresi dolmuş ve bozuk token senaryolarında istisna fırlatılmadan zincirin devam ettiğini doğrulayan birim testleri yazıldı.

**Frontend (Next.js 15 & React 19)**
- `lib/api-client.ts`: Request interceptor güncellendi; `/auth/login` ve `/auth/refresh` isteklerinde `Authorization` başlığı kaldırıldı ve isteklerin temiz gönderilmesi sağlandı.
- `app/login/page.tsx`: Login sayfası açıldığında `useEffect` ile `clearAuth()` çağrılarak eski/süresi dolmuş local storage verilerinin temizlenmesi sağlandı.

---

## 2026-09-21

### UI/UX — Klasör Marquee Taşma Kontrolü, Konumlandırma, Yatay Scroll, Sekme Genişletme ve Login Yönlendirmesi (TASK-DMS-010 ✅)

**Frontend (Next.js 15 & React 19)**
- `app/page.tsx`: Kök URL (`/`) doğrudan `/login` sayfasına yönlendirildi.
- `app/cases/[id]/page.tsx`: Dava detay sayfasında sol detay paneli (`CaseSidebar`) yalnızca `Genel Bakış` sekmesinde gösterilecek şekilde sınırlandı; Dosyalar, Duruşmalar, Görevler, Finans, Notlar ve Geçmiş sekmelerinde sol panel gizlenerek sekme alanı tam genişliğe (`lg:col-span-12`) genişletildi.
- `folder-tree.tsx`:
  - Dinamik taşma hesaplaması (`scrollWidth > clientWidth + 4`) ile sadece alana sığmayan uzun klasör isimlerine kayma animasyonu uygulandı; kısa isimler (`aliveli`, `aaaa` vb.) sabit ve temiz tutuldu.
  - Düzenleme butonu (`...`) en sağ kenar yerine doğrudan klasör isminin hemen yanına konumlandırıldı.
  - Klasör satırına sağ tık menüsü (`onContextMenu`) entegrasyonu sağlandı.
  - `ScrollArea` bileşeni `orientation="both"` ve ağaç `w-max min-w-full` ile dikeyin yanında yatay kaydırma çubuğuna kavuşturuldu.
- `ui/scroll-area.tsx`: `orientation?: "vertical" | "horizontal" | "both"` desteği eklendi.
- `globals.css`: `@keyframes marquee-slide` ile `--marquee-distance` destekli akıllı kayma animasyonu tanımlandı.

### UI/UX — DMS Klasör Ağacı Görünümü, Sidebar Kırılımları ve Resizable Tab İyileştirmeleri (TASK-DMS-009 ✅)

**Frontend (Next.js 15 & React 19)**
- `folder-tree.tsx`:
  - Uzun klasör isimlerinin düzenleme ikonunu (`...`) ezmesi veya ekran dışına itmesi engellendi. Kapsayıcı `overflow-hidden`, isim alanı `min-w-0 flex-1` ve buton `shrink-0` ile sağ kenara sabitlendi.
  - Seçilen veya hover edilen klasör isimleri için sağdan sola yumuşak kayan yazı (`animate-marquee-hover`, `animate-marquee-active`) animasyonu entegre edildi.
- `globals.css`:
  - Kayan yazı animasyonu için `@keyframes marquee-scroll` tanımlandı.
- `folder-tree-utils.ts`:
  - `getGeneralSidebarFolders`: Sol sidebar menüsünde Genel Davalar altındaki 5 otomatik klasör kırılımı gizlenerek sadece doğrudan dava dosyaları listelenecek şekilde sadeleştirildi; dosya tıklandığında detay sayfasına gitme davranışı korundu.
- `cases/[id]/page.tsx`:
  - Aktif sekme "Dosyalar" (`documents`) olduğunda sol taraftaki `CaseSidebar` kartı gizlenerek DMS gezgini tam genişliğe (`lg:col-span-12`) genişletildi.
- `cases/page.tsx`:
  - Sol klasör paneli ile sağ dava tablosu arasına dikey bir `Resize Handle` tutamacı (`GripVertical`) yerleştirildi. Kullanıcı paneli 240px ile 600px arasında serbestçe genişletip daraltabilir, genişlik `localStorage` üzerinde saklanır ve çift tıklamayla varsayılana sıfırlanabilir.

### UI/UX — Genel Davalar Yeni Dava Açılışında Müvekkil Ekleme Entegrasyonu (TASK-CASE-002 ✅)

**Frontend (Next.js 15 & React 19)**
- `types/api.ts`: `CreateClientRequest` arayüzü tanımlandı (`name`, `email`, `phone`, `taxNumber`, `address`, `type`).
- `client.service.ts`: Backend `POST /api/v1/clients` endpoint'ine bağlanan `create` metodu eklendi.
- `use-api.ts`: React Query `useCreateClient` hook'u eklendi; başarılı kayıt sonrası cache (`queryKeys.clients`) güncellenerek yeni müvekkil listeye anında yansıtıldı.
- `create-case-dialog.tsx`:
  - Adım 2 (Taraflar & Araç Detayı) ekranında Müvekkil Seçimi başlığına `+ Yeni Müvekkil Ekle` butonu eklendi.
  - Müvekkil select listesine `➕ Listede Yoksa Yeni Müvekkil Ekle...` seçeneği eklendi.
  - Açılır/kapanır (inline) hızlı müvekkil ekleme kartı entegre edildi: Bireysel/Kurumsal ayrımı, Ad Soyad/Unvan, E-posta, Telefon, TCKN/Vergi No alanları sağlandı.
  - Kayıt tamamlandığı anda modal içi validasyonlarla yeni müvekkil oluşturulup otomatik olarak dava formunun `clientId` alanına seçtirildi ve kullanıcı kesintisiz şekilde dava sürecine devam edebilir hale getirildi.

---

## 2026-09-16

### Full-Stack — Yeni Dava Ekleme Sihirbazı & DMS Klasör Otomasyonu (TASK-CASE-001 ✅)

**Backend (Spring Boot 3.4.5 & PostgreSQL)**
- `V13__add_case_management_fields_and_dms_integration.sql`: `cases` tablosuna `court_basis_number`, `decision_number`, `client_role`, `counterparty_name`, `counterparty_lawyer`, `has_subject_vehicle`, `vehicle_plate`, `vehicle_info`, `claim_amount` ve `dms_root_folder_id` alanları ile indeksleri eklendi. Mevcut davalar için DMS kök klasörü backfill edildi.
- `LegalCase.java`: Yeni alanlar, JPA ilişkileri ve deterministik `computeFolderName()` fonksiyonu tanımlandı (`[DosyaNo] - [Plaka] - [Müvekkil] - [Mahkeme / Esas No]`).
- `CaseNumberService.java`: Yıl bazlı otomatik artan sıralı dosya numarası üretici (`{YEAR}/{SEQ}` formatı; örn. `2026/001`) geliştirildi.
- `CaseDmsFolderService.java`: Dava oluşturulduğunda `Genel Davalar` kökü altına dava klasörü ve 5 şablon alt klasör (`01. Dilekçeler`, `02. Tutanaklar`, `03. Deliller`, `04. Raporlar`, `05. Karar`) otomatik oluşturan ve esas no/karar no güncellendiğinde klasör adını senkronize eden servis geliştirildi.
- `CaseService.java` & `CaseController.java`: Otomatik numara üretimi (`GET /api/v1/cases/next-number`), yeni alanların DTO ve create/update akışlarına entegrasyonu tamamlandı.
- `SearchService.java` & `CaseRepository.java`: Global arama (⌘K) sorgusuna plaka, esas no ve karşı taraf desteği eklendi.
- Unit Testler: `CaseServiceTest` (otomatik numara üretimi, klasör ismi hesaplama) yazıldı; tüm testler (%100) başarıyla geçti.

**Frontend (Next.js 15.3.3 & React 19)**
- `create-case-dialog.tsx`: 3 adımlı Step Wizard Modal geliştirildi:
  - Adım 1: Temel & Mahkeme Bilgileri (Otomatik yıl bazlı dosya no üretici, kategori, mahkeme, opsiyonel esas/karar no).
  - Adım 2: Taraflar & Araç Detayı (Müvekkil seçimi, müvekkil sıfatı, karşı taraf, talep tutarı, araç switch'i, plaka ve marka/model).
  - Adım 3: Başlangıç Evrakları & Önizleme (DMS standart klasör formatının canlı önizlemesi, şablon klasör özeti, opsiyonel evrak sürükle-bırak yükleme).
- `cases/page.tsx`: 404 veren buton yerine `CreateCaseDialog` entegre edildi.
- `cases-table.tsx`: Dava listesinde esas no ve araç plakası etiketleri eklendi.
- `case-sidebar.tsx`: Dava detayında esas no, karşı taraf ve davaya konu araç bilgileri eklendi.
- `case.service.ts`, `api.ts`, `types/index.ts`, `use-api.ts`: API ve type katmanı yeni alanlarla zenginleştirildi. Next.js production build (`npm run build`) 17/17 sayfa hatasız tamamlandı.

### UI/UX — Klasör İşlemleri Radix UI Pointer-Events Kilidi ve Auto-Expand Çözümü (TASK-DMS-008 ✅)

- `folder-tree.tsx`:
  - 3 nokta menüsündeki `DropdownMenuItem` aksiyonlarında `e.preventDefault()` ve `setTimeout` ile `document.body.style.pointerEvents = ""` sıfırlaması uygulandı. Menü kapanırken body üzerinde kalan tıklama kilidi engellendi.
  - Ebeveyn klasör düğümlerine `useEffect` ile auto-expand yeteneği eklendi. Seçili klasör bir alt klasör olduğunda ebeveyn klasör otomatik açılır.
- `dialog.tsx` & `alert-dialog.tsx`:
  - `DialogContent` ve `AlertDialogContent` bileşenlerinin `onCloseAutoFocus` callback'ine `document.body.style.pointerEvents = ""` güvencesi eklendi.
- `dms-explorer.tsx`:
  - Modalların kapalı olduğu durumlarda body tıklama kilidini sıfırlayan `useEffect` koruması eklendi.
  - Yeni klasör oluşturulduğunda `handleFolderSelect(created.id)` çağrılarak yeni klasörün doğrudan seçilmesi ve anında kullanılabilir olması sağlandı.

### UI/UX — Genel Davalar Klasör Kilitlenme Çözümü, Kök Dizin ve İsim Hizalaması (TASK-DMS-007 ✅)

**Frontend**
- `use-api.ts`:
  - `useCreateFolder` içerisindeki sahte `tempId` optimistic eklemesi kaldırıldı. Backend'den dönen gerçek `FolderNode` doğrudan önbelleğe yerleştirilip query invalidate edilerek geçici ID ile tıklanamama ve sayfa kilitlenme sorunu çözüldü.
  - `dms-explorer.tsx` içerisindeki gereksiz/çakışan `void refetchFolders()` çağrısı kaldırıldı.
- `folder-tree-utils.ts`:
  - `getGeneralSidebarFolders`: Olası döngüsel referanslara ve UI thread kilitlenmesine karşı `visited: Set<string>` koruması eklendi.
  - `DMS_SYSTEM_ROOTS.GENERAL` değeri `"Genel Davalar"` olarak güncellendi.
- `dms-explorer.tsx` & `cases/page.tsx`:
  - İkinci kök gibi duran fazlalık "Tüm Davalar" butonu kaldırıldı (`forceGeneralTree` için `showAllFoldersButton = false`).
  - Ağacın en üstündeki **"Genel Davalar"** klasörü doğrudan kök dizin olarak çalışacak şekilde uyarlandı: Kök tıklandığında filtre temizlenip tüm davalar listelenir, alt klasör tıklandığında ilgili alt klasör filtrelenir.
- **Backend**
  - `DmsFolderHierarchyService.java`: `GENERAL_ROOT_NAME` sabit adı `"Genel Davalar"` olarak eşitlendi.

### DevOps & DX — Tek Komutla Akıllı Başlatma ve Restart Scriptleri (run.sh & run.ps1 ✅)

- **`run.sh` (Bash/Git Bash) & `run.ps1` (PowerShell):**
  - Proje çalışmıyorsa tüm bileşenleri (Docker altyapısı, Temurin 21 JDK, Spring Boot Backend, Next.js Frontend) sırasıyla başlatan akıllı başlatma scriptleri oluşturuldu.
  - Proje zaten çalışıyorsa (Port 8080 veya 3000 aktifse) otomatik algılayıp çalışan süreçleri temiz şekilde sonlandırıp yeniden başlatan (restart) mekanizma entegre edildi.
  - Arka planda `docker info` kontrolü ve Docker Desktop kapalıysa otomatik başlatma eklendi.
  - PostgreSQL, Redis, RabbitMQ ve MinIO servislerinin sağlığı ve konteyner durumu garanti altına alındı.
  - Spring Boot Actuator (`/actuator/health` -> UP) ve Next.js (`http://localhost:3000` -> 200 OK) sağlık döngüleri eklendi.
  - Çıktılar `logs/backend.log` ve `logs/frontend.log` altında ayrıştırıldı.
  - `status`, `stop`, `restart` ve `logs` alt komutları eklendi.
- **`04_CONTEXT/RUNBOOK.md`:** Tek komutla çalıştırma rehberi güncellendi.

---

## 2026-09-14

### UI/UX — Genel Davalar Klasör Ağacı, Yönetimi, Dolu Klasör Koruması & Sidebar Entegrasyonu (TASK-DMS-006 ✅)

**Frontend**
- `folder-tree-utils.ts`:
  - `getGeneralFolderTree(tree)` ve `getGeneralSidebarFolders(tree)` fonksiyonları eklendi.
  - Genel Dosyalar / Genel Davalar kökü altındaki tüm klasör ve alt klasör hiyerarşisi derinlik (`depth`) bilgisiyle sidebar için ayrıştırıldı.
- `dms-explorer.tsx`:
  - `forceGeneralTree` prop desteği eklendi; `displayFolders` Genel Dosyalar alt ağacına odaklandı.
  - "Dolu klasör silinmesin, uyarı versin" kuralı tam olarak uygulandı: Klasörün içinde alt klasör veya dosya varsa (`folderHasContent`), silme onay modalında "Sil" butonu yerine sarı ikaz (`AlertTriangle`), bilgilendirici açıklama ve yalnızca "Anladım" butonu sunuldu; programatik çağrılara karşı da bloklama eklendi.
  - Klasör kök taşıma hedefi (`showRootDropZone`, `rootDropParentId`) `generalRoot.id` ile eşleştirilerek klasörlerin hem birbirinin altına hem de doğrudan köke taşınabilmesi sağlandı.
  - "Tüm Davalar" butonu tıklandığında `onFolderSelect` tetiklenmesi garanti altına alındı.
- `folder-tree.tsx`: `rootDropLabel` prop'u ile kök taşıma alanı etiketlemesi esnekleştirildi.
- `cases/page.tsx`:
  - Sayfa yapısı iki kolonlu (`lg:grid-cols-12`) düzene geçirildi.
  - Sol kolona `DmsExplorer` (manage modu, tree-only) yerleştirildi; yeni klasör oluşturma, taşıma, silme ve yeniden adlandırma sağlandı.
  - URL `?folder=[id]` query parametresi ile çift yönlü seçim senkronizasyonu ve seçili klasör filtre rozeti ("Filtreyi Temizle" butonu ile) eklendi.
  - Next.js 15 Suspense kuralına uygun `<Suspense fallback={<TableLoader />}>` yapısı kuruldu.
- `cases-nav-group.tsx`:
  - Sol sidebar'da "Dosyalar > Genel Davalar" altına oluşturulan ve mevcut klasörler dinamik alt menü olarak yerleştirildi (tıpkı Sigorta Tahkim gibi).
  - Klasör tıklandığında `/cases?folder=[id]` rotasına yönlendirme sağlandı ve aktif klasör vurgulandı.
  - Collapsed/daraltılmış sidebar modunda tooltip içinde de Genel Davalar alt klasörleri gösterildi.

---

## 2026-09-11

### UI/UX — Sol Menü Sigorta Tahkim Durum Navigasyonu & Tahkim Filtreleme (TASK-UI-001 ✅)

**Frontend**
- `cases-nav-group.tsx`: Sigorta Tahkim altındaki Ön Başvuru, Yeni Başvuru, Komisyonda vb. durum klasörlerine tıklanıldığında `/documents` yerine `/arbitration?status=[STATUS]` rotasına yönlendirme sağlandı.
- `types/arbitration.ts` & `folder-tree-utils.ts`: "Yeni Başvuru" ve "Ön Başvuru" durumları birbirine karışmayacak şekilde `NEW_APPLICATION` ve `PRE_APPLICATION` bağımsız statüler olarak modellendi; rozetler ve klasör haritalaması ayrıştırıldı; iki menü öğesinin aynı anda aktifleşmesi engellendi.
- `sidebar.tsx`: `CasesNavGroup` `useSearchParams` kullanımı için `<Suspense fallback={null}>` ile sarıldı.
- `/arbitration/page.tsx`: URL'deki `status` parametresine göre tahkim tablosu filtreleme, aktif filtre rozeti ("Filtreyi Temizle" aksiyonu) ve sol paneldeki `DmsExplorer` klasör ağacı ile iki yönlü seçim senkronizasyonu eklendi.
- `dms-explorer.tsx`: `initialFolderId` değiştiğinde veya temizlendiğinde seçim sıfırlama davranışı eklendi.

### AI-OS — Sistem Sadeleştirme, Runbook, Güvenlik Konsolidasyonu & Docker Hizalama

**Mimari & Dokümantasyon Refactor**
- `02_MEMORY/LAST_SESSION.md` ve `CURRENT_STATE.md` — Docker Compose ortamı aktif duruma getirildi; `04_CONTEXT/RUNBOOK.md` tek kaynak yapıldı.
- `04_CONTEXT/` — `RUNBOOK.md` (Docker & Scoop ortam rehberi), `FRONTEND_ARCHITECTURE.md` (Next.js 15, DmsExplorer, enterprise minimal design system), `SECURITY.md` (Multi-tenant izolasyon, TenantContext, JWT, RBAC, soft-delete) eklendi.
- `05_AGENTS/FULLSTACK_IMPLEMENTER.md` — Cursor için birincil uçtan uca rol tanımlandı; yapay rol kısıtlamaları esnetildi.
- `AI_MANIFEST.md` — Hafıza güncelleyici ilkesi pratikleştirildi, task lifecycle sadeleştirildi (`BACKLOG → IN PROGRESS → DONE → ARCHIVED`).
- `07_STANDARDS/NAMING_STANDARD.md` — Interface `I` öneki kaldırıldı (TypeScript ve Java konvansiyonları hizalandı).
- `07_STANDARDS/API_STANDARD.md`, `GIT_STANDARD.md`, `DOCUMENTATION_STANDARD.md` — Zenginleştirildi ve `FMS_DEVELOPMENT_RULES.md` ile konsolide edildi.
- `01_KNOWLEDGE/ARCHITECTURE_DECISIONS.md` (ADR-009) — Eksik endpoint grupları (`/arbitration`, `/folders`, `/search`, `/organizations`, `/audit`) güncellendi.
- `09_LOGS/TECH_DEBT.md` ve `RISKS.md` — Güncellendi (2026-09-11 senkronu).
- `03_PLANNING/DONE.md` — Q2 2026 kayıtları `03_PLANNING/ARCHIVE/DONE_2026_Q2.md` dosyasına arşivlendi.
- Dış gölge dosyalar (`agent_promt.txt`, `.idea/mnifest.md`, `.idea/DONE.md`) silindi; `backend.md`, `frontend.md`, `tasarim.md` yönlendirme stub'larına dönüştürüldü.

---

## 2026-08-05

### AI-OS — Kod↔hafıza senkronu + planlama/context polish

**Dokümantasyon (ürün kodu yok)**
- `04_CONTEXT/DATABASE_SCHEMA.md` — Flyway V12 senkron, DMS kolonları, sistem hiyerarşisi, mermaid ER
- `04_CONTEXT/API_CONTRACT.md` — HTTP hataları, pagination, Auth/DMS/Search örnekleri
- `03_PLANNING/TASKS.md` — tamamlananlar temizlendi (aktif işler kaldı)
- `08_TEMPLATES/DATABASE_TEMPLATE.md` eklendi; template protokolü agents'a bağlandı
- Platform prompt'ları (Claude/ChatGPT/Gemini) FMS-spesifik
- `09_LOGS/AI_OS_BACKLOG.md` — 001–006, 008 kapatıldı; stale RISKS/DEC notları düzeltildi
- `AI_MANIFEST.md` encoding düzeltmesi

---

## 2026-07-13

### UX — Sigorta Tahkim klasör ağacı liste sayfasına taşındı (TASK-DMS-005 ✅)

**Frontend**
- `/arbitration` — sol panelde `Sigorta Tahkim` klasör ağacı; sağda tahkim tablosu
- `/arbitration/[id]` — Dosyalar sekmesinde yalnızca belge paneli (klasör ağacı kaldırıldı)
- `DmsExplorer` — `showFolderTree`, `showDocumentPanel`, `forceArbitrationTree`, `onFolderSelect`
- `useDocuments` — `enabled` opsiyonu

---

## 2026-07-06

### Feature — DMS klasör hiyerarşisi (TASK-DMS-004 ✅)

**Backend**
- Flyway V11 + V12 — `Genel Dosyalar` / `Sigorta Tahkim` kökleri, durum klasörleri (`Ön Başvuru` …), `dms_root_folder_id`
- `ArbitrationDmsFolderService` — tahkim dosyası DMS klasör provision/sync
- `DmsFolderHierarchyService` — org başına hiyerarşi bootstrap; yetim kök klasörler `Genel Dosyalar` altına

**Frontend**
- `folder-tree-utils.ts` — UUID/isim tabanlı kök bulma; browse/tahkim/sidebar tree filtreleri
- `dms-explorer.tsx` — `Sigorta Tahkim` scoped tree; klasör oluşturma seçili parent altında
- `use-api.ts` — optimistic cache + sessiz `folders` invalidate
- `cases-nav-group.tsx` — Sigorta Tahkim altında DMS klasör menüsü
- `arbitration/[id]` — üst dosya kartı kaldırıldı

**Onay:** Kullanıcı 2026-07-06 — istenen klasör yapısı onaylandı.

### Feature — DMS Tahkim klasör hiyerarşisi + donma fix (ilk iterasyon)

**Backend**
- Flyway `V11__dms_arbitration_folder_hierarchy.sql` — Genel Dosyalar / Tahkim Dosyaları kökleri, durum alt klasörleri, `arbitration_cases.dms_root_folder_id`
- `ArbitrationDmsFolderService` — tahkim oluşturma/güncellemede DMS kök klasörü (`Tahkim Dosyaları / Yeni Başvuru / {plaka - müvekkil - esas}`)
- `DmsSystemFolders` — sistem klasör UUID sabitleri
- `ArbitrationCase` + `ArbitrationCaseResponse` — `dmsRootFolderId`

**Frontend**
- `folder-tree-utils.ts` — `getBrowseFolderTree`, `getArbitrationFolderTree`, `getCaseFolderTree`
- `dms-explorer.tsx` — scoped tree görünümü, `dmsRootFolderId` auto-select, refetch sırasında UI kilidi yok
- `use-api.ts` — klasör mutasyonlarında `invalidateQueries` kaldırıldı; optimistic cache korunur
- `cases-nav-group.tsx` — yeni tahkim dosyaları sol menüde dinamik listelenir
- `create-arbitration-dialog.tsx` / `update-court-basis-dialog.tsx` — klasör cache invalidation

---

## 2026-07-03

### Fix — Tahkim klasör DnD + Belgeler tree senkronizasyonu

**Frontend**
- `drop-zone.tsx` — internal DMS drag (`FOLDER`/`DOCUMENT`) ile OS dosya drag ayrımı; overlay yalnızca dosya sürüklemesinde
- `dms-explorer.tsx` — global klasör kaynağı + scoped client filter
- `use-api.ts` — klasör CRUD/move mutasyonları global folder cache
- `folder-tree-utils.ts` — `flattenFolderTree`, `buildFolderTreeFromFlat`, `filterFolderTreeForScope`
- `folder-tree.tsx` — kök drop zone görünürlüğü

**Backend**
- `FolderService.java` — scope tree yetim düğüm düzeltmesi; alt klasörde parent FK mirası

### Process

- Kullanıcı yönlendirmeli geliştirme modu aktif (DEC-002)
- AI-OS eksikleri `09_LOGS/AI_OS_BACKLOG.md`'ye kaydedildi
- Teknik borç `09_LOGS/TECH_DEBT.md`'ye konsolide edildi
- `09_LOGS/RISKS.md` oluşturuldu
- `NEXT_TASK.md` öneri moduna alındı

---

## 2026-07-01

### AI-OS Migration

- `ai-context/` → `.ai-os/` geçişi tamamlandı
- `.ai-os` birincil kaynak olarak belirlendi
- `CURSOR_SYSTEM.md`, `API_CONTRACT.md`, `DATABASE_SCHEMA.md` dolduruldu
- `FMS_DEVELOPMENT_RULES.md` → `07_STANDARDS/`
- `.cursor/rules/` boot protokolü eklendi
- ADR çakışması giderildi (ai-context kaynağı)

### Changed

- `CURRENT_STATE`, `TASKS`, `ROADMAP`, `ARCHITECTURE_DECISIONS` senkronize edildi
- `DONE.md` sprint geçmişi birleştirildi

---

## 2026-06-29

### AI-OS

- AI-OS dizin yapısı oluşturuldu
- Agent tanımları, prompt sistemi, standartlar, şablonlar eklendi

---

## Template

### YYYY-MM-DD

#### Added

*

#### Changed

*

#### Fixed

*

#### Removed

*

#### Notes

*
