# AI Agents

This directory contains AI Agent role definitions for AI-OS.

In standard AI-assisted development (Cursor), the **Full-Stack Implementer** is the primary operational agent executing end-to-end tasks. Specialized roles exist to provide focused perspectives when required.

---

## Agent Directory

| Agent | Role | Status |
|-------|------|--------|
| **FULLSTACK_IMPLEMENTER** | End-to-end fullstack implementation (Backend + Frontend + DB + Memory) | **Primary (Cursor Default)** |
| **BACKEND** | Backend services, REST APIs, business logic, integrations | Specialized |
| **FRONTEND** | UI/UX, components, state management, design system | Specialized |
| **ARCHITECT** | System design, ADRs, high-level technology choices | Advisory |
| **PRODUCT_MANAGER** | Backlog, feature requirements, task breakdown | Planning |
| **DATABASE** | Flyway migrations, schema design, index & query tuning | Specialized |
| **DEVOPS** | Docker, CI/CD, deployment, runbooks | Operations |
| **QA** | Testing strategies, E2E, integration coverage | Quality |
| **REVIEWER** | Code quality, refactoring, debt analysis | Review |

---

## Operational Workflow

1. Read `000_START_HERE.md` and `06_PROMPTS/CURSOR_SYSTEM.md`.
2. Load required project memory: `02_MEMORY/CURRENT_STATE.md` and `LAST_SESSION.md`.
3. Check active task: `03_PLANNING/TASKS.md` or user prompt.
4. Load necessary context from `04_CONTEXT/` (do not load the entire repository).
5. Implement changes adhering to `07_STANDARDS/FMS_DEVELOPMENT_RULES.md`.
6. Update memory files upon session completion (`CURRENT_STATE`, `LAST_SESSION`, `CHANGELOG`, `TASKS`).

---

## Memory Ownership Principle

To maintain a single source of truth without operational gridlock:
- **Project Memory Writer:** Whichever agent executes and finishes a session is responsible for updating `02_MEMORY/` and `03_PLANNING/`.
- **Domain Ownership:** Code ownership strictly applies to modular architecture; however, fullstack implementers possess write access across layers when delivering cohesive features.
