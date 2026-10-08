#!/usr/bin/env bash
# 자동 배포 (pull 방식): 서버가 2분마다 이 스크립트를 실행한다 (my-notes-deploy.timer).
# GHCR에 새 이미지가 있거나 서버 설정 파일이 바뀌었을 때만 다시 켜고, 아니면 아무것도 하지 않고 끝난다.
# 서버로 들어오는 문을 새로 열지 않는다. 서버가 GitHub과 GHCR로 확인하러 나가기만 한다.
#
# 로그 보기: journalctl -u my-notes-deploy -n 50
# 손으로 한 번 실행: sudo systemctl start my-notes-deploy

# 명령 하나라도 실패하면 바로 멈춘다 (반쯤 배포된 상태로 계속 진행하지 않게)
set -euo pipefail

cd "$(dirname "$0")/.."

compose() {
  docker compose -f compose.prod.yaml --env-file .env.prod "$@"
}

# 지금 서버에 있는 앱 이미지들의 고유 번호(ID). 새 이미지를 받으면 이 번호가 바뀐다
image_ids() {
  compose config --images | sort | while read -r image; do
    docker image inspect --format '{{.Id}}' "$image" 2>/dev/null || echo "없음"
  done
}

# 1. 설정 파일(compose.prod.yaml, Caddyfile) 최신으로
before_commit=$(git rev-parse HEAD)
git pull --ff-only --quiet
after_commit=$(git rev-parse HEAD)

config_changed=false
if ! git diff --quiet "$before_commit" "$after_commit" -- compose.prod.yaml Caddyfile; then
  config_changed=true
fi

caddyfile_changed=false
if ! git diff --quiet "$before_commit" "$after_commit" -- Caddyfile; then
  caddyfile_changed=true
fi

# 2. 새 이미지 받기 (바뀐 것만 내려받는다)
before_images=$(image_ids)
compose pull --quiet
after_images=$(image_ids)

if [ "$before_images" = "$after_images" ] && [ "$config_changed" = false ]; then
  # 바뀐 게 없으면 조용히 끝난다 (2분마다 로그가 쌓이지 않게)
  exit 0
fi

echo "변경 발견 (커밋 ${before_commit:0:7} → ${after_commit:0:7}, 설정 변경: $config_changed). 다시 켭니다"

# 3. 바뀐 컨테이너만 새로 만든다 (migrate가 먼저 돌아 DB 테이블을 최신으로 맞춘다)
compose up -d --wait --remove-orphans

# Caddyfile은 파일만 바뀌어서 Compose가 눈치채지 못한다. Caddy에게 다시 읽으라고 알려 준다 (끊김 없음)
if [ "$caddyfile_changed" = true ]; then
  compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile
fi

# 4. 이제 안 쓰는 예전 이미지 지우기 (디스크 20GB가 차지 않게)
docker image prune -f > /dev/null

echo "배포 완료"
