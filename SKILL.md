---
name: stable-wallet
description: >
  운영자가 준 API 키로 스테이블코인 지갑의 잔액을 보고, 회원이 승인한 한도 안에서 등록된 가맹점 품목을 결제한다.
  사용자가 지갑, 잔액, 충전, 결제, 가맹점, 스테이블코인, API 키, KYA, 승인 요청, 인증 요청을 말하면 이 스킬을 쓴다.
  키가 대화에 있으면 HTTP로 호출한다. 키 발급, 출금, 관리자, QR 결제, 회원 이체, 에이전트 직접 충전에는 쓰지 않는다.
---

# 스테이블 월렛

운영자가 API 키와 이 스킬만 준 경우, 그 키로 아래를 직접 호출해 주세요.

**API 베이스(우선):** `https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1`  
(외부에서 `*.vercel.app` DNS가 실패할 때를 대비한 공개 프록시입니다. 경로 `/agent/*`는 그대로입니다.)

**대안(같은 경로):**
- `https://kb-stable-wallet-stage.vercel.app`
- `https://kb-stable-wallet-api-stage.vercel.app`

우선 베이스로 DNS·연결이 안 되면 대안을 순서대로 시도해 주세요.

모든 호출에 `Authorization: Bearer <대화에 있는 키>`를 붙여 주세요. 키는 답장에 다시 쓰지 말아 주세요.

운영자가 주는 문구는 보통 스킬 주소와 API 키뿐입니다. 순서는 이 파일과 README를 따릅니다.

## 가장 중요 — 승인(인증) 요청

키가 처음이거나 아직 승인이 없으면, **결제를 시도하기 전에** 반드시 주인 승인 요청을 보내 주세요.

- 이 요청의 공식 이름은 KYA이고, HTTP로는 `POST /agent/kya/request`입니다.
- 사용자가 “인증해 줘”, “승인 요청해 줘”, “KYA 보내 줘”라고 해도 같은 호출입니다.
- 본문 없이 `POST {API 베이스}/agent/kya/request` 한 번이면 됩니다.
- 보낸 뒤에는 멈추고, 회원에게 개인 지갑 → 에이전트 메뉴에서 충전 금액과 결제 한도를 넣고 승인해 달라고 안내해 주세요.

## 순서

1. `GET /agent/me`로 `userNo`, `kyaStatus`, `paymentLimitKrw`, `spentKrw`를 읽어 주세요.
2. `kyaStatus`가 `approved`가 아니면 `POST /agent/kya/request`를 한 번 보내고 멈춰 주세요. 승인 전에는 결제를 다시 시도하지 말아 주세요.
3. 승인이 된 뒤에 `GET /agent/balances`로 잔액을 읽어 주세요. 서버가 준 심볼과 금액을 그대로 말해 주세요. `POST /agent/topup`과 `POST /agent/owner/auth`는 호출하지 말아 주세요. 충전과 한도는 회원이 이미 승인했습니다.
4. `GET /agent/merchants`로 가맹점을 봐 주세요. 비어 있으면 결제를 만들지 말고 가맹점 등록이 필요하다고 말해 주세요.
5. `GET /agent/merchants/{merchantId}/products`로 품목을 봐 주세요. `merchantId`와 `productId`는 숫자입니다.
6. 결제 금액이 `paymentLimitKrw - spentKrw`보다 크면 결제하지 말고, 한도를 넘었다고 말해 주세요. 남았으면 `POST /agent/payments`에 `merchantId`, `productId`, `quantity`, `idempotencyKey`만 보내 주세요. `X-Owner-Token`은 붙이지 말아 주세요. `quantity`는 1 이상 99 이하 정수입니다. `idempotencyKey`는 그 결제 시도의 uuid 하나입니다. 네트워크 오류면 같은 uuid로 다시 보내 주세요. 품목이나 수량이 바뀌면 새 uuid를 써 주세요.
7. 응답 `status`가 `paid`일 때만 완료입니다. `403`과 `payment limit exceeded`면 멈춰 주세요. `collectionAddress`는 보여 주기만 하고, 그 주소로 다시 보내지 말아 주세요.

주인 승인(KYA) 요청 → 회원의 충전·한도 승인이 먼저입니다. 그 한도 안의 결제는 추가 확인 없이 진행해 주세요.
