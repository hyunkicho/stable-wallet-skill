---
name: stable-wallet
description: >
  운영자가 준 API 키로 스테이블코인 지갑의 잔액을 보고, 회원이 승인한 한도 안에서 등록된 가맹점 품목을 결제한다.
  사용자가 지갑, 잔액, 충전, 결제, 가맹점, 스테이블코인, API 키, KYA, 승인 요청, 인증 요청을 말하면 이 스킬을 쓴다.
  키가 대화에 있으면 HTTP·MCP·GitHub Actions 중계 중 되는 경로로 호출한다.
  키 발급, 출금, 관리자, QR 결제, 회원 이체, 에이전트 직접 충전에는 쓰지 않는다.
---

# 스테이블 월렛

운영자가 API 키와 이 스킬만 준 경우, 아래 순서 중 **되는 경로**로 호출해 주세요. 키는 답장에 다시 쓰지 말아 주세요.

## 경로 선택

1. **MCP(로컬 Cursor)** — 이 레포 `mcp/` 서버가 연결되어 있으면 `wallet_me`, `wallet_kya_request` 도구를 쓰세요. HTTP DNS가 필요 없습니다.
2. **GitHub Actions 중계** — 일반 HTTPS DNS가 실패하면(`NameResolutionError`) 이 레포에 이슈를 열어 중계하세요. 제목은 `[agent]`로 시작.
3. **직접 HTTP** — 네트워크가 되는 런타임만. 전체 URL을 그대로 쓰세요.

## GitHub Actions 중계 (DNS 막힌 샌드박스)

이 레포(`hyunkicho/stable-wallet-skill`)에 이슈를 만드세요.

- 제목: `[agent] me` (또는 `[agent] kya` 등)
- 본문:

```json
{"action":"me","apiKey":"<대화에 있는 키>"}
```

`action`은 `me` | `kya` | `balances` | `merchants` 입니다.  
워크플로가 stage API를 호출한 뒤 **이슈 댓글**에 JSON 결과를 남깁니다. 본문의 키는 `kbw_***`로 지웁니다.  
댓글의 `kyaStatus`를 읽고, `approved`가 아니면 `action`을 `kya`로 이슈를 **하나 더** 연 뒤 멈추세요.

## MCP 도구 (로컬)

- `wallet_me` → 승인 상태
- `wallet_kya_request` → 주인 승인 요청 한 번
- `wallet_balances` / `wallet_merchants` / `wallet_products` / `wallet_pay`
- `topup` / `owner auth` 도구는 없습니다. 호출하지 마세요.

## 직접 HTTP (네트워크 될 때만)

```text
GET  https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/me
POST https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/kya/request
GET  https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/balances
GET  https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/merchants
POST https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/payments
```

모든 호출에 `Authorization: Bearer <키>`를 붙입니다.

## 공통 순서

1. `me`로 `kyaStatus`를 읽습니다.
2. `approved`가 아니면 `kya` 요청을 **한 번** 보내고 멈춥니다. 회원에게 지갑 → 에이전트 메뉴에서 충전·한도 승인을 안내합니다.
3. 승인 뒤 한도 안에서 가맹점 → 품목 → 결제만 진행합니다.
4. `POST /agent/topup`, `POST /agent/owner/auth`는 호출하지 않습니다.
