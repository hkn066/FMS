# FMS Environment Runbook

Tek kaynaklı ortam kurulum, çalıştırma, port ve operasyonel kılavuz.

---

## 1. Servis Haritası ve Erişim

| Servis | URL | Port | Varsayılan Kimlik Bilgisi |
|--------|-----|------|---------------------------|
| **Frontend Web** | `http://localhost:3000` | 3000 | - |
| **Backend REST API** | `http://localhost:8080` | 8080 | - |
| **Swagger UI** | `http://localhost:8080/swagger-ui.html` | 8080 | - |
| **Actuator Health** | `http://localhost:8080/actuator/health` | 8080 | - |
| **PostgreSQL** | `localhost:5432` | 5432 | `fms_user` / `fms_password` (DB: `fms_db`) |
| **Redis** | `localhost:6379` | 6379 | (şifresiz) |
| **RabbitMQ Management** | `http://localhost:15672` | 15672 | `guest` / `guest` |
| **RabbitMQ AMQP** | `localhost:5672` | 5672 | `guest` / `guest` |
| **MinIO S3 API** | `http://localhost:9000` | 9000 | `minioadmin` / `minioadmin` |
| **MinIO Web Console** | `http://localhost:9001` | 9001 | `minioadmin` / `minioadmin` |

**Varsayılan Uygulama Girişi:**
- E-posta: `admin@hukukofisi.com`
- Şifre: `Admin123!`
- Tenant: `DEFAULT` (`00000000-0000-0000-0000-000000000001`)

---

## 2. Tek Komutla Çalıştırma (Önerilen)

Projeyi tüm altyapı, backend ve frontend bileşenleriyle birlikte akıllıca başlatmak veya yeniden başlatmak (restart) için:

### Bash / Git Bash:
```bash
./run.sh          # Ayaktaysa restart eder, kapalıysa başlatır
./run.sh stop     # Tüm servisleri ve Docker konteynerlerini durdurur
./run.sh status   # Servis ve konteyner durumlarını görüntüler
./run.sh logs backend   # Backend canlı log akışı
./run.sh logs frontend  # Frontend canlı log akışı
```

### PowerShell:
```powershell
.\run.ps1         # Ayaktaysa restart eder, kapalıysa başlatır
.\run.ps1 stop    # Tüm servisleri ve Docker konteynerlerini durdurur
.\run.ps1 status  # Servis ve konteyner durumlarını görüntüler
```

---

## 3. Manuel Başlatma: Docker Compose

Altyapı servislerini (Postgres, Redis, RabbitMQ, MinIO) Docker ile ayağa kaldırın:

```bash
# 1. Altyapı konteynerlerini başlat
cd FMS-BE
docker compose up -d

# 2. Konteyner durumlarını kontrol et
docker compose ps

# 3. Backend'i çalıştır
mvn spring-boot:run

# 4. Frontend'i çalıştır (yeni terminal)
cd ../FMS-FE
npm install
npm run dev
```

---

## 3. Alternatif Yol: Yerel Scoop Kurulumu (Docker Yoksa)

Windows ortamında Docker Desktop bulunmadığında kullanılan bağımsız yerel servis kurulumu:

```powershell
# Gerekli Scoop paketleri:
scoop install postgresql redis minio temurin21-jdk nodejs

# PostgreSQL başlatma:
pg_ctl -D "$env:USERPROFILE\scoop\persist\postgresql\data" start

# Redis başlatma:
redis-server

# MinIO başlatma:
minio server "$env:USERPROFILE\minio-data" --console-address ":9001"

# RabbitMQ yoksa backend'i devre dışı bırakarak çalıştırma:
cd FMS-BE
$env:RABBITMQ_ENABLED="false"
$env:SPRING_AUTOCONFIGURE_EXCLUDE="org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration"
mvn -DskipTests spring-boot:run
```

---

## 4. Ortam Değişkenleri (.env)

### Backend (`application.yml` veya ENV)
- `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/fms_db`
- `SPRING_DATASOURCE_USERNAME=fms_user`
- `SPRING_DATASOURCE_PASSWORD=fms_password`
- `SPRING_DATA_REDIS_HOST=localhost`
- `SPRING_DATA_REDIS_PORT=6379`
- `MINIO_ENDPOINT=http://localhost:9000`
- `MINIO_ACCESS_KEY=minioadmin`
- `MINIO_SECRET_KEY=minioadmin`
- `MINIO_BUCKET_NAME=fms-documents`
- `JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970`

### Frontend (`.env.local`)
- `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`

---

## 5. Doğrulama ve Sağlık Kontrolleri (Smoke Tests)

1. **Backend Sağlığı:**
   ```bash
   curl http://localhost:8080/actuator/health
   # Beklenen yanıt: {"status":"UP"}
   ```
2. **Auth API:**
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@hukukofisi.com","password":"Admin123!"}'
   # Beklenen: 200 OK + JWT accessToken ve refreshToken
   ```
3. **Frontend:**
   Tarayıcıda `http://localhost:3000` açılmalı ve `/login` ekranı render edilmeli.
