---
name: stable-wallet
description: >
  화면이 있는 앱에 연결된 스테이블코인 지갑의 잔액을 보여주고, 앱에서 확인된 금액만 충전하고, 등록된 가맹점 품목을 결제한다.
  사용자가 지갑, 잔액, 충전, 결제, 가맹점, 스테이블코인을 말하거나 앱의 지갑·결제 화면을 열면 이 스킬을 쓴다. 호스트가 채팅이 아니라 앱이어도 쓴다.
  MCP 도구 wallet_balances, wallet_topup, wallet_owner_auth, wallet_merchants, wallet_products, wallet_pay만 호출한다.
  키 발급, 출금, 관리자, QR 결제, 회원 이체, 앱 화면 수정에는 쓰지 않는다.
---

# 스테이블 월렛

호스트는 화면이 있는 앱이다. 잔액과 확인은 그 화면에 올린다. URL과 헤더를 직접 만들지 않는다. 키가 없으면 멈춘다. 키와 주인 토큰은 화면과 대화에 내지 않는다.

## 순서

1. `wallet_balances`로 잔액을 읽는다. 이 잔액은 앱 지갑 화면과 같은 장부다. 서버가 준 심볼과 금액을 그대로 화면에 보여 준다.
2. 충전은 앱이 원화 금액을 확인한 뒤에만 `wallet_topup`을 호출한다. `amountRaw`는 숫자만 있는 문자열이다. 예: `"10000"`.
3. 결제 전에는 앱이 받은 가입 전화번호로 `wallet_owner_auth`를 호출한다. 인자 이름은 `phoneNumber`다. 번호를 지어내지 않는다. 토큰은 도구 안에 남고, 앱은 회원번호와 만료 시각만 받는다.
4. `wallet_merchants`와 `wallet_products`로 가맹점과 품목을 고른다. `merchantId`는 숫자다.
5. 앱 화면에 가맹점, 품목, 수량, 합계 원화를 보여주고 동의가 온 뒤에만 `wallet_pay`를 호출한다. `merchantId`와 `productId`는 숫자, `quantity`는 1 이상의 정수, `idempotencyKey`는 그 결제 시도의 uuid 하나다. 앱이 uuid를 저장한다. 네트워크 오류면 같은 uuid로 다시 호출한다. 품목이나 수량이 바뀌면 새 uuid다.
6. 응답 `status`가 `paid`일 때만 완료다. `collectionAddress`는 그 체인의 집금 주소다. 앱이 그 주소로 다시 보내지 않는다.

같은 전화번호로 나중에 앱 지갑에 로그인하면 이 잔액, 충전, 결제가 보인다.

가맹점이 없으면 결제를 만들지 말고 앱에 가맹점 등록이 필요하다고 알린다.

## 하지 않는 일

키 발급, 출금, 관리자, 회원 이체, QR 결제, 화면 코드 수정.

인자 표는 [references/tools.md](references/tools.md)에 있다. 호출 인자 이름은 이 순서에 있는 것을 쓴다.
