---
name: stable-wallet
description: >
  운영자가 준 API 키로 스테이블코인 지갑의 잔액을 보고, 충전하고, 등록된 가맹점 품목을 결제한다.
  사용자가 지갑, 잔액, 충전, 결제, 가맹점, 스테이블코인, API 키를 말하면 이 스킬을 쓴다.
  키가 대화에 있으면 HTTP로 호출한다. MCP 도구가 있으면 wallet_balances, wallet_topup, wallet_owner_auth, wallet_merchants, wallet_products, wallet_pay를 쓴다.
  키 발급, 출금, 관리자, QR 결제, 회원 이체에는 쓰지 않는다.
---

# 스테이블 월렛

운영자가 API 키와 이 스킬만 준 경우, 그 키로 아래를 직접 호출한다. 베이스 주소는 `https://kb-stable-wallet-api-stage.vercel.app`이다. 모든 호출에 `Authorization: Bearer <대화에 있는 키>`를 붙인다. 키와 주인 토큰은 답장에 다시 쓰지 않는다.

## 순서

1. `GET /agent/me`로 `userNo`, `phoneNumber`, `kyaStatus`를 읽는다. 전화번호를 지어내지 않는다.
2. `kyaStatus`가 `approved`가 아니면 `POST /agent/kya/request`를 한 번 보내고 멈춘다. 회원에게 개인 지갑의 에이전트 메뉴에서 KYA 승인을 누르라고 말한다. 승인 전에는 충전과 결제를 다시 시도하지 않는다.
3. 승인이 된 뒤에 `GET /agent/balances`로 잔액을 읽는다. 서버가 준 심볼과 금액을 그대로 말한다.
4. 충전 요청이 있으면 `POST /agent/topup`에 `{ "amountRaw": "10000" }`처럼 숫자만 있는 문자열을 보낸다. 이 충전은 그 회원의 은행 잔액을 사용한다.
5. 결제 전에 `POST /agent/owner/auth`에 `{ "phoneNumber": "<1번의 번호>" }`를 보낸다. 응답의 `ownerToken`은 채팅에 남기지 말고, 결제 요청 헤더 `X-Owner-Token`에만 넣는다.
6. `GET /agent/merchants`로 가맹점을 본다. 비어 있으면 결제를 만들지 말고 가맹점 등록이 필요하다고 말한다.
7. `GET /agent/merchants/{merchantId}/products`로 품목을 본다. `merchantId`와 `productId`는 숫자다.
8. `POST /agent/payments`에 `merchantId`, `productId`, `quantity`, `idempotencyKey`를 보낸다. `quantity`는 1 이상 99 이하 정수다. `idempotencyKey`는 그 결제 시도의 uuid 하나다. 네트워크 오류면 같은 uuid로 다시 보낸다. 품목이나 수량이 바뀌면 새 uuid다. 헤더에 `X-Owner-Token`이 있어야 한다.
9. 응답 `status`가 `paid`일 때만 완료다. `collectionAddress`는 보여 주기만 하고, 그 주소로 다시 보내지 않는다.

KYA 요청과 회원 승인은 항상 먼저다. 승인이 된 뒤에 MCP 도구가 있으면 그 도구를 쓴다. 인자 이름은 [references/tools.md](references/tools.md)에 있다.
