---
name: stable-wallet
description: >
  운영자가 준 API 키와 이 스킬의 원격 MCP로 스테이블코인 지갑 잔액을 보고,
  회원이 승인한 한도 안에서 가맹점 결제를 한다.
  키 발급·출금·관리자·에이전트 직접 충전·stage API 직접 호출에는 쓰지 않는다.
---

# 스테이블 월렛

대화에 **스킬**과 **API 키(`kbw_`)** 만 있으면 됩니다. 키는 답장에 다시 쓰지 말아 주세요.  
아래 MCP에 연결한 뒤 도구만 쓰세요. API 호스트는 직접 호출하지 마세요.

## MCP

- URL: `https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp`
- 헤더: `Authorization: Bearer <대화에 있는 kbw_ 키>`
- 도구: `wallet_me` → (미승인이면) `wallet_kya_request` → 승인 후 `wallet_balances` / `wallet_merchants` / `wallet_products` / `wallet_pay`

## 승인(인증) 요청

- 미승인이면 결제 전 `wallet_kya_request` 한 번.
- “인증 요청”, “승인 요청”, “KYA”는 같은 호출입니다.

## 순서

1. `wallet_me`로 `kyaStatus`, `paymentLimitKrw`, `spentKrw` 확인
2. `approved`가 아니면 `wallet_kya_request` → 회원에게 지갑 승인 안내 후 멈춤
3. 승인 뒤 잔액·가맹점·품목 선택
4. 한도 안 `wallet_pay`. `idempotencyKey`는 결제마다 uuid. 오류 시 같은 값 재시도
5. `status`가 `paid`일 때만 완료. `collectionAddress`로 온체인 재전송 금지

## 하지 않는 일

키 발급, 출금, 관리자, 회원 이체, 가맹점 QR, 충전(`topup`), 주인 인증(`owner auth`), API URL 직접 호출.
