# stable-wallet

스테이블코인 지갑 스킬입니다. 이 저장소는 사용 규칙만 담습니다. 잔액은 지갑 화면과 같은 장부에 있습니다.

운영자가 **스킬 주소와 API 키만** 에이전트에 주면 됩니다. 자세한 순서는 `SKILL.md`와 아래를 따릅니다.

## 운영자가 에이전트에 주는 것

```text
스킬: https://github.com/hyunkicho/stable-wallet-skill
API 키: kbw_...
```

## 호출 URL (DNS)

일부 에이전트 런타임은 `*.vercel.app` DNS가 실패합니다 (`NameResolutionError` / `Temporary failure in name resolution`).  
그래서 **아래 전체 URL만** 쓰세요. 잘라 붙이지 마세요.

```text
GET  https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/me
POST https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/kya/request
GET  https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/balances
GET  https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/merchants
POST https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/payments
```

모든 호출에 `Authorization: Bearer <API 키>`를 붙입니다. 키는 답장에 다시 쓰지 않습니다.

## 에이전트가 할 일 (요약)

1. `GET .../agent/me`로 `kyaStatus`를 읽습니다.
2. `approved`가 아니면 `POST .../agent/kya/request`를 **한 번** 보내고 멈춥니다.
3. 회원에게 지갑 → 에이전트 메뉴에서 충전·한도 승인을 안내합니다.
4. 승인 뒤 한도 안에서 가맹점 → 품목 → `POST .../agent/payments`만 진행합니다.
5. `POST /agent/topup`, `POST /agent/owner/auth`는 호출하지 않습니다.

자세한 HTTP 순서는 `SKILL.md`에 있습니다.
