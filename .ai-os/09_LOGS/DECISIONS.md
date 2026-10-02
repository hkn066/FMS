# Decision Log

Operasyonel ve süreç kararları (ADR'lerden ayrı).  
Mimari kararlar → `01_KNOWLEDGE/ARCHITECTURE_DECISIONS.md`

---

## DEC-001 — AI-OS Birincil Kaynak

**Tarih:** 2026-07-01  
**Agent:** Architect / Migration session

### Context

`ai-context/` ve `.ai-os/` paralel çalışıyordu; içerik çakışması ve ADR numara uyumsuzluğu vardı.

### Decision

`.ai-os/` birincil kaynak; `ai-context/` redirect stub'a çevrildi.

### Impact

- Pozitif: Tek kaynak, deterministik agent bağlamı
- Negatif: Geçiş döneminde eski referanslar kırılabilir (stub ile giderildi)

---

## DEC-002 — Kullanıcı Yönlendirmeli Geliştirme Modu

**Tarih:** 2026-07-03  
**Agent:** Session

### Context

AI-OS altyapı eksikleri backlog'a alındı. Kullanıcı kendi öncelikleriyle geliştirmeye geçecek.

### Decision

- `NEXT_TASK.md` öneri moduna alındı (zorunlu sıra değil)
- AI-OS eksikleri `09_LOGS/AI_OS_BACKLOG.md`'de takip edilir
- Kullanıcı talebi `TASKS.md`'ye eşlenir veya oturumda tanımlanır
- Agent yine hafıza protokolünü uygular (kod değişikliği → memory güncelle)

### Impact

- Pozitif: Esnek geliştirme, backlog görünür
- Dikkat: `NEXT_TASK.md` ile kullanıcı talebi çelişirse kullanıcı talebi öncelikli
