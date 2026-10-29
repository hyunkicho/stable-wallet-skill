# stable-wallet

스킬 + **Cloudflare Workers 원격 MCP** (무료).

## 운영자가 에이전트에 주는 것

```text
스킬: https://github.com/hyunkicho/stable-wallet-skill
MCP: https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp
API 키: kbw_...
```

MCP 연결 시 `Authorization: Bearer kbw_...` 헤더를 붙입니다.  
에이전트에게 stage API URL은 주지 않습니다. Worker가 대신 호출합니다.

## 원격 MCP (운영)

경로: `mcp-remote/`

```bash
cd mcp-remote && npm install && npx wrangler deploy
```

배포 URL: `https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp`  
Cloudflare 계정: **Indecisive Fold**  
API base는 `wrangler.jsonc`의 `KB_WALLET_API_BASE` (에이전트 핸드오프에 넣지 않음).

## 에이전트 요약

1. `wallet_me` → `kyaStatus`
2. 미승인이면 `wallet_kya_request` 한 번 → 회원 승인 안내
3. 승인 후 한도 안 `wallet_pay`
4. topup / owner auth / API 직접 호출 금지
