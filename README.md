# stable-wallet

스테이블코인 지갑 스킬 + **로컬 MCP** + **GitHub Actions 중계**.

## 운영자가 에이전트에 주는 것

DNS 막힌 외부 AI (Actions 중계):

```text
스킬: https://github.com/hyunkicho/stable-wallet-skill
키 번호(keyId): Uxxxxxxxx-1
```

로컬 Cursor MCP (PC 켤 때):

```text
스킬: https://github.com/hyunkicho/stable-wallet-skill
API 키: kbw_...
```

> Actions 중계에는 `kbw_`를 넣지 마세요. 유저마다 Secret 등록도 하지 않습니다.

## 1) 로컬 Cursor + MCP

```bash
cd mcp && npm install
KB_WALLET_API_KEY=kbw_... npm start
```

## 2) GitHub Actions 중계 (DNS 막힌 외부 AI)

### 운영자 준비 (한 번만)

API·Actions가 공유하는 **서비스 시크릿 1개**:

```bash
./scripts/set-relay-secret.sh
# 출력된 값을 Vercel kb-stable-wallet-api 의 AGENT_RELAY_SECRET 에도 동일하게 넣는다
```

유저 키를 GitHub에 올릴 필요 없음.

### 에이전트

이슈 제목 `[agent] me`, 본문:

```json
{"action":"me","keyId":"Uxxxxxxxx-1"}
```

`action`: `me` | `kya` | `balances` | `merchants`  
댓글에 API 결과가 옵니다.

## 3) 직접 HTTP

네트워크 되는 런타임만. URL은 `SKILL.md` 참고.

## 에이전트 요약

1. `me` → `kyaStatus`
2. 미승인이면 `kya` 한 번 → 회원 승인 안내 후 멈춤
3. 승인 후 한도 안 결제만
4. topup / owner auth 금지
