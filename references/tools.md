# 도구 / HTTP

MCP: `https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp` + `Authorization: Bearer kbw_...`  
HTTP 베이스: `https://kb-stable-wallet-api-stage.vercel.app` + 같은 Bearer

| 이름 | HTTP | 인자 |
|---|---|---|
| `wallet_me` | `GET /agent/me` | 없음 |
| `wallet_kya_request` | `POST /agent/kya/request` | 없음. **회원 한도 승인 요청** (주소 KYT 아님) |
| `wallet_balances` | `GET /agent/balances` | 없음 |
| `wallet_merchants` | `GET /agent/merchants` | 없음 |
| `wallet_products` | `GET /agent/merchants/{id}/products` | `merchantId` 양의 정수 |
| `wallet_pay` | `POST /agent/payments` | `merchantId`, `productId`, `quantity?`, `idempotencyKey` uuid |

수신 지갑 주소·체인·코인 송금 없음.
