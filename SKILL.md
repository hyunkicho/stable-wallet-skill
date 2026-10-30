---
name: stable-wallet
description: >
  회원이 승인한 한도 안에서 등록 가맹점 품목을 결제한다.
  반드시 wallet_me → (미승인이면) wallet_kya_request 순서로 시작한다.
  상대 지갑 주소·체인·ETH/USDT 송금·KYT 주소 검사를 묻거나 하지 않는다.
  키 발급·출금·관리자·에이전트 직접 충전에는 쓰지 않는다.
---

# 스테이블 월렛

대화에 **스킬**과 **API 키(`kbw_`)** 가 있으면 아래만 따른다.  
키는 답장에 다시 쓰지 말 것. 이 문서와 다른 추측(온체인 송금, 수신 주소 요청 등)은 금지.

## 이게 하는 일 / 안 하는 일

- **함**: 가맹점 목록·품목 조회 → 승인된 원화 한도 안 `wallet_pay`
- **안 함**: 수신 지갑 주소 요구, 체인/ETH/USDT 송금, “KYA=주소 위험도 검사”로 해석, topup, owner auth

**KYA** = 지갑 **주인(회원)이 에이전트 결제 한도를 승인**하는 요청이다. 상대 주소 검증이 아니다.

## 접속 (둘 중 되는 쪽)

### 1) 원격 MCP (있으면 우선)

- URL: `https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp`
- **연결 인증: 없음 (No authentication / OAuth 아님).** ChatGPT는 이 옵션으로 추가.
- 키: 도구 인자 `apiKey`에 `kbw_...` (또는 클라이언트가 `Authorization: Bearer` 지원하면 헤더)
- 도구: `wallet_me` / `wallet_kya_request` / `wallet_balances` / `wallet_merchants` / `wallet_products` / `wallet_pay`

### 2) HTTP (MCP를 못 쓰면)

베이스: `https://kb-stable-wallet-api-stage.vercel.app`  
헤더: `Authorization: Bearer <kbw_ 키>`

| 도구에 해당 | HTTP |
|---|---|
| `wallet_me` | `GET /agent/me` |
| `wallet_kya_request` | `POST /agent/kya/request` (바디 없음) |
| `wallet_balances` | `GET /agent/balances` |
| `wallet_merchants` | `GET /agent/merchants` |
| `wallet_products` | `GET /agent/merchants/{merchantId}/products` |
| `wallet_pay` | `POST /agent/payments` JSON: `merchantId`, `productId`, `quantity`, `idempotencyKey`(uuid) |

GitHub 페이지를 못 읽으면 이 raw를 읽어라:  
`https://raw.githubusercontent.com/hyunkicho/stable-wallet-skill/main/SKILL.md`

## 강제 순서 (유저가 “결제”만 말해도)

1. 즉시 `wallet_me` / `GET /agent/me` — 주소·토큰·수량을 **묻지 말 것**
2. `kyaStatus`가 `approved`가 아니면 `wallet_kya_request` / `POST /agent/kya/request` **한 번** → “지갑 앱 에이전트 메뉴에서 충전·한도 승인”만 안내하고 **멈춤**
3. 승인된 뒤에만 merchants → products → 유저 확인 → `wallet_pay`
4. `status`가 `paid`일 때만 완료. `collectionAddress`로 온체인 재전송 금지

## 하지 않는 일

키 발급, 출금, 관리자, 회원 이체, 가맹점 QR, topup, owner auth, 수신 주소/체인 질문.
