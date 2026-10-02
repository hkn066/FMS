# 06_PROMPTS

Agent davranış prompt'ları.

## Dosyalar

| Dosya | Platform | Rol odağı |
|-------|----------|-----------|
| `CURSOR_SYSTEM.md` | Cursor IDE (**birincil**) | Implementation |
| `CLAUDE_SYSTEM.md` | Claude | Architect |
| `CHATGPT_SYSTEM.md` | ChatGPT | Reviewer |
| `GEMINI_SYSTEM.md` | Gemini | Product Manager |
| `USER_PROMPT_GUIDE.md` | Kullanıcı / Geliştirici | Standart görev & prompt şablonları |

Cursor oturumları her zaman `CURSOR_SYSTEM.md` + `.cursor/rules/fms-ai-os.mdc` ile başlar.

Platform prompt'ları FMS boot sequence, hafıza protokolü ve dil kurallarını içerir (BACKLOG-AIOS-002 ✅ 2026-08-05).
