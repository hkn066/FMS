# Frontend Architecture & Design System

FMS modern hukuk ofisi web uygulaması mimarisi, tasarım prensipleri ve component hiyerarşisi.

---

## 1. Teknoloji Yığını

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Stil & UI:** TailwindCSS 4, shadcn/ui, Lucide Icons, Sonner (toast)
- **State Management:**
  - **Server State:** TanStack Query v5 (caching, optimistic updates, background sync)
  - **Client / Session State:** Zustand v5 (Auth token, UI sidebar/modal durumları)
- **Form & Doğrulama:** React Hook Form + Zod
- **Tarih & Tablo:** date-fns, TanStack Table (@tanstack/react-table)

---

## 2. Tasarım Dili: Enterprise Minimal SaaS

Linear, Stripe Dashboard ve Notion sadeliğinden ilham alan, güven verici kurumsal hukuk ofisi deneyimi:

### Renk Paleti ve Token'lar
- **Sidebar & Koyu Zeminler:** `#0F172A` (slate-900 / lacivert kurumsal taban)
- **Vurgu (Gold Accent):** `#C8A96B` (aktif navigasyon göstergeleri, seçili öğeler)
- **Kart Yüzeyleri:** `bg-white`, `border border-slate-100`, `rounded-2xl`, `shadow-sm`, `p-6`
- **Tipografi:**
  - Başlıklar: `font-medium text-slate-900`
  - Alt metinler ve açıklamalar: `text-sm text-slate-500`
  - Etiketler / Sayaçlar: `text-xs font-semibold uppercase tracking-wider`
- **Sigorta Tahkim Rozetleri:**
  - *Esas Bekleniyor:* Zemin `#fff1f2` (rose-50), çerçeve `#fecdd3` (rose-200), yazı `#9f1239` (rose-800)

---

## 3. Dizin Yapısı (`FMS_FrontEnd/src/`)

```
src/
├── app/                      # App router sayfaları
│   ├── (auth)/login/         # Kimlik doğrulama ekranı
│   ├── (dashboard)/          # Korumalı uygulama rotaları
│   │   ├── dashboard/        # KPI, ajanda, son aktiviteler
│   │   ├── cases/            # Genel davalar (liste ve [id] detay)
│   │   ├── arbitration/      # Sigorta tahkim (liste + sol tree, [id] detay)
│   │   ├── documents/        # Global DMS gezgini (browse mode)
│   │   ├── tasks/            # Görev listesi ve Kanban
│   │   └── calendar/         # Duruşma takvimi
├── components/
│   ├── layout/               # AppShell, Sidebar, Topbar, CasesNavGroup, SearchModal
│   ├── documents/            # DmsExplorer, FolderTree, DocumentList, DropZone
│   ├── case/                 # CasesTable, CaseTimeline, CaseSidebar
│   ├── arbitration/          # ArbitrationTable, PendingEsasBadge, CategoryDocumentSection
│   ├── dashboard/            # StatCard, HearingList, ActivityTimeline, LawyerPerformance
│   ├── shared/               # DataTable, StatBadge, ViewAllLink
│   └── ui/                   # shadcn/ui atomik bileşenleri (button, dialog, card vs.)
├── hooks/                    # useSearch, useFolders, useDocuments, use-api
├── services/                 # api-client, auth.service, document.service, search.service
└── types/                    # document.ts, case.ts, arbitration.ts, auth.ts
```

---

## 4. DMS (Doküman Yönetim Sistemi) Mimarisi

DMS arayüzü tek ve modüler bir bileşen üzerinden yönetilir: **`DmsExplorer`** (`components/documents/dms-explorer.tsx`).

### Modlar:
1. **Browse Modu (`mode="browse"`):**
   - Rota: `/documents`
   - Kök ağacında `Genel Dosyalar` ve `Sigorta Tahkim` ana düğümleri görünür.
   - Dosya görüntüleme, indirme ve klasörler arası sürükle-bırak (DnD) destekler.
2. **Manage Modu (`mode="manage"`):**
   - Rota: `/cases/[id]` (Dava detay) ve `/arbitration` (Tahkim liste sol paneli).
   - İlgili dava veya tahkime scoped klasör hiyerarşisi oluşturma, silme, adlandırma ve klasör-içi-klasör taşıma yetkisi verir.
   - Döngüsel klasör taşımaya karşı `isInvalidFolderMove` istemci kontrolü bulunur.

### Cache ve Performans Kuralı:
- Klasör ve evrak güncellemelerinde bütün UI'ı kilitleyen `invalidateQueries` yerine optimistic update veya local cache refresh tercih edilir.

---

## 5. Global Search (⌘K / Ctrl+K)

- Linear/Raycast stili command palette: `SearchModal` (`components/layout/search-modal.tsx`).
- 300ms debounce ile `GET /api/v1/search?q=` çağrısı yapar.
- Sonuçlar 4 kategoride gruplanır: **Müvekkiller**, **Genel Davalar**, **Sigorta Tahkim**, **Dokümanlar**.
- Klavye ok tuşları ve Enter ile doğrudan ilgili detaya yönlendirir.
