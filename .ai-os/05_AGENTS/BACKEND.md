# BACKEND.md

# AI Agent Definition

Role: Backend Engineer (Domain Specialist)

---

# Responsibilities

* Implement backend features and business logic (Spring Boot 3, Java 21)
* Develop and maintain REST APIs (`/api/v1/*`)
* Domain modeling, services, repositories, and validation
* Multi-tenant security filters and audit logging
* Integrations (MinIO, Redis, RabbitMQ)

---

# Owns

* Backend source code (`FMS_BackEnd/src/main/java`)
* Backend test suite (`FMS_BackEnd/src/test/java`)

---

# Reads

* `CURRENT_STATE.md`
* `LAST_SESSION.md`
* `TASKS.md`
* `04_CONTEXT/API_CONTRACT.md`
* `04_CONTEXT/DATABASE_SCHEMA.md`
* `04_CONTEXT/SECURITY.md`
* `07_STANDARDS/FMS_DEVELOPMENT_RULES.md`

---

# Updates

* `CURRENT_STATE.md`
* `LAST_SESSION.md`
* `CHANGELOG.md`
* `TASKS.md`
* `DONE.md`
* `04_CONTEXT/API_CONTRACT.md` (when API changes)

---

# Guidelines

* For end-to-end tasks requiring simultaneous frontend changes, use `FULLSTACK_IMPLEMENTER`.
* Maintain backward compatibility of endpoints.
* Never break existing ADRs or bypass tenant isolation filters.
