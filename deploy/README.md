# deploy: 서버 자동 배포 (pull 방식)

main에 push하면 GitHub Actions가 이미지를 빌드해 GHCR에 올린다. 서버는 2분마다 GHCR과 GitHub을 확인해서 바뀐 게 있으면 받아서 다시 켠다. 서버로 들어오는 문(SSH 등)을 GitHub에 열어 줄 필요가 없다.

| 파일                      | 역할                                                                             |
| ------------------------- | -------------------------------------------------------------------------------- |
| `auto-deploy.sh`          | 설정 파일 `git pull` → 이미지 `pull` → 바뀐 게 있을 때만 `up` → 예전 이미지 정리 |
| `my-notes-deploy.service` | 위 스크립트를 한 번 실행하는 작업 (systemd)                                      |
| `my-notes-deploy.timer`   | 그 작업을 2분마다 실행하는 예약                                                  |

## 서버에 설치 (한 번만)

```sh
cd ~/my-notes
git pull
sudo cp deploy/my-notes-deploy.service deploy/my-notes-deploy.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now my-notes-deploy.timer
```

## 확인

```sh
systemctl list-timers my-notes-deploy.timer   # 다음 실행 시각
journalctl -u my-notes-deploy -n 50           # 배포 기록 (바뀐 게 없으면 기록도 없다)
sudo systemctl start my-notes-deploy          # 기다리지 않고 지금 한 번 실행
```

## 멈추기

```sh
sudo systemctl disable --now my-notes-deploy.timer
```

# DB 백업 (매일 새벽 3시 → S3)

| 파일                      | 역할                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `backup-db.sh`            | `mysqldump`(테이블 구조 + 데이터) → 압축 → S3 `chagoknotes-db-backup/daily/`에 올리기 |
| `my-notes-backup.service` | 위 스크립트를 한 번 실행하는 작업                                                     |
| `my-notes-backup.timer`   | 매일 03:00(한국 시간)에 실행. 서버가 꺼져 있었으면 켜질 때 바로                       |

- S3 권한은 서버의 IAM 역할 `my-notes-ec2-role`(정책 `my-notes-backup-s3`: 이 버킷에 넣기, 꺼내기, 목록 보기만. 지우기 없음)에서 온다
- 30일 지난 백업은 S3 수명 주기 규칙(`delete-after-30-days`)이 지운다

## 설치 (한 번만)

```sh
cd ~/my-notes
git pull
sudo cp deploy/my-notes-backup.service deploy/my-notes-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now my-notes-backup.timer
```

## 확인

```sh
sudo systemctl start my-notes-backup                 # 지금 한 번 백업
journalctl -u my-notes-backup -n 20 --no-pager       # "백업 완료: s3://..." 가 보이면 성공
systemctl list-timers my-notes-backup.timer          # 다음 백업 시각
```

## 되살리기 연습 (한 달에 한 번쯤)

S3의 가장 최근 백업을 **연습용 MySQL**에 넣어 보고 운영 DB와 사용자, 노트, 묶음 개수를 비교한다. 운영 DB는 조회만 하고, 연습용 MySQL과 내려받은 파일은 끝나면 지운다.

```sh
~/my-notes/deploy/restore-test.sh
```

진짜로 운영을 되살려야 할 때(서버가 사라졌을 때)는 새 서버에서 MySQL만 먼저 켜고(`up -d mysql`), 백업을 `gunzip -c 파일 | docker compose ... exec -T mysql mysql -umy_notes_app -p... my_notes`로 넣은 뒤 나머지를 켠다. 백업에 테이블 구조와 마이그레이션 기록이 모두 들어 있다.
