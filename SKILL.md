---
name: stable-wallet
description: >
  운영자가 준 API 키와 원격 MCP로 스테이블코인 지갑 잔액을 보고,
  회원이 승인한 한도 안에서 가맹점 결제를 한다.
  MCP 도구(wallet_me, wallet_kya_request 등)가 있으면 그걸 우선한다.
  키 발급·출금·관리자·에이전트 직접 충전에는 쓰지 않는다.
---

# 스테이블 월렛

운영자가 준 **원격 MCP**와 **API 키**로 진행해 주세요. 키는 답장에 다시 쓰지 말아 주세요.

## MCP (우선)

- URL: `https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp`
- 헤더: `Authorization: Bearer <대화에 있는 kbw_ 키>`
- Cloudflare Workers 무료 원격 MCP. DNS가 막힌 런타임도 여기로 도구를 호출한다.
- 도구: `wallet_me` → (미승인이면) `wallet_kya_request` → 승인 후 `wallet_balances` / `wallet_merchants` / `wallet_products` / `wallet_pay`
- `topup` / `owner auth` 도구는 없습니다. GitHub 이슈 중계는 쓰지 마세요.

## MCP가 없을 때만 HTTP

```text
GET  https://kb-stable-wallet-api-stage.vercel.app/agent/me
POST https://kb-stable-wallet-api-stage.vercel.app/agent/kya/request
GET  https://kb-stable-wallet-api-stage.vercel.app/agent/balances
GET  https://kb-stable-wallet-api-stage.vercel.app/agent/merchants
GET  https://kb-stable-wallet-api-stage.vercel.app/agent/merchants/{id}/products
POST https://kb-stable-wallet-api-stage.vercel.app/agent/payments
```

`Authorization: Bearer <키>`

## 가장 중요 — 승인(인증) 요청

- 아직 승인이 없으면 결제 전에 `wallet_kya_request` / `POST /agent/kya/request`를 한 번 보내 주세요.
- “인증 요청”, “승인 요청”, “KYA”는 같은 호출입니다.

## 순서

1. `wallet_me` / `GET /agent/me`로 `kyaStatus`, `paymentLimitKrw`, `spentKrw` 확인
2. `approved`가 아니면 KYA 요청 한 번 → 회원에게 지갑 승인 안내 후 멈춤
3. 승인 뒤 잔액·가맹점·품목 선택. `topup` / 주인 인증 금지
4. 한도 안이면 `wallet_pay` / `POST /agent/payments`. `idempotencyKey`는 결제마다 uuid. 오류 시 같은 값 재시도
5. `status`가 `paid`일 때만 완료. `collectionAddress`로 온체인 재전송 금지

## 하지 않는 일

키 발급, 출금, 관리자, 회원 이체, 가맹점 QR, 에이전트 직접 충전, GitHub 이슈 중계.
