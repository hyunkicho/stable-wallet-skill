#!/usr/bin/env bash
# 키를 로컬 맵에 넣고 GitHub Actions secret WALLET_AGENT_KEYS 로 올린다.
# 사용: ./scripts/register-agent-key.sh <keyId> <kbw_...>
# 예:   ./scripts/register-agent-key.sh U89A02FE65F9C-1 'kbw_xxx'
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STORE="${ROOT}/.agent-keys.local.json"
REPO="${GITHUB_REPO:-hyunkicho/stable-wallet-skill}"

KEY_ID="${1:-}"
API_KEY="${2:-}"

if [[ -z "$KEY_ID" || -z "$API_KEY" ]]; then
  echo "usage: $0 <keyId> <kbw_...>" >&2
  exit 1
fi
if [[ ! "$API_KEY" =~ ^kbw_ ]]; then
  echo "api key must start with kbw_" >&2
  exit 1
fi

python3 - "$STORE" "$KEY_ID" "$API_KEY" <<'PY'
import json, sys
path, key_id, api_key = sys.argv[1], sys.argv[2], sys.argv[3]
try:
    data = json.load(open(path))
except FileNotFoundError:
    data = {}
except Exception:
    data = {}
if not isinstance(data, dict):
    data = {}
data[key_id] = api_key
json.dump(data, open(path, "w"), indent=2, ensure_ascii=False)
print(f"local map -> {path} ({len(data)} keys)")
PY

gh secret set WALLET_AGENT_KEYS --repo "$REPO" < "$STORE"
echo "uploaded secret WALLET_AGENT_KEYS to $REPO"
echo "agent issue body example:"
echo "{\"action\":\"me\",\"keyId\":\"$KEY_ID\"}"
