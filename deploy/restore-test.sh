#!/usr/bin/env bash
# 백업 되살리기 연습: S3의 가장 최근 백업을 연습용 MySQL에 넣어 보고, 운영 DB와 개수가 같은지 비교한다.
# 운영 DB는 조회만 한다 (건드리지 않음). 연습용 MySQL과 내려받은 파일은 끝나면 지운다.
# 한 달에 한 번쯤 돌려 보면 "백업이 진짜 쓸 수 있는지"를 확인할 수 있다.
#
# 실행: ~/my-notes/deploy/restore-test.sh

set -euo pipefail

BUCKET="chagoknotes-db-backup"
REGION="ap-southeast-2"
TEST_CONTAINER="my-notes-restore-test"
TEST_PASSWORD="restore-test"

cd "$(dirname "$0")/.."

compose() {
  docker compose -f compose.prod.yaml --env-file .env.prod "$@"
}

aws() {
  docker run --rm --network host -v "$tmp_dir:/backup" amazon/aws-cli --region "$REGION" "$@"
}

tmp_dir=$(mktemp -d)
cleanup() {
  docker rm -f "$TEST_CONTAINER" > /dev/null 2>&1 || true
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

# 1. 가장 최근 백업 찾기 (파일 이름에 시각이 들어 있어서 이름순 정렬 = 시간순)
latest=$(aws s3 ls "s3://$BUCKET/daily/" | awk '{print $4}' | sort | tail -n 1)
if [ -z "$latest" ]; then
  echo "S3에 백업이 없습니다"
  exit 1
fi
echo "1. 가장 최근 백업: $latest"

# 2. 내려받기
aws s3 cp "s3://$BUCKET/daily/$latest" "/backup/$latest" --only-show-errors
echo "2. 내려받음 ($(du -h "$tmp_dir/$latest" | cut -f1))"

# 3. 연습용 MySQL 띄우기 (운영과 같은 버전, 포트를 밖으로 열지 않음)
docker run -d --name "$TEST_CONTAINER" \
  -e MYSQL_ROOT_PASSWORD="$TEST_PASSWORD" -e MYSQL_DATABASE=my_notes \
  mysql:8.4 > /dev/null
echo -n "3. 연습용 MySQL 준비 중"
# 처음 켜질 때 초기화용 임시 서버가 잠깐 떴다 꺼지므로, 127.0.0.1(TCP)로 응답할 때까지 기다린다
for _ in $(seq 1 60); do
  if docker exec "$TEST_CONTAINER" mysqladmin ping -h 127.0.0.1 -p"$TEST_PASSWORD" --silent > /dev/null 2>&1; then
    break
  fi
  echo -n "."
  sleep 2
done
echo " 준비됨"

# 4. 백업 넣기
gunzip -c "$tmp_dir/$latest" |
  docker exec -i "$TEST_CONTAINER" mysql --default-character-set=utf8mb4 -uroot -p"$TEST_PASSWORD" my_notes 2> /dev/null
echo "4. 백업을 연습용 MySQL에 넣음"

# 5. 개수 비교 (운영은 조회만)
count_sql="SELECT CONCAT((SELECT COUNT(*) FROM users), ' / ', (SELECT COUNT(*) FROM notes), ' / ', (SELECT COUNT(*) FROM series))"
restored=$(docker exec "$TEST_CONTAINER" mysql -uroot -p"$TEST_PASSWORD" my_notes -N -e "$count_sql" 2> /dev/null)
# shellcheck disable=SC2016
live=$(compose exec -T mysql sh -c 'mysql -umy_notes_app -p"$MYSQL_PASSWORD" my_notes -N -e "$0"' "$count_sql" 2> /dev/null)

echo
echo "                사용자 / 노트 / 묶음"
echo "  되살린 백업:  $restored"
echo "  지금 운영:    $live"
echo
if [ "$restored" = "$live" ]; then
  echo "성공: 백업이 운영과 같습니다"
else
  echo "차이가 있습니다. 백업 뒤에 노트를 쓰거나 지웠다면 정상입니다 (백업은 그 시각의 사진)"
fi
