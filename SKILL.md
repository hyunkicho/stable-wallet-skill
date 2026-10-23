---
name: stable-wallet
description: >
  운영자가 준 API 키로 스테이블코인 지갑의 잔액을 보고, 회원이 승인한 한도 안에서 등록된 가맹점 품목을 결제한다.
  사용자가 지갑, 잔액, 충전, 결제, 가맹점, 스테이블코인, API 키, KYA를 말하면 이 스킬을 쓴다.
  키가 대화에 있으면 HTTP로 호출한다. 키 발급, 출금, 관리자, QR 결제, 회원 이체, 에이전트 직접 충전에는 쓰지 않는다.
---

# 스테이블 월렛

운영자가 API 키와 이 스킬만 준 경우, 그 키로 아래를 직접 호출한다. 베이스 주소는 `https://kb-stable-wallet-api-stage.vercel.app`이다. 모든 호출에 `Authorization: Bearer <대화에 있는 키>`를 붙인다. 키는 답장에 다시 쓰지 않는다.

## 순서

1. `GET /agent/me`로 `userNo`, `kyaStatus`, `paymentLimitKrw`, `spentKrw`를 읽는다.
2. `kyaStatus`가 `approved`가 아니면 `POST /agent/kya/request`를 한 번 보내고 멈춘다. 회원에게 개인 지갑의 에이전트 메뉴에서 충전 금액과 결제 한도를 입력하고 승인을 누르라고 말한다. 승인 전에는 결제를 다시 시도하지 않는다.
3. 승인이 된 뒤에 `GET /agent/balances`로 잔액을 읽는다. 서버가 준 심볼과 금액을 그대로 말한다. `POST /agent/topup`과 `POST /agent/owner/auth`는 호출하지 않는다. 충전과 한도는 회원이 이미 승인했다.
4. `GET /agent/merchants`로 가맹점을 본다. 비어 있으면 결제를 만들지 말고 가맹점 등록이 필요하다고 말한다.
5. `GET /agent/merchants/{merchantId}/products`로 품목을 본다. `merchantId`와 `productId`는 숫자다.
6. 결제 금액이 `paymentLimitKrw - spentKrw`보다 크면 결제하지 않고, 한도를 넘었다고 말한다. 남았으면 `POST /agent/payments`에 `merchantId`, `productId`, `quantity`, `idempotencyKey`만 보낸다. `X-Owner-Token`은 붙이지 않는다. `quantity`는 1 이상 99 이하 정수다. `idempotencyKey`는 그 결제 시도의 uuid 하나다. 네트워크 오류면 같은 uuid로 다시 보낸다. 품목이나 수량이 바뀌면 새 uuid다.
7. 응답 `status`가 `paid`일 때만 완료다. `403`과 `payment limit exceeded`면 멈춘다. `collectionAddress`는 보여 주기만 하고, 그 주소로 다시 보내지 않는다.

KYA 요청, 회원의 충전 승인, 회원의 결제 한도 승인이 먼저다. 그 한도 안의 결제는 추가 확인 없이 진행한다.
