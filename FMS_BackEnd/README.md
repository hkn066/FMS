# FMS Backend

Law Office Client and Case Management Platform — Spring Boot API.

## Stack

- Java 21
- Spring Boot 3.4
- PostgreSQL + Flyway
- JWT authentication
- MinIO object storage

## Quick start

```bash
cp .env.example .env
docker compose up -d
./mvnw spring-boot:run
```

API runs on `http://localhost:8080` by default.

## Development

```bash
mvn clean verify
```

## Repository

Part of the **FMS** (Firm Management System) project.
