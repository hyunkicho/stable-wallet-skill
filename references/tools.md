# 도구 인자

키가 대화에만 있으면 `SKILL.md`의 HTTP를 쓴다. MCP 도구가 있어도 충전과 주인 인증 도구는 호출하지 않는다.

| 도구 | 인자 | 타입 |
|---|---|---|
| `wallet_balances` | 없음 | |
| `wallet_merchants` | 없음 | |
| `wallet_products` | `merchantId` | 양의 정수. 문자열이 아니다 |
| `wallet_pay` | `merchantId`, `productId` | 양의 정수 |
| `wallet_pay` | `quantity` | 1 이상 99 이하 정수. 기본 1 |
| `wallet_pay` | `idempotencyKey` | uuid |

`wallet_pay`는 회원이 승인한 한도 안에서만 호출한다. 주인 토큰 헤더는 붙이지 않는다. `paid`가 아니면 완료로 말하지 않는다. `collectionAddress`는 보여 주기만 한다.
