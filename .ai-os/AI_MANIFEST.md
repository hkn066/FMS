# AI Operating System (AI-OS) Manifest

Version: 1.0.0

Status: Active

---

# 1. Purpose

AI-OS is the operational layer of the project.

Its purpose is to provide every AI agent with a consistent, deterministic and up-to-date understanding of the project without relying on conversation history.

The AI Operating System exists independently from the application itself.

Projects evolve.

AI models evolve.

The operating system remains.

---

# 2. Core Principles

## Single Source of Truth

Every piece of information must exist in exactly one location.

No duplicated knowledge.

No conflicting documentation.

---

## Deterministic Context

An AI must always know:

* where it is
* what it is responsible for
* what has already been completed
* what should happen next

without asking additional questions.

---

## Living Documentation

Documentation is not static.

Every completed task updates the project memory.

Documentation evolves together with the codebase.

---

## Separation of Responsibilities

Every document has exactly one primary responsibility and single source of truth.

Every AI role has a clearly defined scope.

Live project memory (`02_MEMORY/`) is updated by the active implementer at the end of each session to prevent coordination deadlocks.

---

## Project Independence

AI-OS is not tied to any specific project.

The same operating system can manage different software projects.

---

# 3. Knowledge Layers

AI-OS consists of independent layers.

Layer 1

Knowledge

Permanent project knowledge.

Layer 2

Memory

Current project state.

Layer 3

Planning

Tasks and roadmap.

Layer 4

Technical Context

Architecture, APIs, schema and implementation details.

Layer 5

Agents

AI responsibilities.

Layer 6

Prompts

Agent behaviour.

Layer 7

Standards

Engineering conventions.

Layer 8

Templates

Reusable document structures.

Layer 9

Logs

Historical decisions and technical debt.

---

# 4. AI Roles

AI development utilizes an operational primary role alongside focused specialist perspectives.

Fullstack Implementer (Primary)

Executes end-to-end features spanning API, UI, database migrations, and memory updates. The standard profile for Cursor and modern AI IDEs.

Architect

Defines high-level architecture and authoritatively maintains ADRs.

Backend

Focuses on backend services, API contracts, and domain business rules.

Frontend

Focuses on UI/UX, components, state management, and design system tokens.

Database

Owns database design, Flyway migrations, and query performance.

DevOps

Maintains infrastructure, Docker environments, CI/CD, and runbooks.

QA

Oversees automated testing, E2E validation, and quality gates.

Reviewer

Evaluates code quality, refactoring, and architectural conformity.

Product Manager

Coordinates planning, backlog management, and task decomposition.

---

# 5. Context Philosophy

AI never loads the whole repository.

AI only loads the information required for the current task.

Context is constructed dynamically.

---

# 6. Project Memory

Project memory is always composed of:

Current State

Last Session

Current Task

Relevant Technical Context

The assigned Agent definition

Nothing more.

Nothing less.

---

# 7. Task Lifecycle

Tasks follow a lean, pragmatic lifecycle aligned with active planning files (`TASKS.md` and `DONE.md`):

BACKLOG (Bekliyor)

↓

IN PROGRESS (Devam Ediyor)

↓

DONE (Tamamlandı)

↓

ARCHIVED (Arşiv)

Tasks transition cleanly between states without redundant intermediate friction.

---

# 8. Session Lifecycle

Every AI session starts by reading the required documents.

Every AI session ends by updating project memory.

No session ends without updating memory.

---

# 9. Update Protocol

Whenever code changes:

CURRENT_STATE must be updated.

LAST_SESSION must be updated.

CHANGELOG must be updated.

Relevant TASK status must be updated.

NEXT_TASK must be prepared.

---

# 10. Engineering Philosophy

Prefer simplicity.

Prefer readability.

Prefer maintainability.

Avoid unnecessary complexity.

Avoid duplicated logic.

Follow established standards.

---

# 11. Future Compatibility & Tool Adapters

The operating system's architectural layers (Knowledge, Memory, Context, Standards) are completely model-agnostic and resilient to AI evolution.

To maximize real-world developer ergonomics, Layer 6 (`06_PROMPTS/`) provides specialized adapter profiles (such as Cursor, Claude, ChatGPT, Gemini). The core framework remains universal, while prompts adapt to specific tool capabilities.

---

# 12. Success Criteria

A completely new AI should be able to:

Understand the project.

Determine its role.

Identify the current task.

Implement the task.

Update project memory.

Leave the project in a better state than before.

without requiring previous conversation history.

---

End of Manifest.

