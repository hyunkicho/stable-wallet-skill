# stable-wallet

스테이블코인 지갑 스킬입니다. 이 저장소는 사용 규칙만 담습니다. 잔액은 지갑 화면과 같은 장부에 있습니다.

운영자가 **스킬 주소와 API 키만** 에이전트에 주면 됩니다. 자세한 순서는 `SKILL.md`와 아래를 따릅니다.

## 운영자가 에이전트에 주는 것

```text
스킬: https://github.com/hyunkicho/stable-wallet-skill
API 키: kbw_...
```

그 외 설명은 이 README / `SKILL.md`에 있습니다. 에이전트에게 긴 지시문을 다시 붙일 필요는 없습니다.

## API 베이스

기본(예전에 쓰던 주소):

- `https://kb-stable-wallet-api-stage.vercel.app`

예시:

```text
GET  https://kb-stable-wallet-api-stage.vercel.app/agent/me
POST https://kb-stable-wallet-api-stage.vercel.app/agent/kya/request
```

`*.vercel.app` DNS만 실패할 때 대체(전체 URL, 경로를 임의로 합치지 말 것):

- `https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/me`
- `https://udvmadzdrzdvmrdfblak.supabase.co/functions/v1/agent/kya/request`

모든 호출에 `Authorization: Bearer <API 키>`를 붙입니다. 키는 답장에 다시 쓰지 않습니다.

## 에이전트가 할 일 (요약)

1. `GET /agent/me`로 `kyaStatus`를 읽습니다.
2. `approved`가 아니면 `POST /agent/kya/request`로 주인 승인(KYA·인증) 요청을 **한 번** 보내고 멈춥니다.  
   “인증 요청”, “승인 요청”, “KYA”는 모두 이 호출입니다.
3. 회원에게 개인 지갑 → 에이전트 메뉴에서 충전 금액과 결제 한도를 넣고 승인해 달라고 안내합니다.
4. 승인 뒤에는 한도 안에서 `GET /agent/merchants` → 품목 → `POST /agent/payments`만 진행합니다.
5. `POST /agent/topup`, `POST /agent/owner/auth`는 호출하지 않습니다.

자세한 HTTP 순서는 `SKILL.md`에 있습니다.

## 앱이 할 일

- 키 발급 화면에 스킬 주소와 API 키만 보여 줍니다.
- 충전·한도·승인은 회원 지갑 화면에서 합니다.
