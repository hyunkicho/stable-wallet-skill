#!/usr/bin/env bash
# GitHub Actions ↔ stage API 중계용 서비스 시크릿 1개를 맞춘다.
# 1) openssl rand -hex 32 로 값을 만들거나 인자로 넘긴다
# 2) 이 스크립트가 GitHub repo secret AGENT_RELAY_SECRET 에 올린다
# 3) 같은 값을 Vercel API 프로젝트 env AGENT_RELAY_SECRET 에도 넣어야 한다
set -euo pipefail

REPO="${GITHUB_REPO:-hyunkicho/stable-wallet-skill}"
SECRET="${1:-}"

if [[ -z "$SECRET" ]]; then
  SECRET="$(openssl rand -hex 32)"
  echo "generated new AGENT_RELAY_SECRET"
fi

printf '%s' "$SECRET" | gh secret set AGENT_RELAY_SECRET --repo "$REPO"
echo "set GitHub secret AGENT_RELAY_SECRET on $REPO"
echo
echo "Also set the SAME value on Vercel project kb-stable-wallet-api:"
echo "  vercel env add AGENT_RELAY_SECRET production"
echo "  vercel env add AGENT_RELAY_SECRET preview"
echo
echo "Save this value somewhere safe (shown once if generated):"
echo "$SECRET"
