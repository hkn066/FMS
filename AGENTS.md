# FMS — AI Operating System (AI-OS)

Bu proje `.ai-os/` bilgi mimarisi ile yönetilmektedir.

## Hızlı Başlangıç

1. **Bootloader:** `.ai-os/000_START_HERE.md`
2. **Cursor Entegrasyonu:** `.ai-os/06_PROMPTS/CURSOR_SYSTEM.md` ve `.cursor/rules/fms-ai-os.mdc`
3. **Mevcut Durum:** `.ai-os/02_MEMORY/CURRENT_STATE.md` ve `.ai-os/02_MEMORY/LAST_SESSION.md`
4. **Ortam Çalıştırma:** `.ai-os/04_CONTEXT/RUNBOOK.md`

## AI Agent Rolleri

| Rol | Tanım Dosyası | Durum |
|-----|---------------|-------|
| **Full-Stack Implementer** | `.ai-os/05_AGENTS/FULLSTACK_IMPLEMENTER.md` | **Birincil (Cursor Varsayılanı)** |
| Product Manager | `.ai-os/05_AGENTS/PRODUCT_MANAGER.md` | Planlama |
| Architect | `.ai-os/05_AGENTS/ARCHITECT.md` | Mimari & ADR |
| Backend | `.ai-os/05_AGENTS/BACKEND.md` | Uzmanlaşmış API/Servis |
| Frontend | `.ai-os/05_AGENTS/FRONTEND.md` | Uzmanlaşmış UI/UX |
| Database | `.ai-os/05_AGENTS/DATABASE.md` | Flyway & Şema |
| DevOps | `.ai-os/05_AGENTS/DEVOPS.md` | Altyapı & CI/CD |
| QA / Reviewer | `.ai-os/05_AGENTS/QA.md` / `REVIEWER.md` | Kalite & İnceleme |
