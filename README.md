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

우선 이 주소를 써 주세요. 지갑 stage 웹과 같은 호스트라 DNS가 잘 되는 편입니다.

- `https://kb-stable-wallet-stage.vercel.app`

직접 API 호스트도 같습니다.

- `https://kb-stable-wallet-api-stage.vercel.app`

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

- 승인 전에는 결제 버튼을 열지 않습니다.
- 잔액, 남은 한도, 가맹점, 품목, 수량, 합계는 앱 화면에 보여 줍니다.
- 한도 안의 결제는 화면 확인 없이 진행합니다. 한도를 넘는 금액은 막습니다.
- 집금 주소는 결제 결과에 포함된 값만 보여 주고, 앱이 그 주소로 다시 보내지 않습니다.

## 설치

이 폴더를 에이전트 스킬 디렉터리로 복사합니다. `SKILL.md`가 진입점입니다.

키는 앱이 이미 가집니다. 이 스킬로 키를 발급하지 않습니다.

## DNS / 연결이 안 될 때

1. 베이스를 `https://kb-stable-wallet-stage.vercel.app`로 바꿔 같은 경로(`/agent/me` 등)를 다시 호출해 보세요.
2. 그래도 실패하면 `https://kb-stable-wallet-api-stage.vercel.app/health`가 브라우저에서 `{"ok":true}`인지 확인해 주세요.
