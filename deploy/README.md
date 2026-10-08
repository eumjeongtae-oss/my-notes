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
