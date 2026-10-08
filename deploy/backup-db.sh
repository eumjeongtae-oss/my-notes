#!/usr/bin/env bash
# 운영 DB 백업: mysqldump로 DB 전체(테이블 구조 + 데이터)를 뽑아 압축해서 S3 보관함에 올린다.
# 매일 새벽 3시(한국 시간)에 my-notes-backup.timer가 실행한다. 30일 지난 파일은 S3 수명 주기 규칙이 지운다.
#
# S3에 올릴 권한은 서버에 달아 둔 IAM 역할(my-notes-ec2-role)에서 온다. 서버에 저장된 비밀 키는 없다.
# AWS CLI는 설치하지 않고 공식 Docker 이미지(amazon/aws-cli)로 실행한다.
#
# 로그 보기: journalctl -u my-notes-backup -n 50 --no-pager
# 손으로 한 번 실행: sudo systemctl start my-notes-backup

set -euo pipefail

BUCKET="chagoknotes-db-backup"
REGION="ap-southeast-2"

cd "$(dirname "$0")/.."

compose() {
  docker compose -f compose.prod.yaml --env-file .env.prod "$@"
}

# 파일 이름에 넣을 시각 (UTC). 예: my_notes-2026-10-08T180000Z.sql.gz
stamp=$(date -u +%Y-%m-%dT%H%M%SZ)
file="my_notes-${stamp}.sql.gz"
tmp_dir=$(mktemp -d)
# 스크립트가 어떻게 끝나든(성공, 실패) 임시 파일은 지운다. 노트 내용이 그대로 들어 있는 파일이다
trap 'rm -rf "$tmp_dir"' EXIT

# 1. 덤프 뜨기 (MySQL 컨테이너 안에서 실행하고, 결과를 바로 압축해서 서버의 임시 폴더에 저장)
#   --single-transaction: 덤프하는 동안 DB를 잠그지 않고 "시작한 순간"의 모습을 그대로 뜬다 (사이트가 멈추지 않음)
#   --no-tablespaces: 앱 전용 계정에 없는 권한(PROCESS)이 필요한 정보는 빼기
#   테이블 구조와 _prisma_migrations까지 모두 담아서, 빈 MySQL에 그대로 넣으면 지금 상태가 된다
#   $MYSQL_PASSWORD는 작은따옴표 안이라 여기(서버)가 아니라 MySQL 컨테이너 안에서 풀린다 (비밀번호가 서버 명령 기록에 남지 않게)
# shellcheck disable=SC2016
compose exec -T mysql sh -c 'mysqldump --default-character-set=utf8mb4 --single-transaction --no-tablespaces --set-gtid-purged=OFF -umy_notes_app -p"$MYSQL_PASSWORD" my_notes' |
  gzip > "$tmp_dir/$file"

# 압축 파일이 깨지지 않았는지 확인 (깨졌으면 여기서 멈춘다)
gzip -t "$tmp_dir/$file"

# 2. S3에 올리기
#   --network host: 서버의 IAM 역할 정보를 받으려면 서버 자신의 네트워크로 AWS에 물어봐야 한다
docker run --rm --network host -v "$tmp_dir:/backup:ro" amazon/aws-cli \
  s3 cp "/backup/$file" "s3://$BUCKET/daily/$file" --region "$REGION" --only-show-errors

size=$(du -h "$tmp_dir/$file" | cut -f1)
echo "백업 완료: s3://$BUCKET/daily/$file ($size)"
