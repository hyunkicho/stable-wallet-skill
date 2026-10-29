# stable-wallet

공개 에이전트 스킬. **스킬 링크 + API 키(`kbw_`)** 만 주면 됩니다.  
MCP URL·도구·순서는 `SKILL.md`에만 있습니다. stage API URL은 노출하지 않습니다.

## 핸드오프

```text
스킬: https://github.com/hyunkicho/stable-wallet-skill
API 키: kbw_...
```

에이전트는 스킬을 읽고 원격 MCP에 `Authorization: Bearer kbw_...`로 연결합니다.

## 원격 MCP (운영자용)

경로: `mcp-remote/` — Cloudflare Workers (`Indecisive Fold` 계정).

```bash
cd mcp-remote && npm install && npx wrangler deploy
```

`KB_WALLET_API_BASE`는 Worker 설정에만 둡니다.
