---
name: stable-wallet
description: >
  운영자가 준 키 번호(keyId) 또는 API 키로 스테이블코인 지갑 잔액을 보고,
  회원이 승인한 한도 안에서 등록된 가맹점 품목을 결제한다.
  DNS가 막히면 GitHub 이슈 중계(keyId만)를 쓴다. kbw_ 비밀키를 이슈에 올리지 않는다.
---

# 스테이블 월렛

키·비밀값은 답장에 다시 쓰지 말아 주세요.

## 경로

1. **MCP(로컬)** — `wallet_me` 등 (환경변수에 `kbw_`)
2. **GitHub Actions 중계** — DNS 실패 시. 이슈에 `keyId`만
3. **직접 HTTP** — 네트워크 되는 런타임만

## GitHub Actions 중계

- 제목: `[agent] me`
- 본문 (비밀키 금지):

```json
{"action":"me","keyId":"<운영자가 준 키 번호>"}
```

`action`: `me` | `kya` | `balances` | `merchants`  
댓글 JSON을 읽고, `approved`가 아니면 `kya` 이슈를 하나 더 연 뒤 멈추세요.

## 직접 HTTP (될 때만)

```text
GET  https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/me
POST https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/kya/request
```

`Authorization: Bearer <kbw_>`

## 공통 순서

1. `me`로 승인 상태 확인
2. 미승인이면 `kya` 한 번 → 회원 지갑 승인 안내
3. 승인 뒤 한도 안 결제만
4. topup / owner auth 금지
