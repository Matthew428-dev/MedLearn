#!/usr/bin/env bash
# codex-push.sh  –  stage, commit, and push everything
# usage:  ./codex-push.sh            # push to main
#         ./codex-push.sh dev-branch # push to dev-branch

set -e

BRANCH="${1:-main}"

echo -e "\n=== Codex Push Script (bash) ==="

# --- load .env into current shell (if GH_TOKEN not already set) -------------
if [ -z "$GH_TOKEN" ] && [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo ".env loaded"
fi
[ -z "$GH_TOKEN" ] && echo "⚠️  GH_TOKEN missing" || echo "GH_TOKEN present"

# --- make sure Git has an identity ------------------------------------------
git config user.name  "Codex"
git config user.email "Matthew428-dev@users.noreply.github.com"

# --- stage everything --------------------------------------------------------
echo "Staging all changes …"
git add -A

# --- commit if needed --------------------------------------------------------
if ! git diff --cached --quiet; then
  stamp=$(date '+%Y-%m-%d %H:%M:%S')
  git commit -m "feat: automated Codex update $stamp"
  echo "Commit created"
else
  echo "Nothing to commit"
  echo "=== Done ==="
  exit 0
fi

# --- push --------------------------------------------------------------------
echo "Pushing to $BRANCH …"
git push origin "$BRANCH"
echo "=== Done ==="
