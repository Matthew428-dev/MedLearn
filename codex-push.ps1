<# codex-push.ps1  –  commit & push all changes
   Usage:
       powershell -ExecutionPolicy Bypass -File codex-push.ps1          # push to main
       powershell -ExecutionPolicy Bypass -File codex-push.ps1 dev      # push to dev
#>

param(
  [string]$Branch = 'main'
)

Write-Host ''
Write-Host '=== Codex Push Script ==='

# ----- load .env -------------------------------------------------------------
if (Test-Path '.env') {
  Write-Host 'Loading .env ...'
  Get-Content '.env' | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
      [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
    }
  }
  if ($env:GH_TOKEN) { Write-Host 'GH_TOKEN found' } else { Write-Warning 'GH_TOKEN missing' }
} else {
  Write-Warning '.env not found – GH_TOKEN may be missing'
}

# ----- set commit identity ---------------------------------------------------
git config user.name  'Codex'  | Out-Null
git config user.email 'Matthew428-dev@users.noreply.github.com' | Out-Null

# ----- stage everything ------------------------------------------------------
Write-Host 'Staging all changes ...'
git add .

# ----- commit if needed ------------------------------------------------------
if (-not (git diff --cached --quiet)) {
  $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  git commit -m "feat: automated Codex update $stamp"
  Write-Host 'Commit created'
} else {
  Write-Host 'Nothing to commit'
  Write-Host '=== Done ==='
  Write-Host ''
  exit
}

# ----- push ------------------------------------------------------------------
Write-Host "Pushing to $Branch ..."
git push origin $Branch

Write-Host '=== Done ==='
Write-Host ''
