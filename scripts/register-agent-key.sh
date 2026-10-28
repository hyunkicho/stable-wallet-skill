#!/usr/bin/env bash
# 더 이상 유저별 kbw_ 를 GitHub에 올리지 않습니다.
# 중계는 API의 AGENT_RELAY_SECRET 하나로 동작합니다. (set-relay-secret.sh)
echo "Per-user API keys are NOT registered in GitHub anymore." >&2
echo "Use: ./scripts/set-relay-secret.sh" >&2
echo "Agent issue body: {\"action\":\"me\",\"keyId\":\"Uxxxxxxxx-1\"}" >&2
exit 1
