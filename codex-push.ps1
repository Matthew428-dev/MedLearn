<#  codex-push.ps1
    Automates git add / commit / push for Codex
    Usage:
        powershell -ExecutionPolicy Bypass -File codex-push.ps1             # pushes to main
        powershell -ExecutionPolicy Bypass -File codex-push.ps1 dev-branch  # pushes to dev-branch
#>

param(
  [string]$Branch = "main"
)

Write-Host "`n=== Codex Push Script ==="

# ----- load .env -------------------------------------------------------------
if (Test-Path ".env") {
  Write-Host "Loading .env ..."
  Get-Content ".env" | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]*)\s*=\s*(.*)$") {
      [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], "Process")
    }
  }
  Write-Host ("GH_TOKEN present? {0}" -f ($env:GH_TOKEN -ne $null))
} else {
  Write-Warning ".env not found – GH_TOKEN may be missing"
}

# ----- set commit identity ---------------------------------------------------
git config user.name  "Codex"                                | Out-Null
git config user.email "Matthew428-dev@users.noreply.github.com" | Out-Null

# ----- stage everything ------------------------------------------------------
Write-Host "Staging all changes ..."
git add .

# ----- commit if something is staged ----------------------------------------
Write-Host "Creating commit (if needed) ..."
if (-not (git diff --cached --quiet)) {
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  git commit -m "feat: automated Codex update $timestamp"
} else {
  Write-Host "Nothing to commit"
}

# ----- push ------------------------------------------------------------------
Write-Host "Pushing to $Branch ..."
git push origin $Branch

Write-Host "=== Done ===`n"
