# stable-wallet

공개 에이전트 스킬. 핸드오프는 **스킬 + API 키**만.

```text
스킬: https://github.com/hyunkicho/stable-wallet-skill
(원문: https://raw.githubusercontent.com/hyunkicho/stable-wallet-skill/main/SKILL.md)
API 키: kbw_...
```

절차·금지사항은 `SKILL.md`가 진실 공급원이다.  
KYA = 회원 한도 승인 요청 (상대 지갑 주소 검사가 아님).

## ChatGPT MCP

1. Plugins → Add custom MCP server  
2. URL: `https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp`  
3. 인증: **No authentication** (OAuth 아님)  
4. 대화의 `kbw_` 키는 도구 인자 `apiKey`로 넘김

## MCP vs HTTP

| | MCP | HTTP |
|---|---|---|
| 무엇인가 | Cloudflare Workers가 도구 API를 대신 호출 | 에이전트가 stage `/agent/*`를 직접 호출 |
| 연결 인증 | 무인증 (키는 도구/헤더) | Bearer 키 |
| 언제 | ChatGPT·Cursor 등 MCP 클라이언트 | MCP 없이 HTTPS만 될 때 |

스킬은 **MCP 우선, 없으면 HTTP** 둘 다 적는다.

## 원격 MCP (운영)

`mcp-remote/` — Worker만 API base를 안다. Cloudflare 계정 **Indecisive Fold**.
