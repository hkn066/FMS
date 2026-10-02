# FMS — GitHub private repo setup
# Usage: .\scripts\setup-github.ps1
# Requires: GitHub CLI (gh) authenticated, or create repos manually first.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "FMS-BE"
$Frontend = Join-Path $Root "FMS-FE"
$GhUser = "hkn066"

function Test-Gh {
    return [bool](Get-Command gh -ErrorAction SilentlyContinue)
}

function Ensure-Repo {
    param(
        [string]$Name,
        [string]$Description,
        [string]$Path
    )

    Push-Location $Path
    try {
        if (Test-Gh) {
            $exists = gh repo view "$GhUser/$Name" 2>$null
            if (-not $exists) {
                Write-Host "Creating private repo $GhUser/$Name ..."
                gh repo create "$GhUser/$Name" --private --source=. --remote=origin --description=$Description
            } else {
                Write-Host "Repo $GhUser/$Name already exists."
                git remote get-url origin 2>$null | Out-Null
                if ($LASTEXITCODE -ne 0) {
                    git remote add origin "https://github.com/$GhUser/$Name.git"
                }
            }
        } else {
            Write-Host "gh CLI not found. Create private repo manually:"
            Write-Host "  https://github.com/new?name=$Name"
            git remote get-url origin 2>$null | Out-Null
            if ($LASTEXITCODE -ne 0) {
                git remote add origin "https://github.com/$GhUser/$Name.git"
            }
        }

        Write-Host "Pushing $Name to origin/main ..."
        git push -u origin main
    } finally {
        Pop-Location
    }
}

Write-Host "=== FMS GitHub Setup ===" -ForegroundColor Cyan

if (-not (Test-Gh)) {
    Write-Host ""
    Write-Host "GitHub CLI (gh) is not installed." -ForegroundColor Yellow
    Write-Host "Option A: Install gh (admin PowerShell): winget install GitHub.cli"
    Write-Host "Option B: Create repos manually at https://github.com/new (Private, no README)"
    Write-Host "  - $GhUser/FMS-BE"
    Write-Host "  - $GhUser/FMS-FE"
    Write-Host ""
}

Ensure-Repo -Name "FMS-BE" -Description "FMS — Law Office Management Backend (Spring Boot)" -Path $Backend
Ensure-Repo -Name "FMS-FE" -Description "FMS — Law Office Management Frontend (Next.js)" -Path $Frontend

Write-Host ""
Write-Host "Done." -ForegroundColor Green
