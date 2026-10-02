# Templates

Yeniden kullanılabilir doküman şablonları.

---

## Mevcut Şablonlar

| Şablon | Amaç |
|--------|------|
| `TASK_TEMPLATE.md` | Yeni görev tanımı |
| `SESSION_TEMPLATE.md` | Oturum özeti (`LAST_SESSION.md`) |
| `ADR_TEMPLATE.md` | Mimari karar kaydı |
| `API_TEMPLATE.md` | API endpoint dokümantasyonu |
| `DATABASE_TEMPLATE.md` | Tablo/kolon dokümantasyonu |
| `MODULE_TEMPLATE.md` | Modül teknik özeti |

---

## Kullanım Protokolü

| Durum | Agent | Şablon | Hedef dosya |
|-------|-------|--------|-------------|
| Yeni mimari karar | Architect | `ADR_TEMPLATE.md` | `01_KNOWLEDGE/ARCHITECTURE_DECISIONS.md` |
| Yeni görev | Product Manager | `TASK_TEMPLATE.md` | `03_PLANNING/TASKS.md` |
| Oturum sonu | Tüm agent'lar | `SESSION_TEMPLATE.md` | `02_MEMORY/LAST_SESSION.md` |
| Yeni endpoint | Backend | `API_TEMPLATE.md` | `04_CONTEXT/API_CONTRACT.md` |
| Şema değişikliği | Database | `DATABASE_TEMPLATE.md` | `04_CONTEXT/DATABASE_SCHEMA.md` |
| Yeni modül | Architect | `MODULE_TEMPLATE.md` | `01_KNOWLEDGE/` veya `04_CONTEXT/` |

**Kural:** Yeni doküman yapısı icat etme; mevcut şablonu kopyala ve doldur.

Agent tanımlarına kısa referans: `05_AGENTS/README.md` + ilgili rol dosyası.

Detay geçmişi: `09_LOGS/AI_OS_BACKLOG.md` (BACKLOG-AIOS-003)
