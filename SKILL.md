---
name: stable-wallet
description: >
  운영자가 준 키 번호(keyId) 또는 API 키로 스테이블코인 지갑 잔액을 보고,
  회원이 승인한 한도 안에서 등록된 가맹점 품목을 결제한다.
  사용자가 지갑, 잔액, 충전, 결제, 가맹점, 스테이블코인, API 키, KYA, 승인 요청, 인증 요청을 말하면 이 스킬을 쓴다.
  DNS가 막히면 GitHub Actions 중계(이슈+keyId)를 쓴다. 키 발급·출금·관리자·직접 충전에는 쓰지 않는다.
---

# 스테이블 월렛

키는 답장에 다시 쓰지 말아 주세요. `kbw_` 비밀키를 공개 이슈·채팅에 올리지 말아 주세요.

## 경로 선택

1. **MCP(로컬 Cursor)** — `wallet_me`, `wallet_kya_request` 도구
2. **GitHub Actions 중계** — HTTPS DNS 실패 시. 이 레포 이슈 제목 `[agent]`, 본문은 `keyId`만
3. **직접 HTTP** — 네트워크 되는 런타임만. `SKILL.md`의 전체 URL

## GitHub Actions 중계

운영자가 미리 `keyId`→비밀키를 GitHub Secret에 등록해 둡니다. 에이전트는 비밀키 없이:

- 제목: `[agent] me`
- 본문:

```json
{"action":"me","keyId":"<운영자가 준 키 번호>"}
```

`action`: `me` | `kya` | `balances` | `merchants`  
댓글 JSON의 `kyaStatus`를 읽고, `approved`가 아니면 `action`을 `kya`로 이슈를 하나 더 연 뒤 멈추세요.

## MCP 도구 (로컬)

- `wallet_me` / `wallet_kya_request` / `wallet_balances` / `wallet_merchants` / `wallet_products` / `wallet_pay`
- topup / owner auth 없음

## 직접 HTTP (네트워크 될 때만)

```text
GET  https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/me
POST https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/kya/request
GET  https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/balances
GET  https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/merchants
POST https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/payments
```

`Authorization: Bearer <kbw_ 키>`

## 공통 순서

1. `me`로 `kyaStatus` 확인
2. 미승인이면 `kya` 한 번 → 회원에게 지갑 승인 안내 후 멈춤
3. 승인 뒤 한도 안 결제만
4. topup / owner auth 금지
