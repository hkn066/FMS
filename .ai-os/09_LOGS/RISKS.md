# Risk Log

Proje riskleri — append-only kayıt.

Son güncelleme: 2026-09-11

---

## Aktif Riskler

### RISK-001 — Legacy Tahkim Evrak Çift Yolu

| Alan | Değer |
|------|-------|
| Öncelik | Orta |
| Durum | 🔵 İzleniyor |
| İlgili borç | TD-001 |

**Risk:** `arbitration_documents` ve DMS tabloları paralel; yanlış tabloya yazım veya senkron kaybı.

**Azaltma:** Yeni geliştirmeler yalnızca DMS (`documents`/`folders` + `arbitrationCaseId`) kullanmalı.

---

### RISK-002 — UI Shell Sayfalarında Mock Kalması

| Alan | Değer |
|------|-------|
| Öncelik | Düşük |
| Durum | 🔵 İzleniyor |
| İlgili borç | TD-005 |

**Risk:** Kullanıcı demo verisi gerçek sanabilir.

**Azaltma:** Shell sayfalarda empty state veya "yakında" göstergesi; mock bırakılmamalı.

---

### RISK-003 — Tenant İzolasyonu Regresyonu

| Alan | Değer |
|------|-------|
| Öncelik | Yüksek |
| Durum | 🟡 İzleniyor |
| İlgili | ADR-014, ADR-016 |

**Risk:** Yeni endpoint veya async iş `TenantContext` propagation atlayabilir.

**Azaltma:** Her yeni modülde `@PreAuthorize` + tenant filter testi; async → `TenantTaskDecorator`.

---

## Kapatılan Riskler

### RISK-000 — Çift AI Bağlam Kaynağı ✅

**Durum:** Kapatıldı (2026-07-01)  
**Çözüm:** `ai-context/` deprecated; `.ai-os/` birincil kaynak.
