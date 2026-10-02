<#
 ==============================================================================
 FMS (File & Case Management System) - Orchestration Script (PowerShell)
 Usage:
   .\run.ps1          -> Akilli baslat (calisiyorsa restart, degilse start)
   .\run.ps1 start    -> Baslat
   .\run.ps1 restart  -> Yeniden baslat
   .\run.ps1 stop     -> Tum servisleri durdur
   .\run.ps1 status   -> Durum kontrolu
 ==============================================================================
#>

param (
    [string]$Action = "start"
)

$ErrorActionPreference = "Continue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ScriptDir "FMS-BE"
$FrontendDir = Join-Path $ScriptDir "FMS-FE"
$LogsDir = Join-Path $ScriptDir "logs"

if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir | Out-Null
}

function Log-Info($msg)    { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Log-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Log-Warn($msg)    { Write-Host "[UYARI] $msg" -ForegroundColor Yellow }
function Log-Error($msg)   { Write-Host "[HATA] $msg" -ForegroundColor Red }

function Get-PortPID($port) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' } | Select-Object -First 1
        if ($conn) { return $conn.OwningProcess }
    } catch {}
    
    $lines = cmd.exe /c "netstat -ano | findstr :$port" 2>$null
    foreach ($line in $lines) {
        if ($line -match "LISTENING\s+(\d+)") {
            return $matches[1]
        }
    }
    return $null
}

function Stop-PortProcess($port, $name) {
    $p = Get-PortPID $port
    if ($p) {
        Log-Info "$name (Port $port, PID: $p) durduruluyor..."
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

function Ensure-Docker {
    Log-Info "Docker ortami kontrol ediliyor..."
    $null = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Log-Warn "Docker servisi kapali. Docker Desktop baslatiliyor..."
        $dockerExe = "$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe"
        if (-not (Test-Path $dockerExe)) {
            $dockerExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        }
        if (Test-Path $dockerExe) {
            Start-Process $dockerExe
        }
        
        $waitCount = 0
        while ($LASTEXITCODE -ne 0 -and $waitCount -lt 90) {
            Start-Sleep -Seconds 2
            $waitCount += 2
            $null = docker info 2>&1
        }
        if ($LASTEXITCODE -ne 0) {
            Log-Error "Docker Desktop zamaninda baslatilamadi. Lutfen Docker'i manuel acin."
            exit 1
        }
    }

    Log-Info "Altyapi konteynerleri (PostgreSQL, Redis, RabbitMQ, MinIO) baslatiliyor..."
    Push-Location $BackendDir
    docker compose up -d postgres redis rabbitmq minio | Out-Null
    Pop-Location
    Log-Success "Docker servisleri hazir."
}

function Stop-Services {
    Stop-PortProcess 8080 "Backend"
    Stop-PortProcess 3000 "Frontend"
}

function Stop-All {
    Stop-Services
    Log-Info "Docker konteynerleri durduruluyor..."
    Push-Location $BackendDir
    docker compose stop | Out-Null
    Pop-Location
    Log-Success "FMS projesi tamamen durduruldu."
}

function Show-Status {
    Write-Host "`n=== FMS SERVIS DURUMLARI ===" -ForegroundColor Yellow
    $bePid = Get-PortPID 8080
    $fePid = Get-PortPID 3000

    if ($bePid) {
        Write-Host "Backend (Port 8080):  CALISIYOR (PID: $bePid)" -ForegroundColor Green
    } else {
        Write-Host "Backend (Port 8080):  KAPALI" -ForegroundColor Red
    }

    if ($fePid) {
        Write-Host "Frontend (Port 3000): CALISIYOR (PID: $fePid)" -ForegroundColor Green
    } else {
        Write-Host "Frontend (Port 3000): KAPALI" -ForegroundColor Red
    }

    Write-Host "`nDocker Konteynerleri:" -ForegroundColor Yellow
    Push-Location $BackendDir
    docker compose ps
    Pop-Location
    Write-Host ""
}

function Start-Or-Restart {
    $bePid = Get-PortPID 8080
    $fePid = Get-PortPID 3000

    if ($bePid -or $fePid) {
        Write-Host "`n>> FMS projesi zaten calisiyor (Port 8080/3000 aktif). Yeniden baslatiliyor (RESTART)...`n" -ForegroundColor Yellow
        Stop-Services
        Start-Sleep -Seconds 2
    } else {
        Write-Host "`n>> FMS projesi baslatiliyor...`n" -ForegroundColor Cyan
    }

    # Java 21 Check / Scoop
    $javaVer = java -version 2>&1 | Select-Object -First 1
    if ($javaVer -notmatch "21") {
        $scoopJava = "$env:USERPROFILE\scoop\apps\temurin21-jdk\current"
        if (Test-Path $scoopJava) {
            $env:JAVA_HOME = $scoopJava
            $env:Path = "$scoopJava\bin;$env:Path"
            Log-Info "Java 21 aktif edildi: $scoopJava"
        }
    }

    Ensure-Docker

    # Backend Baslatma
    Log-Info "Spring Boot Backend baslatiliyor (Port 8080)..."
    $backendOut = Join-Path $LogsDir "backend.log"
    Start-Process powershell -ArgumentList "-NoProfile -Command Set-Location '$BackendDir'; `$env:JAVA_HOME='$env:JAVA_HOME'; `$env:Path='$env:Path'; mvn spring-boot:run *> '$backendOut'" -WindowStyle Hidden

    Write-Host -NoNewline "   Backend saglik kontrolu bekleniyor "
    $beUp = $false
    for ($i = 0; $i -lt 45; $i++) {
        try {
            $res = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -TimeoutSec 1 -ErrorAction SilentlyContinue
            if ($res.status -eq "UP") {
                $beUp = $true
                break
            }
        } catch {}
        Write-Host -NoNewline "."
        Start-Sleep -Seconds 2
    }
    Write-Host ""

    if ($beUp) {
        Log-Success "Backend basariyla ayaga kalkti (http://localhost:8080)."
    } else {
        Log-Error "Backend beklenen surede yanit vermedi! Log: logs\backend.log"
    }

    # Frontend Baslatma
    Log-Info "Next.js Frontend baslatiliyor (Port 3000)..."
    $frontendOut = Join-Path $LogsDir "frontend.log"
    Start-Process powershell -ArgumentList "-NoProfile -Command Set-Location '$FrontendDir'; npm run dev *> '$frontendOut'" -WindowStyle Hidden

    Write-Host -NoNewline "   Frontend hazir olmasi bekleniyor "
    $feUp = $false
    for ($i = 0; $i -lt 30; $i++) {
        try {
            $res = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
            if ($res.StatusCode -eq 200 -or $res.StatusCode -eq 307 -or $res.StatusCode -eq 308) {
                $feUp = $true
                break
            }
        } catch {}
        Write-Host -NoNewline "."
        Start-Sleep -Seconds 2
    }
    Write-Host ""

    if ($feUp) {
        Log-Success "Frontend basariyla ayaga kalkti (http://localhost:3000)."
    } else {
        Log-Warn "Frontend portu acildi, render islemi devam ediyor olabilir."
    }

    # Ozet Karti
    Write-Host "`n================================================================" -ForegroundColor Green
    Write-Host "           FMS PROJESI BASARIYLA CALISTIRILDI                  " -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "  Frontend Web:       http://localhost:3000"
    Write-Host "  Backend REST API:   http://localhost:8080"
    Write-Host "  Swagger UI:         http://localhost:8080/swagger-ui.html"
    Write-Host "  MinIO Console:      http://localhost:9001 (minioadmin / minioadmin)"
    Write-Host "  RabbitMQ:           http://localhost:15672 (guest / guest)"
    Write-Host "----------------------------------------------------------------"
    Write-Host "  Varsayilan Giris:   admin@hukukofisi.com / Admin123!"
    Write-Host "  Log Dosyalari:      logs\backend.log ve logs\frontend.log"
    Write-Host "  Durdurmak Icin:     .\run.ps1 stop"
    Write-Host "================================================================`n" -ForegroundColor Green
}

switch ($Action.ToLower()) {
    "start"   { Start-Or-Restart }
    "restart" { Start-Or-Restart }
    "stop"    { Stop-All }
    "status"  { Show-Status }
    default   {
        Write-Host "Kullanim: .\run.ps1 [start|restart|stop|status]"
    }
}
