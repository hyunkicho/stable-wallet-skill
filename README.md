# stable-wallet

스테이블코인 지갑 스킬 + **로컬 MCP** + **GitHub Actions 중계**.

운영자가 에이전트에 주는 것:

```text
스킬: https://github.com/hyunkicho/stable-wallet-skill
API 키: kbw_...
```

## 1) 로컬 Cursor + MCP (PC 켜져 있을 때)

```bash
cd mcp && npm install
KB_WALLET_API_KEY=kbw_... npm start
```

Cursor MCP 설정 예:

```json
{
  "mcpServers": {
    "stable-wallet": {
      "command": "node",
      "args": ["/ABS/PATH/stable-wallet-skill/mcp/src/index.js"],
      "env": {
        "KB_WALLET_API_KEY": "kbw_...",
        "KB_WALLET_API_BASE": "https://kb-stable-wallet-api-stage.vercel.app"
      }
    }
  }
}
```

도구: `wallet_me`, `wallet_kya_request`, `wallet_balances`, `wallet_merchants`, `wallet_products`, `wallet_pay`

## 2) GitHub Actions 중계 (DNS 막힌 외부 AI)

이 공개 레포에 이슈를 엽니다.

- 제목: `[agent] me`
- 본문:

```json
{"action":"me","apiKey":"kbw_..."}
```

Actions 러너가 stage API를 호출하고 **이슈 댓글**에 결과를 남깁니다. 본문 키는 스크러브됩니다.

`action`: `me` | `kya` | `balances` | `merchants`

> 데모용입니다. 키가 잠깐 이슈에 보이므로, 가능하면 쓰고 지운 키·폐기를 권장합니다.

## 3) 직접 HTTP

네트워크·DNS가 되는 런타임만. 전체 URL은 `SKILL.md` 참고.

## 에이전트 요약

1. `me` → `kyaStatus`
2. 미승인이면 `kya` 한 번 → 멈추고 회원 승인 안내
3. 승인 후 한도 안 결제만
4. topup / owner auth 금지
