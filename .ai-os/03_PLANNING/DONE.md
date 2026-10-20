# Done

Tamamlanan en son milestone'lar ve görevler. Tarih sırasına göre (en yeni üstte).

**Birincil Kaynak:** Bu dosya.  
**Tarihsel Arşiv (2026 Q2 ve Öncesi):** `ARCHIVE/DONE_2026_Q2.md`

---

## 2026-10-20 — Dava Klasör Taşıma ve Dava İçeren Klasör Silme Koruması (TASK-DMS-012 ✅)

**Tür:** Feature & Integrity Protection

### ✅ Dava Dosyası Klasör Taşıma ve Koruma
- **Backend Taşıma API'si:** `PUT /api/v1/cases/{id}/move-folder` endpoint'i yazıldı. `CaseDmsFolderService` kök klasörü olmayan davalar için otomatik provision ve hedef klasöre bağlama mantığıyla güçlendirildi.
- **Backend Silme Koruması:** `FolderService.deleteFolder`, doğrudan bir davaya bağlı olan veya alt dizinlerinde dava/tahkim barındıran klasörlerin silinmesini kesin olarak engelledi.
- **Frontend Taşıma Dialogu:** `/cases` tablosundaki `...` menüsüne "Klasöre Taşı" seçeneği ve `MoveCaseDialog` modalı eklendi.
- **Frontend Ağaç Koruması:** `folderHasCases` ve `folderHasContent` güncellenerek dava dosyası içeren klasörler için silme aksiyonu engellendi ve uyarı ekranı detaylandırıldı.

---

## 2026-10-17 — Windows Run Script Docker Fallback ve Login Ortam Kurtarma (BUGFIX-INFRA-001 ✅)

**Tür:** Bugfix & Dev Environment Resilience

### ✅ Login Ortam Sorunu Çözüldü
- Backend'in kapalı kalmasına neden olan PostgreSQL bağlantı hatası teşhis edildi (`localhost:5432 refused`).
- Eski compose/proje etiketiyle kalan `fms-*` Docker konteynerleri nedeniyle oluşan isim çakışması için `run.ps1` fallback mekanizması eklendi.
- `run.ps1`, Docker Compose başarısız olduğunda mevcut `fms-postgres`, `fms-redis`, `fms-rabbitmq`, `fms-minio` konteynerlerini veri silmeden başlatır hale getirildi.
- Backend başlatılmadan önce altyapı health durumları beklenerek başlangıç yarışı azaltıldı.
- `run.ps1 status`, compose boş döndüğünde gerçek Docker konteyner durumlarını listeler hale getirildi.
- Doğrulama: `.\run.ps1 restart`, backend health ve admin login başarılı.

---

## 2026-09-22 — DMS Klasör Ağacı İşlem İkonu Konumlandırması (TASK-DMS-011 ✅)

**Tür:** UI/UX İyileştirmesi

### ✅ Klasör Ağacı İşlem Menüsü Konumlandırması
- `components/documents/folder-tree.tsx`: Klasör işlemlerini (`Yeni Klasör Oluştur`, `Adını Değiştir`, `Sil`) tetikleyen `...` (`MoreHorizontal`) işlem butonu satırın en sonundan alınıp, klasör ikonunun (`Folder` / `FolderOpen`) hemen önüne taşındı.
- Dropdown menünün panel dışına taşmadan içeriye doğru düzgün açılması için `align="start"` ayarlandı.
- Ağaç içindeki sürükle-bırak (drag-drop) etkileşimleri sırasında işlem butonuna tıklandığında veya buton sürüklendiğinde yanlışlıkla klasör taşıma tetiklenmemesi için `onDragStart={(e) => e.stopPropagation()}` uygulandı.

---

## 2026-09-22 — Expired JWT Yönetimi ve Login Giriş Hatası Düzeltmesi (BUGFIX-AUTH-001 ✅)

**Tür:** Bugfix & Security Resilience

### ✅ Backend Spring Security Filtre Dayanıklılığı
- `JwtAuthenticationFilter.java`: `jwtService.extractUsername` çağrısı `try-catch (JwtException | IllegalArgumentException e)` bloğuna alındı. Süresi dolmuş token geldiğinde fırlatılan `ExpiredJwtException` yakalanarak `SecurityContext`'e yetki atanmadan filtre zincirine devam edilmesi sağlandı. Böylece `/api/v1/auth/login` gibi public endpoint'ler 500 hatası almadan çalışır hale getirildi.
- `JwtAuthenticationFilterTest.java`: Süresi dolmuş ve bozuk token durumları için birim testleri eklendi.

### ✅ Frontend Auth İstek İyileştirmesi
- `apiClient.ts`: `/auth/login` ve `/auth/refresh` isteklerinde `Authorization` header'ının eklenmesi engellendi ve var olan temizlendi.
- `login/page.tsx`: Sayfa mount olduğunda bayat oturum token'ları temizlendi.

---

## 2026-09-21 — Klasör Marquee Taşma Kontrolü, Konumlandırma, Yatay Scroll, Sekme Genişletme ve Login Yönlendirmesi (TASK-DMS-010 ✅)

**Tür:** UI/UX İyileştirmesi & Navigation

### ✅ Klasör Ağacı Akıllı Kayan İsim (Marquee)
- `folder-tree.tsx` bileşeninde `ResizeObserver` ve taşma eşiği denetimi (`scrollWidth > clientWidth + 2` ve uzunluk kontrolü) eklendi.
- Sadece ekrana sığmayan uzun dava ve klasör isimlerinde üzerine gelindiğinde (hover) veya tıklandığında (seçili olduğunda) sağdan sola yumuşak kayma animasyonu (`marquee-scroll`) çalışması sağlandı; kısa isimler sabit, net ve temiz tutuldu.

### ✅ Düzenleme Butonu Konumlandırması & Sağ Tık Desteği
- `...` işlem menüsü butonu ekranın en sağ kenarından alınıp doğrudan klasör isminin hemen yanına taşındı.
- Klasör satırına sağ tıklandığında (`onContextMenu`) aynı dropdown menünün açılması sağlandı.

### ✅ Çift Yönlü Scroll Desteği (Yatay + Dikey)
- `components/ui/scroll-area.tsx` bileşenine `orientation?: "vertical" | "horizontal" | "both"` desteği eklendi.
- `FolderTree` bileşenine `orientation="both"` ve `min-w-full` uygulanarak derin klasör dallanmalarında hem dikey hem de yatay kaydırma çubuğu entegre edildi.

### ✅ Dava Detay Sayfasında Sekmelerin Tam Genişliğe Yayılması
- `app/cases/[id]/page.tsx` içinde sol detay paneli (`CaseSidebar`) yalnızca "Genel Bakış" sekmesinde görünecek şekilde sınırlandı.
- "Dosyalar", "Duruşmalar", "Görevler", "Finans", "Notlar" ve "Geçmiş" sekmelerine geçildiğinde sol panel gizlenerek sekme alanı tam genişliğe (`lg:col-span-12`) genişletildi.

### ✅ Kök Sayfa Login Yönlendirmesi
- `app/page.tsx` kök rota yönlendirmesi `redirect("/login")` olarak güncellendi.

---

## 2026-09-21 — DMS Klasör Ağacı Görünümü, Sidebar Kırılımları ve Resizable Tab İyileştirmeleri (TASK-DMS-009 ✅)

**Tür:** UI/UX İyileştirmesi & Navigation

### ✅ Sol Sidebar Menüsü Sadeleştirmesi
- `folder-tree-utils.ts` içindeki `getGeneralSidebarFolders` fonksiyonunda derinlemesine özyinelemeli dallanma kaldırılarak, Genel Davalar altındaki 5 otomatik şablon alt klasör gizlendi; yalnızca dava/dosya seviyesinin listelenmesi sağlandı. Dosyaya tıklandığında detay sayfasına gitme davranışı korundu.

### ✅ Ayarlanabilir Panel Genişliği (Resize Splitter)
- `/cases` sayfasında sol klasör paneli ile sağ dava tablosu arasına sürüklenebilir dikey tutamaç (`GripVertical`) yerleştirildi.
- Kullanıcı panel genişliğini 240px ile 600px arasında serbestçe ayarlayabilir hale getirildi; genişlik `localStorage` üzerinde saklanıp çift tıklamayla varsayılana sıfırlanabilmektedir.

---

## 2026-09-21 — Genel Davalar Yeni Dava Açılışında Müvekkil Ekleme Entegrasyonu (TASK-CASE-002 ✅)

**Tür:** Yeni Özellik (Full-Stack)

### ✅ Uçtan Uca Hızlı Müvekkil Kaydı ve Otomatik Seçim
- `types/api.ts` ve `client.service.ts`: `CreateClientRequest` tipi ve `POST /api/v1/clients` çağıran `create()` metodu eklendi.
- `use-api.ts`: React Query `useCreateClient` mutasyon kancası entegre edildi; önbellek anında güncellenerek yeni müvekkil listeye yansıtıldı.
- `create-case-dialog.tsx`:
  - Adım 2 (Taraflar & Araç Detayı) ekranına `+ Yeni Müvekkil Ekle` butonu ve açılır listede `➕ Listede Yoksa Yeni Müvekkil Ekle...` seçeneği eklendi.
  - Modal içine gömülü hızlı ekleme kartı: Bireysel/Kurumsal ayrımı, Ad Soyad/Unvan, E-posta, Telefon, TCKN/Vergi No alanları sağlandı.
  - "Kaydet ve Seç" aksiyonu ile yeni müvekkil oluşturulup otomatik olarak dava formunun `clientId` alanına seçtirildi.

---

## 2026-09-16 — Yeni Dava Ekleme Sihirbazı & DMS Klasör Otomasyonu (TASK-CASE-001 ✅)

**Tür:** Yeni Özellik (Full-Stack)

### ✅ Uçtan Uca 3 Adımlı Step Wizard Modal (`CreateCaseDialog`)
- `/cases` sayfasındaki işlevsiz "Yeni Dava" butonu modern bir 3 adımlı sihirbaz modala dönüştürüldü.
- **Adım 1:** Otomatik yıl bazlı dosya numarası üretici (`2026/001`), dava başlığı, kategori seçimi, mahkeme adı, opsiyonel esas no ve karar no.
- **Adım 2:** Kayıtlı müvekkil seçimi combobox'ı, müvekkil sıfatı (Davacı, Davalı vb.), karşı taraf ve karşı taraf vekili, talep tutarı (₺), araç switch'i, plaka ve marka/model girişleri.
- **Adım 3:** Standart DMS klasör isminin canlı önizlemesi (`[DosyaNo] - [Plaka] - [Müvekkil] - [Mahkeme / Esas No]`), 5 şablon alt klasör bilgilendirmesi ve opsiyonel sürükle-bırak başlangıç evrakları yükleme alanı.

### ✅ Backend Otomasyonu, Sıralı Numara & DMS Entegrasyonu
- **Flyway V13:** `cases` tablosuna `court_basis_number`, `decision_number`, `client_role`, `counterparty_name`, `counterparty_lawyer`, `has_subject_vehicle`, `vehicle_plate`, `vehicle_info`, `claim_amount`, `dms_root_folder_id` alanları eklendi.
- **`CaseNumberService`:** Sistemin bulunduğu yıla göre sıralı otomatik dosya no üretimi (`{YEAR}/{SEQ}`, örn. `2026/001`) ve `GET /api/v1/cases/next-number` endpoint'i.
- **`CaseDmsFolderService`:** Dava açıldığında DMS'te `Genel Davalar` kökü altına dava klasörü ve 5 standart alt klasörün (`01. Dilekçeler`, `02. Tutanaklar`, `03. Deliller`, `04. Raporlar`, `05. Karar`) otomatik oluşturulması ve esas no/karar no güncellendiğinde senkronize edilmesi.
- **Global Search:** Plaka, esas no ve karşı taraf aramaları `SearchService` ve `CaseRepository`'ye dahil edildi.

---

## 2026-09-16 — Klasör İşlemleri Radix UI Pointer-Events Kilidi ve Auto-Expand Çözümü (TASK-DMS-008 ✅)

**Tür:** Bug Fix & UI/UX İyileştirmesi

### ✅ Radix UI Dropdown -> Modal Tıklama Kilidi Çözümü
- `folder-tree.tsx`: 3 nokta menüsündeki tüm aksiyonlara `e.preventDefault()` ve `setTimeout` ile `document.body.style.pointerEvents = ""` sıfırlaması yerleştirildi. Menü kapanırken body'nin kilitli kalması kesin olarak engellendi.
- `dialog.tsx` ve `alert-dialog.tsx`: `DialogContent` ve `AlertDialogContent` bileşenlerinin `onCloseAutoFocus` callback'ine pointer-events sıfırlaması eklenerek evrensel modal güvencesi sağlandı.
- `dms-explorer.tsx`: Modalların kapalı olduğu durumlarda çalışan `useEffect` temizleyicisi eklendi.

### ✅ Otomatik Klasör Seçimi ve Genişletme (Auto-expand)
- `dms-explorer.tsx`: Yeni klasör oluşturulduğunda API'den dönen gerçek ID ile `handleFolderSelect(created.id)` tetiklenerek yeni klasör doğrudan aktif hale getirildi.
- `folder-tree.tsx`: Bir klasör veya yeni oluşturulan alt klasör seçildiğinde ebeveyn klasörün otomatik açılmasını sağlayan `useEffect` genişletme desteği eklendi.

---

## 2026-09-16 — Genel Davalar Klasör Kilitlenme Çözümü, Kök Dizin ve İsim Hizalaması (TASK-DMS-007 ✅)

**Tür:** Bug Fix & UI/UX İyileştirmesi

### ✅ Klasör İşlemleri Kilitlenme Çözümü
- `useCreateFolder` içindeki geçici `tempId` optimistic yaklaşımı kaldırıldı; backend'den dönen gerçek ID ve kayıt doğrudan önbelleğe eklenip `invalidateQueries` ile senkronize edildi. Klasör oluşturma/taşıma sonrası sayfanın donması ve klasörün tıklanamaması engellendi.
- `dms-explorer.tsx` içerisindeki gereksiz/çakışan `void refetchFolders()` çağrısı kaldırıldı.
- `getGeneralSidebarFolders` içerisine döngüsel ağaç yapısına karşı `visited: Set<string>` koruması eklendi.

### ✅ İsim Hizalaması & Kök Dizin Sadeleştirmesi
- Kök klasör adı frontend ve backend'de `Genel Davalar` olarak eşitlendi.
- `cases/page.tsx` ve `dms-explorer.tsx`: Fazlalık olan "Tüm Davalar" butonu kaldırıldı; ağacın en tepesindeki `Genel Davalar` doğrudan kök dizin olarak çalıştırıldı (kök tıklandığında tüm davalar, alt klasör tıklandığında filtre).

---

## 2026-09-14 — Genel Davalar Klasör Ağacı, Yönetimi, Dolu Klasör Koruması & Sidebar Entegrasyonu (TASK-DMS-006 ✅)

**Tür:** Yeni Özellik & UI/UX Entegrasyonu

### ✅ Genel Davalar Klasör Ağacı & Yönetimi (`/cases`)
- `FMS_FrontEnd/src/app/cases/page.tsx`: İki kolonlu (`lg:grid-cols-12`) düzene geçirildi. Sol tarafa `DmsExplorer` entegre edilerek Genel Davalar (`Genel Dosyalar`) altındaki klasör ağacı görüntülendi.
- Yeni klasör oluşturma (`onCreateFolder`), yeniden adlandırma (`onRenameFolder`), silme (`onDeleteFolder`) ve sürükle-bırak taşıma (`onMoveItem`) özellikleri Genel Davalar sayfasında aktif edildi.
- URL `?folder=[id]` query parametresi senkronizasyonu sağlandı; seçili klasör için aktif filtre rozeti ve "Filtreyi Temizle" butonu eklendi.

### ✅ Dolu Klasör Silme Koruması & Kök Dizin Taşıma
- `FMS_FrontEnd/src/components/documents/dms-explorer.tsx`: Klasör içinde belge veya alt klasör bulunması durumunda (`folderHasContent(editingFolder)`), silme modalında "Sil" butonu tamamen kaldırıldı; sarı uyarı ikonu (`AlertTriangle`) ile dolu klasörlerin silinemeyeceğine dair net uyarı ve "Anladım" butonu sunuldu.
- Klasörlerin kök dizin (`Genel Dosyalar`) ve birbirlerinin altına taşınabilmesi için `forceGeneralTree`, `rootDropParentId` ve `showRootDropZone` entegrasyonu tamamlandı.

### ✅ Sol Menü (Sidebar) Genel Davalar Klasör Navigasyonu
- `FMS_FrontEnd/src/components/layout/cases-nav-group.tsx`: Sol menüde "Dosyalar > Genel Davalar" altına oluşturulan ve mevcut klasörler dinamik alt menü olarak yerleştirildi.
- Klasöre tıklandığında `/cases?folder=[id]` rotasına yönlendirme sağlandı ve aktif klasör vurgulandı.
- Daraltılmış (collapsed) sidebar modunda tooltip içinde de Genel Davalar alt klasörleri gösterildi.
- `FMS_FrontEnd/src/lib/folder-tree-utils.ts`: `getGeneralFolderTree` ve `getGeneralSidebarFolders` yardımcı fonksiyonları eklendi.

---

## 2026-09-11 — Sol Menü Sigorta Tahkim Durum Navigasyonu & Tahkim Filtreleme (TASK-UI-001 ✅)

**Tür:** UI/UX İyileştirmesi & Bug Fix

### ✅ Sidebar Navigasyonu Düzeltmesi
- `FMS_FrontEnd/src/components/layout/cases-nav-group.tsx`: Sol menüde "Dosyalar > Sigorta Tahkim" altında yer alan durum klasörlerine (Ön Başvuru, Yeni Başvuru, Komisyonda, Eksper İncelemesi, Karar, Kapalı) tıklandığında `/documents?folder=...` sayfasına gitmesi engellendi; ilgili tahkim durum rotasına (`/arbitration?status=[STATUS]`) yönlendirme yapıldı.
- Aktiflik kontrolü (`isChildActive`), URL query parametrelerini de (`status`) dikkate alacak şekilde güncellendi.
- `types/arbitration.ts` ve `folder-tree-utils.ts`: "Yeni Başvuru" ve "Ön Başvuru" birbirine karışmayacak şekilde `NEW_APPLICATION` ve `PRE_APPLICATION` bağımsız statüler olarak ayrıştırıldı; iki menü öğesinin aynı anda aktifleşmesi engellendi.
- `FMS_FrontEnd/src/components/layout/sidebar.tsx`: Next.js 15 App Router kuralları uyarınca `CasesNavGroup` `<Suspense fallback={null}>` sınırına alındı.

### ✅ Tahkim Sayfası Durum Filtreleme & Ağaç Entegrasyonu
- `FMS_FrontEnd/src/app/(dashboard)/arbitration/page.tsx`:
  - `useSearchParams` ile `status` query parametresi okundu ve tablo verisi seçilen duruma göre filtrelendi.
  - Aktif filtre rozeti ve "Filtreyi Temizle" (`/arbitration`) butonu eklendi.
  - Sol taraftaki `DmsExplorer` klasör ağacında ilgili durum klasörünün seçili/vurgulu gelmesi sağlandı (`initialFolderId`).
  - Sol paneldeki ağaçtan durum veya dava klasörüne tıklandığında router senkronizasyonu tamamlandı.
- `FMS_FrontEnd/src/lib/folder-tree-utils.ts`: Durum ID'leri ve Türkçe isimleri (`Ön Başvuru`, `Yeni Başvuru` vb.) `ArbitrationStatus` enum değerine eşleyen yardımcılar eklendi.

---

## 2026-09-11 — AI-OS Sistem Sadeleştirme, Runbook & Güvenlik Konsolidasyonu ✅

**Tür:** AI-OS Mimari İyileştirme & Dokümantasyon Refactor

### ✅ Altyapı & Hafıza Senkronizasyonu
- `02_MEMORY/LAST_SESSION.md` ve `CURRENT_STATE.md` Docker Compose devrede olacak şekilde güncellendi.
- `09_LOGS/TECH_DEBT.md` ve `09_LOGS/RISKS.md` güncel duruma (2026-09-11) getirildi.
- `03_PLANNING/ROADMAP.md` zaman çizelgesi 2026 Q3 gerçekliğine hizalandı.

### ✅ 04_CONTEXT Katmanı Güçlendirmesi
- `04_CONTEXT/RUNBOOK.md` — Docker Compose, yerel Scoop fallback, port ve ortam değişkenleri tek kaynak haline getirildi (`CURRENT_STATE` hafifletildi).
- `04_CONTEXT/FRONTEND_ARCHITECTURE.md` — Next.js 15, DmsExplorer, kurumsal minimal renk token'ları ve state yönetimi derlendi.
- `04_CONTEXT/SECURITY.md` — Multi-tenant Hibernate filtresi, TenantContext, TenantTaskDecorator, soft-delete ve RBAC modeli yazıldı.

### ✅ Standartlar & Manifest Sadeleştirmesi
- `05_AGENTS/FULLSTACK_IMPLEMENTER.md` — Cursor için birincil uçtan uca rol oluşturuldu; yapay "Asla frontend/backend'e dokunma" kısıtları gevşetildi.
- `AI_MANIFEST.md` — Hafıza güncelleyicisi olarak oturum implementer'ı netleştirildi; task lifecycle `BACKLOG → IN PROGRESS → DONE → ARCHIVED` olarak sadeleştirildi.
- `07_STANDARDS/NAMING_STANDARD.md` — Interface'lerdeki `I` öneki kaldırıldı (modern TypeScript ve Java standartlarına hizalandı).
- `01_KNOWLEDGE/ARCHITECTURE_DECISIONS.md` — ADR-009 endpoint listesine `/arbitration`, `/folders`, `/search`, `/organizations`, `/audit` eklendi.

### ✅ Temizlik ve Arşivleme
- Dış gölge dosyalar (`agent_promt.txt`, `.idea/mnifest.md`, `.idea/DONE.md`) silindi; `backend.md`, `frontend.md`, `tasarim.md` `.ai-os` yönlendiricilerine dönüştürüldü.
- `03_PLANNING/DONE.md` içindeki Haziran 2026 ve öncesi kayıtlar `03_PLANNING/ARCHIVE/DONE_2026_Q2.md` dosyasına taşındı.

---

## 2026-08-05 — AI-OS Kod↔Hafıza Senkronu ✅

**Tür:** Dokümantasyon / AI-OS (ürün kodu yok)

### ✅ Teknik bağlam
- `DATABASE_SCHEMA.md` V12 + DMS detay + ER
- `API_CONTRACT.md` Auth/DMS/Search + HTTP hata tablosu

### ✅ Planlama hijyeni
- `TASKS.md` — tamamlananlar kaldırıldı (yalnızca aktif: TASK-003…012 + kısmi TASK-004)
- Sprint-2 / DMS / TASK-001 / TASK-002 kayıtları bu dosyada kaldı

### ✅ AI-OS polish
- `DATABASE_TEMPLATE.md`, platform prompt'ları, template protokolü
- `AI_OS_BACKLOG` 001–006, 008 kapatıldı

---

## 2026-07-13 — Sigorta Tahkim Klasör Ağacı UX Ayrımı (TASK-DMS-005 ✅)

**Görev:** TASK-DMS-005 — kullanıcı talebi 2026-07-13

### ✅ Sayfa düzeni
- `/arbitration` — sol panel: `Sigorta Tahkim` klasör ağacı (manage, DnD); sağ panel: tahkim tablosu
- `/arbitration/[id]` — Dosyalar sekmesi: yalnızca belge listesi + yükleme (klasör ağacı kaldırıldı)
- Dosya klasörü tıklanınca ilgili tahkim detay sayfasına yönlendirme

### ✅ DmsExplorer modları
- `showFolderTree` / `showDocumentPanel` — tree-only ve document-only kullanım
- `forceArbitrationTree` — liste sayfasında yalnızca Sigorta Tahkim ağacı
- `onFolderSelect` — klasör seçiminde özel navigasyon
- `useDocuments` — opsiyonel `enabled` (tree-only panelde API çağrısı yok)

### 📁 Etkilenen dosyalar
**Frontend:** `dms-explorer.tsx`, `use-api.ts`, `arbitration/page.tsx`, `arbitration/[id]/page.tsx`

---

## 2026-07-06 — DMS Klasör Hiyerarşisi (TASK-DMS-004 ✅)

**Görev:** TASK-DMS-004 — kullanıcı onayı 2026-07-06

### ✅ Klasör yapısı
- `Genel Dosyalar` + `Sigorta Tahkim` sistem kökleri
- Tahkim: `Sigorta Tahkim / Ön Başvuru / {plaka - müvekkil - esas}`
- `/documents` browse tree — iki kök görünür
- Tahkim detay — `Sigorta Tahkim` subtree; oluşturulan klasörler anında görünür

### ✅ Backend bootstrap
- `DmsFolderHierarchyService` — migration olmadan org hiyerarşisi
- `ArbitrationDmsFolderService` — tahkim ↔ DMS FK

### ✅ UX
- Üst dosya kartı kaldırıldı (tahkim detay)
- Sidebar — DMS klasör navigasyonu (dosya adı listesi yerine)
- Klasör CRUD — UI kilidi yok

### 📁 Etkilenen dosyalar
**Backend:** `V11__*.sql`, `V12__*.sql`, `DmsFolderHierarchyService.java`, `ArbitrationDmsFolderService.java`, `DmsSystemFolders.java`, `FolderService.java`, `FolderRepository.java`  
**Frontend:** `folder-tree-utils.ts`, `dms-explorer.tsx`, `use-api.ts`, `cases-nav-group.tsx`, `folder-tree.tsx`, `arbitration/[id]/page.tsx`, `documents/page.tsx`, `create-arbitration-dialog.tsx`, `update-court-basis-dialog.tsx`, `types/arbitration.ts`

---

## 2026-07-03 — Tahkim Klasör DnD + Belgeler Tree Senkronizasyonu

**Görev:** TASK-DMS-003 ✅

### ✅ Klasör sürükle-bırak (tahkim detay)
- `DropZone` yalnızca OS dosya sürüklemelerinde upload overlay gösterir
- Internal `FOLDER`/`DOCUMENT` drag olayları `FolderTree` / `RootDropZone`'a ulaşır
- Kök dizin drop zone görünürlüğü iyileştirildi

### ✅ Belgeler ↔ tahkim detay tree senkronizasyonu
- `DmsExplorer` global `useFolders()` + `filterFolderTreeForScope` (manage mod)
- Klasör mutasyonları global `["folders"]` cache — tek kaynak
- `FolderService` — scope tree yetim düğüm düzeltmesi; alt klasörde parent `caseId`/`arbitrationCaseId` mirası

### 📁 Etkilenen dosyalar
**Frontend:** `drop-zone.tsx`, `dms-explorer.tsx`, `use-api.ts`, `folder-tree-utils.ts`, `folder-tree.tsx`  
**Backend:** `FolderService.java`

---

*2026-06-22 ve öncesi tamamlanan sprintler için `ARCHIVE/DONE_2026_Q2.md` dosyasına bakın.*
