# stable-wallet

공개 에이전트 스킬. 핸드오프는 **스킬 + API 키**만.

```text
스킬: https://github.com/hyunkicho/stable-wallet-skill
(원문: https://raw.githubusercontent.com/hyunkicho/stable-wallet-skill/main/SKILL.md)
API 키: kbw_...
```

절차·금지사항은 `SKILL.md`가 진실 공급원이다.  
KYA = 회원 한도 승인 요청 (상대 지갑 주소 검사가 아님).

## MCP vs HTTP

| | MCP | HTTP |
|---|---|---|
| 무엇인가 | Cloudflare Workers가 도구 API를 대신 호출 | 에이전트가 stage `/agent/*`를 직접 호출 |
| 언제 | Cursor/Claude 등 MCP 클라이언트가 있을 때 | Gemini·ChatGPT처럼 MCP 등록이 없거나 안 될 때 |
| 유저 설정 | 클라이언트에 MCP URL 연결(제품마다 다름) | 보통 불필요 (런타임이 HTTPS 가능해야 함) |
| 한계 | ChatGPT 등은 계정마다 MCP 등록 필요할 수 있음 | 일부 샌드박스는 DNS로 API 호스트가 막힘 |

스킬은 **MCP 우선, 없으면 HTTP** 둘 다 적는다.

## 원격 MCP (운영)

`mcp-remote/` — Worker만 API base를 안다.
