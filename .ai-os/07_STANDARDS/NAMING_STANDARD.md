# Naming Standard

FMS kod tabanında tutarlılığı korumak için geçerli isimlendirme kuralları.

---

## 1. Dosya ve Klasörler

- **React Bileşenleri:** PascalCase (`FolderTree.tsx`, `DmsExplorer.tsx`)
- **Yardımcı Araçlar & Servisler:** kebab-case veya camelCase (`folder-tree-utils.ts`, `search.service.ts`)
- **Klasörler:** kebab-case (`case-management`, `dms-explorer`, `ui`)

---

## 2. Java / Backend Standartları

- **Sınıflar & Record'lar:** PascalCase (`FolderService`, `CaseResponseDto`)
- **Interface'ler:** PascalCase — **Kesinlikle `I` öneki (IUserService vb.) KULLANILMAZ** (`UserRepository`, `TenantFilterEnabler`).
- **Metotlar ve Değişkenler:** camelCase (`findActiveCasesByClient`, `totalCount`)
- **Sabitler:** UPPER_SNAKE_CASE (`DEFAULT_PAGE_SIZE`, `MAX_RETRY_COUNT`)
- **Paketler:** lowercase dot notation (`com.lawoffice.fms.casemanagement`)

---

## 3. TypeScript / Frontend Standartları

- **Tipler ve Interface'ler:** PascalCase — **Kesinlikle `I` öneki KULLANILMAZ** (`FolderNode`, `DocumentNode`, `CaseSummary`).
- **React Hook'ları:** camelCase `use` öneki (`useSearch`, `useFolders`, `useDocuments`).
- **Değişken ve Fonksiyonlar:** camelCase (`handleFolderSelect`, `isInvalidFolderMove`).

---

## 4. Veritabanı ve API

- **Tablo ve Kolonlar:** snake_case, çoğul tablolar (`arbitration_cases`, `folder_id`, `created_at`).
- **REST Uç Noktaları:** kebab-case, çoğul kaynak isimleri (`/api/v1/cases`, `/api/v1/arbitration-documents`, `/api/v1/lawyer-performance`).
