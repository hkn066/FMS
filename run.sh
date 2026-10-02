#!/usr/bin/env bash
# ==============================================================================
# FMS (File & Case Management System) - Orchestration Script
# Usage:
#   ./run.sh          -> Akıllı başlat (çalışıyorsa restart, değilse start)
#   ./run.sh start    -> Başlat
#   ./run.sh restart  -> Yeniden başlat
#   ./run.sh stop     -> Tüm servisleri durdur
#   ./run.sh status   -> Durum kontrolü
#   ./run.sh logs [backend|frontend] -> Canlı log takibi
# ==============================================================================

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Dizinler
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/FMS_BackEnd"
FRONTEND_DIR="$SCRIPT_DIR/FMS_FrontEnd"
LOGS_DIR="$SCRIPT_DIR/logs"

mkdir -p "$LOGS_DIR"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[UYARI]${NC} $1"; }
log_error() { echo -e "${RED}[HATA]${NC} $1"; }

# ------------------------------------------------------------------------------
# Yardımcı Fonksiyonlar: Port ve Süreç Yönetimi
# ------------------------------------------------------------------------------
get_pid_by_port() {
  local port=$1
  local pid=""
  if command -v netstat.exe >/dev/null 2>&1; then
    pid=$(netstat.exe -ano | awk -v p=":$port" '$2 ~ p && $4 == "LISTENING" {print $5}' | tr -d '\r' | head -n 1)
  elif command -v lsof >/dev/null 2>&1; then
    pid=$(lsof -ti :"$port" | head -n 1)
  fi
  echo "$pid"
}

kill_pid() {
  local pid=$1
  if [ -n "$pid" ] && [ "$pid" != "0" ]; then
    if command -v taskkill.exe >/dev/null 2>&1; then
      taskkill.exe //F //T //PID "$pid" >/dev/null 2>&1 || true
    else
      kill -9 "$pid" >/dev/null 2>&1 || true
    fi
  fi
}

# ------------------------------------------------------------------------------
# Java Ortamı Ayarı (Temurin 21 Scoop Fallback)
# ------------------------------------------------------------------------------
setup_java_env() {
  local java_ver=""
  if command -v java >/dev/null 2>&1; then
    java_ver=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 || echo "")
  fi

  # Java 21 değilse Scoop altındaki Temurin-21'i arayalım
  if [[ ! "$java_ver" =~ ^21 ]]; then
    local scoop_java=""
    if [ -d "$USERPROFILE/scoop/apps/temurin21-jdk/current" ]; then
      scoop_java="$USERPROFILE/scoop/apps/temurin21-jdk/current"
    elif [ -d "/c/Users/$USER/scoop/apps/temurin21-jdk/current" ]; then
      scoop_java="/c/Users/$USER/scoop/apps/temurin21-jdk/current"
    fi

    if [ -n "$scoop_java" ]; then
      export JAVA_HOME="$scoop_java"
      export PATH="$JAVA_HOME/bin:$PATH"
      log_info "Java 21 aktif edildi: $JAVA_HOME"
    else
      log_warn "Temurin 21 bulunamadı, mevcut Java kullanılıyor ($java_ver)."
    fi
  fi
}

# ------------------------------------------------------------------------------
# Docker Kontrolü ve Başlatma
# ------------------------------------------------------------------------------
ensure_docker() {
  log_info "Docker ortamı kontrol ediliyor..."
  if ! docker info >/dev/null 2>&1; then
    log_warn "Docker servisi çalışmıyor. Docker Desktop başlatılıyor..."
    powershell.exe -NoProfile -Command '
      $paths = @(
        "$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe",
        "C:\Program Files\Docker\Docker\Docker Desktop.exe"
      )
      foreach ($p in $paths) {
        if (Test-Path $p) {
          Start-Process $p
          break
        }
      }
    ' >/dev/null 2>&1 || true

    log_info "Docker Daemon'ın hazır olması bekleniyor..."
    local count=0
    while ! docker info >/dev/null 2>&1; do
      sleep 2
      count=$((count + 2))
      if [ $count -ge 90 ]; then
        log_error "Docker Desktop zamanında başlatılamadı. Lütfen Docker'ı manuel açın."
        exit 1
      fi
    done
  fi

  log_info "Altyapı konteynerleri (PostgreSQL, Redis, RabbitMQ, MinIO) başlatılıyor..."
  (cd "$BACKEND_DIR" && docker compose up -d postgres redis rabbitmq minio >/dev/null 2>&1)
  log_success "Docker altyapı servisleri hazır."
}

# ------------------------------------------------------------------------------
# Süreçleri Durdurma
# ------------------------------------------------------------------------------
stop_services() {
  local be_pid=$(get_pid_by_port 8080)
  local fe_pid=$(get_pid_by_port 3000)

  if [ -n "$be_pid" ]; then
    log_info "Backend (Port 8080, PID: $be_pid) durduruluyor..."
    kill_pid "$be_pid"
  fi

  if [ -n "$fe_pid" ]; then
    log_info "Frontend (Port 3000, PID: $fe_pid) durduruluyor..."
    kill_pid "$fe_pid"
  fi

  # PID dosyalarını temizle
  rm -f "$LOGS_DIR/backend.pid" "$LOGS_DIR/frontend.pid"
}

stop_all() {
  stop_services
  log_info "Docker konteynerleri durduruluyor..."
  (cd "$BACKEND_DIR" && docker compose stop >/dev/null 2>&1) || true
  log_success "FMS projesi tamamen durduruldu."
}

# ------------------------------------------------------------------------------
# Durum Gösterimi
# ------------------------------------------------------------------------------
show_status() {
  echo -e "\n${BOLD}=== FMS SERVİS DURUMLARI ===${NC}"
  
  local be_pid=$(get_pid_by_port 8080)
  local fe_pid=$(get_pid_by_port 3000)

  if [ -n "$be_pid" ]; then
    echo -e "Backend (Port 8080):  ${GREEN}ÇALIŞIYOR (PID: $be_pid)${NC}"
  else
    echo -e "Backend (Port 8080):  ${RED}KAPALI${NC}"
  fi

  if [ -n "$fe_pid" ]; then
    echo -e "Frontend (Port 3000): ${GREEN}ÇALIŞIYOR (PID: $fe_pid)${NC}"
  else
    echo -e "Frontend (Port 3000): ${RED}KAPALI${NC}"
  fi

  echo -e "\n${BOLD}Docker Konteynerleri:${NC}"
  (cd "$BACKEND_DIR" && docker compose ps 2>/dev/null || echo "Docker çalışmıyor.")
  echo ""
}

# ------------------------------------------------------------------------------
# Başlatma (Start / Restart)
# ------------------------------------------------------------------------------
start_or_restart() {
  local be_pid=$(get_pid_by_port 8080)
  local fe_pid=$(get_pid_by_port 3000)

  if [ -n "$be_pid" ] || [ -n "$fe_pid" ]; then
    echo -e "${YELLOW}${BOLD}>> FMS projesi zaten çalışıyor (Port 8080/3000 aktif). Yeniden başlatılıyor (RESTART)...${NC}\n"
    stop_services
    sleep 2
  else
    echo -e "${CYAN}${BOLD}>> FMS projesi başlatılıyor...${NC}\n"
  fi

  # 1. Ortam ve Docker Hazırlığı
  setup_java_env
  ensure_docker

  # 2. Backend Başlatma
  log_info "Spring Boot Backend başlatılıyor (Port 8080)..."
  (
    cd "$BACKEND_DIR"
    nohup mvn spring-boot:run > "$LOGS_DIR/backend.log" 2>&1 &
    echo $! > "$LOGS_DIR/backend.pid"
  )

  echo -n "   Backend sağlık kontrolü bekleniyor "
  local be_up=0
  for i in {1..45}; do
    if curl -s http://localhost:8080/actuator/health 2>/dev/null | grep -q '"status":"UP"'; then
      be_up=1
      break
    fi
    echo -n "."
    sleep 2
  done
  echo ""

  if [ $be_up -eq 1 ]; then
    log_success "Backend başarıyla ayağa kalktı (http://localhost:8080)."
  else
    log_error "Backend beklenen sürede yanıt vermedi! Hata için: tail -n 50 logs/backend.log"
  fi

  # 3. Frontend Başlatma
  log_info "Next.js Frontend başlatılıyor (Port 3000)..."
  (
    cd "$FRONTEND_DIR"
    nohup npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &
    echo $! > "$LOGS_DIR/frontend.pid"
  )

  echo -n "   Frontend hazır olması bekleniyor "
  local fe_up=0
  for i in {1..30}; do
    if curl -s -I http://localhost:3000 2>/dev/null | grep -q -E "HTTP/.* (200|304|307|308)"; then
      fe_up=1
      break
    fi
    echo -n "."
    sleep 2
  done
  echo ""

  if [ $fe_up -eq 1 ]; then
    log_success "Frontend başarıyla ayağa kalktı (http://localhost:3000)."
  else
    log_warn "Frontend portu açıldı, render işlemi devam ediyor olabilir."
  fi

  # 4. Bilgilendirme Kartı
  echo -e "\n${GREEN}${BOLD}================================================================${NC}"
  echo -e "${GREEN}${BOLD}           🚀 FMS PROJESİ BAŞARIYLA ÇALIŞTIRILDI                ${NC}"
  echo -e "${GREEN}${BOLD}================================================================${NC}"
  echo -e "  🌐 ${BOLD}Frontend Web:${NC}       http://localhost:3000"
  echo -e "  🔌 ${BOLD}Backend REST API:${NC}   http://localhost:8080"
  echo -e "  📚 ${BOLD}Swagger Dokümantasyon:${NC} http://localhost:8080/swagger-ui.html"
  echo -e "  📊 ${BOLD}MinIO Console:${NC}      http://localhost:9001 (minioadmin / minioadmin)"
  echo -e "  🐰 ${BOLD}RabbitMQ:${NC}           http://localhost:15672 (guest / guest)"
  echo -e "----------------------------------------------------------------"
  echo -e "  🔑 ${BOLD}Varsayılan Giriş:${NC}    admin@hukukofisi.com / Admin123!"
  echo -e "  📁 ${BOLD}Log Dosyaları:${NC}       logs/backend.log & logs/frontend.log"
  echo -e "  ⏹️  ${BOLD}Durdurmak İçin:${NC}     ./run.sh stop"
  echo -e "${GREEN}${BOLD}================================================================${NC}\n"
}

# ------------------------------------------------------------------------------
# CLI Argüman Yönlendirici
# ------------------------------------------------------------------------------
ACTION=${1:-"start"}

case "$ACTION" in
  start|restart)
    start_or_restart
    ;;
  stop)
    stop_all
    ;;
  status)
    show_status
    ;;
  logs)
    TARGET=${2:-"all"}
    if [ "$TARGET" = "backend" ]; then
      tail -f "$LOGS_DIR/backend.log"
    elif [ "$TARGET" = "frontend" ]; then
      tail -f "$LOGS_DIR/frontend.log"
    else
      echo "Log takibi için: ./run.sh logs backend VEYA ./run.sh logs frontend"
    fi
    ;;
  *)
    echo "Kullanım: ./run.sh [start|restart|stop|status|logs]"
    exit 1
    ;;
esac
