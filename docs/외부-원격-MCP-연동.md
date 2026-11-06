# 외부 연동 — 원격 MCP 안내 (stage)

대상: 월렛 **바깥**에서 AI·봇·백엔드를 만들고, 공개 원격 MCP로 에이전트 결제 흐름을 붙이는 팀.

- 스킬(절차): https://github.com/hyunkicho/stable-wallet-skill  
- 원문: https://raw.githubusercontent.com/hyunkicho/stable-wallet-skill/main/SKILL.md  
- MCP: `https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp`  
- 브라우저 스모크: https://stable-wallet-mcp.indecisive-fold.workers.dev/test  
- 환경: **stage 데모**. 키(`kbw_`)는 월렛/관리자에서 발급.

## 1. 한 줄 요약

| 할 일 | 비고 |
|---|---|
| 워크스페이스/IDE에 MCP URL을 **한 번** 연결 | 인증: **No authentication** (OAuth 아님) |
| 유저(또는 테스트) `kbw_`는 도구 인자 `apiKey`로 전달 | 채팅에 장기간 방치·로그 적재 금지(데모 예외) |
| 절차는 스킬 강제 순서 | `wallet_me` → (필요 시) `wallet_kya_request` → … → `wallet_pay` |
| stage API를 에이전트 샌드박스에서 직접 치지 말 것 | 일부 LLM 런타임은 `*.vercel.app` **DNS 실패**. MCP(Cloudflare)를 경유 |

스킬 문서만 읽히고 MCP가 연결되지 않으면 도구가 없습니다. **스킬 ≠ 자동 설치.**

## 2. 아키텍처 (외부 서비스 기준)

```
[외부 앱 / 내부 LLM / ChatGPT·Cursor]
        │  MCP tools/call (apiKey=kbw_… 또는 귀사 세션→키 조회)
        ▼
[원격 MCP · Cloudflare Workers]  ← 귀사가 호스팅할 필요 없음
        │  Bearer kbw_ → stage /agent/*
        ▼
[KB Stable Wallet API · stage]
        │
        ▼
[회원 지갑 앱]  KYA(한도 승인) · 잔액 · 가맹점 결제 원장
```

권장 제품 형태 (키 복붙 최소화):

1. **데모**: 테스트 `kbw_` + MCP + 스킬.  
2. **연동**: 외부 BFF가 키/세션을 보관 → 봇은 외부 API만 호출 → BFF가 MCP 또는 HTTP로 월렛 호출.  
3. **WebView 지갑 진입**: 파트너 시크릿으로 `POST /partner/launch-tokens` → `/?launch=kbl_...` (일회·5분). 채팅에 raw 회원 식별자 비노출.

## 3. MCP 연결 체크리스트

### 3.1 ChatGPT (Plugins / custom MCP)

1. Add custom MCP server  
2. URL: `https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp`  
3. Auth: **No authentication**  
4. 도구 목록에 `wallet_me` 등이 보이면 성공  
5. 대화에서 스킬 원문 + (데모) 키 → 모델이 `apiKey`로 도구 호출

OAuth discovery 오류가 나면 No auth인지, URL 끝 `/mcp`인지 확인.

### 3.2 Cursor / Claude Code 등 (Bearer 지원 시)

Streamable HTTP MCP URL 동일. 헤더 `Authorization: Bearer kbw_...`를 쓰면 도구 인자 `apiKey` 생략 가능.

예시(개념):

```json
{
  "mcpServers": {
    "stable-wallet": {
      "url": "https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp"
    }
  }
}
```

(클라이언트별 스키마는 제품 문서 따름. 키는 env/헤더로.)

### 3.3 브라우저로 동작만 확인

https://stable-wallet-mcp.indecisive-fold.workers.dev/test  
키 입력 → `wallet_me` / `wallet_kya_request` 등.

## 4. 도구 ↔ 의미

| 도구 | 의미 | 비고 |
|---|---|---|
| `wallet_me` | 회원·`kyaStatus`·한도 | **항상 첫 호출** |
| `wallet_kya_request` | 회원에게 한도 승인 요청 | 주소 KYT 아님. 미승인 시 1회 후 안내하고 멈춤 |
| `wallet_balances` | 잔액 | |
| `wallet_merchants` | 가맹점 | |
| `wallet_products` | 품목 | `merchantId` |
| `wallet_pay` | 한도 안 결제 | `idempotencyKey` = 결제마다 uuid |

**KYA** = Know Your Agent(회원 승인). 수신 지갑·체인·코인 송금 UX 금지.

## 5. 외부에서 “서비스”를 만들 때 권장 순서

1. `/test`로 MCP→API 경로 확인  
2. IDE/ChatGPT에 MCP 등록, `wallet_me` 수동 1회  
3. 스킬 강제 순서대로 스크립트 또는 에이전트 프롬프트 고정  
4. 제품 코드에서는 **BFF**가 `kbw_`/세션을 들고 MCP `tools/call` 또는 (서버 사이드만) HTTP 호출  
5. 유저 앱에서는 “에이전트 허용·한도 승인”만 노출 (지갑 플로우)

서버 사이드 HTTP (MCP 없이, **귀사 서버에서만** — LLM 샌드박스 말고):

```http
GET https://kb-stable-wallet-api-stage.vercel.app/agent/me
Authorization: Bearer kbw_...
```

LLM 샌드박스 DNS가 막히면 이 URL은 실패하는 것이 정상입니다. 그때는 MCP 필수.

## 6. 장애 구분

| 증상 | 의미 |
|---|---|
| 도구 목록 없음 | MCP 미연결 |
| `vercel.app` NameResolutionError | 샌드박스 DNS. MCP 사용 |
| MCP 401/키 오류 메시지 | `apiKey`/`Bearer` 누락·잘못된 키 |
| `kyaStatus` ≠ approved | 회원 지갑에서 한도 승인 전 |
| `/test`는 되는데 채팅만 실패 | 채팅 쪽에 MCP 미등록 또는 DNS |

## 7. 보안·운영

- 워크스페이스 **공용 MCP 1회 연결** (개인마다 채팅 설정에 의존하지 않기)  
- 생산 경로에서 채팅으로 raw `kbw_` 전달 지양 → BFF/단기 세션  
- 키·응답 로그 마스킹  
- stage 키와 live 키 분리 (live는 별도 협의)

## 8. 제공 / 외부 팀

| 제공 (월렛 측) | 외부 팀 |
|---|---|
| 공개 스킬·원격 MCP·`/test` | MCP를 개발·데모 환경에 연결 |
| stage 키 발급 경로(지갑/관리자) | 봇·앱 UX, BFF, 키/세션 보관 |
| 이 문서·절차 | 강제 순서·금지사항 준수 |

문의 시: 사용한 클라이언트, MCP 연결 여부, `/test` 결과, (키 제외) 오류 원문.
