# load .env for GH_TOKEN
foreach ($line in Get-Content ".env") {
  if ($line -match "^\s*([^#].*?)\s*=\s*(.*)$") {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
  }
}

# set commit identity (once per repo clone)
git config user.name  "Codex"
git config user.email "Matthew428-dev@users.noreply.github.com"

# stage every change
git add .

# commit only if something is staged
if (-not (git diff --cached --quiet)) {
  git commit -m "feat: automated Codex update"
}

# push to main
git push origin main
