# MCP 도구

원격 MCP: `https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp`  
헤더: `Authorization: Bearer kbw_...`

| 도구 | 인자 | 비고 |
|---|---|---|
| `wallet_me` | 없음 | `kyaStatus`, 한도·사용액 |
| `wallet_kya_request` | 없음 | 미승인일 때만 한 번 |
| `wallet_balances` | 없음 | |
| `wallet_merchants` | 없음 | |
| `wallet_products` | `merchantId` | 양의 정수 |
| `wallet_pay` | `merchantId`, `productId`, `quantity?`, `idempotencyKey` | 한도 안만. quantity 기본 1 |

충전·주인 인증 도구는 없다. `paid`가 아니면 완료로 말하지 않는다.
