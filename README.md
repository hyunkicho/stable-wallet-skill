# stable-wallet

스킬 + **Cloudflare Workers 원격 MCP** (무료).

## 운영자가 에이전트에 주는 것

```text
스킬: https://github.com/hyunkicho/stable-wallet-skill
MCP: https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp
API 키: kbw_...
```

MCP 연결 시 `Authorization: Bearer kbw_...` 헤더를 붙입니다.

## 원격 MCP

경로: `mcp-remote/`

```bash
cd mcp-remote && npm install && npx wrangler deploy
```

현재 배포: `https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp`  
(임시 Cloudflare 계정으로 올렸으면 대시보드 claim 후 영구화. claim 전 URL은 60분 후 삭제될 수 있음.)

Worker는 `Authorization`의 `kbw_` 키로 stage API `/agent/*`를 호출합니다.  
환경변수 `KB_WALLET_API_BASE` 기본값: `https://kb-stable-wallet-api-stage.vercel.app`

## 로컬 stdio MCP (선택)

`mcp/` — Cursor 로컬용. PC가 켜져 있을 때만.

## GitHub Actions 이슈 중계

쓰지 않습니다. (UX·보안상 폐기)

## 에이전트 요약

1. `wallet_me` → `kyaStatus`
2. 미승인이면 `wallet_kya_request` 한 번 → 회원 승인 안내
3. 승인 후 한도 안 `wallet_pay`
4. topup / owner auth 금지
