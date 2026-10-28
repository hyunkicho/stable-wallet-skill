# stable-wallet

스테이블코인 지갑 스킬 + **로컬 MCP** + **GitHub Actions 중계**.

운영자가 에이전트에 주는 것:

```text
스킬: https://github.com/hyunkicho/stable-wallet-skill
키 번호(keyId): Uxxxxxxxx-1
```

> Actions 중계를 쓸 때는 **API 비밀키(`kbw_`)를 대화/이슈에 넣지 마세요.**  
> 운영자가 `scripts/register-agent-key.sh`로 GitHub Secret에만 등록합니다.

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

### 운영자(한 번)

지갑에서 키 발급 후:

```bash
./scripts/register-agent-key.sh Uxxxxxxxx-1 'kbw_...'
```

→ repo secret `WALLET_AGENT_KEYS`에 `{ "Uxxxxxxxx-1": "kbw_..." }` 형태로 올라갑니다.  
로컬 파일 `.agent-keys.local.json`은 gitignore입니다.

### 에이전트

이 레포에 이슈를 엽니다. **본문에 kbw_ 를 넣지 마세요.**

- 제목: `[agent] me`
- 본문:

```json
{"action":"me","keyId":"Uxxxxxxxx-1"}
```

Actions가 Secret에서 키를 읽어 stage API를 호출하고 **이슈 댓글**에 결과를 남깁니다.

`action`: `me` | `kya` | `balances` | `merchants`

## 3) 직접 HTTP

네트워크·DNS가 되는 런타임만. 전체 URL은 `SKILL.md` 참고. 이 경우에도 키는 답장에 다시 쓰지 마세요.

## 에이전트 요약

1. `me` → `kyaStatus`
2. 미승인이면 `kya` 한 번 → 멈추고 회원 승인 안내
3. 승인 후 한도 안 결제만
4. topup / owner auth 금지
