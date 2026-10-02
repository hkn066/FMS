# FMS — Push all repositories to GitHub
# Usage: .\scripts\push-all.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "FMS-BE"
$Frontend = Join-Path $Root "FMS-FE"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  FMS - GitHub Repolarına Push Başlatılıyor" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. FMS-BE Push
Write-Host "[1/3] FMS-BE (Backend) push ediliyor..." -ForegroundColor Yellow
Push-Location $Backend
try {
    git push -u origin main
    Write-Host "FMS-BE basariyla gonderildi." -ForegroundColor Green
} catch {
    Write-Host "FMS-BE push sirasinda hata olustu: $_" -ForegroundColor Red
} finally {
    Pop-Location
}
Write-Host ""

# 2. FMS-FE Push
Write-Host "[2/3] FMS-FE (Frontend) push ediliyor..." -ForegroundColor Yellow
Push-Location $Frontend
try {
    git push -u origin main
    Write-Host "FMS-FE basariyla gonderildi." -ForegroundColor Green
} catch {
    Write-Host "FMS-FE push sirasinda hata olustu: $_" -ForegroundColor Red
} finally {
    Pop-Location
}
Write-Host ""

# 3. FMS (Ana Repo) Push
Write-Host "[3/3] FMS (Ana Repo) push ediliyor..." -ForegroundColor Yellow
Push-Location $Root
try {
    git push -u origin main
    Write-Host "FMS Ana Repo basariyla gonderildi." -ForegroundColor Green
} catch {
    Write-Host "FMS Ana Repo push sirasinda hata olustu: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Islem tamamlandi!" -ForegroundColor Cyan
