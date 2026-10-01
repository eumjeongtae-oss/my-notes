기능마다 브랜치를 따고, 작게 커밋하고, main에 합친다.

## 브랜치

`main`에 바로 커밋하지 않고 작업마다 브랜치를 만든다.

```bash
git switch -c feat/write-page   # 새 브랜치를 만들고 이동
```

| 접두어   | 용도       |
| -------- | ---------- |
| `feat/`  | 새 기능    |
| `fix/`   | 버그 수정  |
| `chore/` | 설정, 잡일 |

## 커밋 메시지 (Conventional Commits)

```
feat: 홈에 노트 카드 목록 추가
fix: 줄 맨 앞에서 커서가 안 보이는 문제 수정
refactor: 날짜 포맷을 formatDate로 모음
docs: 로드맵 갱신
chore: Prettier 설정 추가
```

- 앞에 **종류**를 붙이면 기록만 봐도 무슨 변경인지 알 수 있다
- 기능 변경 없이 구조만 바꾸면 `refactor`

## 기본 브랜치 이름

요즘 표준은 `master`가 아니라 `main`이다.

```bash
git branch -m master main
```

## 커밋과 푸시는 다르다

- **커밋**: 내 컴퓨터에 기록을 저장 (GitHub 없어도 됨)
- **푸시**: 그 기록을 GitHub에 올림
