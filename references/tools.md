# 도구 / HTTP

MCP: `https://stable-wallet-mcp.indecisive-fold.workers.dev/mcp` — **연결 무인증**.  
키: 도구 `apiKey` 또는 `Authorization: Bearer kbw_...`  
HTTP 베이스: `https://kb-stable-wallet-api-stage.vercel.app` + Bearer

| 이름 | HTTP | 인자 |
|---|---|---|
| `wallet_me` | `GET /agent/me` | `apiKey?` |
| `wallet_kya_request` | `POST /agent/kya/request` | `apiKey?` — **회원 한도 승인** (주소 KYT 아님) |
| `wallet_balances` | `GET /agent/balances` | `apiKey?` |
| `wallet_merchants` | `GET /agent/merchants` | `apiKey?` |
| `wallet_products` | `GET /agent/merchants/{id}/products` | `apiKey?`, `merchantId` |
| `wallet_pay` | `POST /agent/payments` | `apiKey?`, `merchantId`, `productId`, `quantity?`, `idempotencyKey` |

수신 지갑 주소·체인·코인 송금 없음.
