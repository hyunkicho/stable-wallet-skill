# 도구 인자

MCP 도구가 있을 때의 이름이다. 키가 대화에만 있으면 `SKILL.md`의 HTTP를 쓴다.

| 도구 | 인자 | 타입 |
|---|---|---|
| `wallet_balances` | 없음 | |
| `wallet_topup` | `amountRaw` | 숫자만 있는 문자열. `"10000"` |
| `wallet_owner_auth` | `phoneNumber` | 문자열. 가입 전화번호. `phone`이 아니다 |
| `wallet_merchants` | 없음 | |
| `wallet_products` | `merchantId` | 양의 정수. 문자열이 아니다 |
| `wallet_pay` | `merchantId`, `productId` | 양의 정수 |
| `wallet_pay` | `quantity` | 1 이상 99 이하 정수. 기본 1 |
| `wallet_pay` | `idempotencyKey` | uuid |

`wallet_pay`가 `paid`가 아니면 완료로 말하지 않는다. `collectionAddress`는 보여 주기만 한다.
