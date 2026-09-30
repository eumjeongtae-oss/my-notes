비밀번호는 git에 올리지 않는다. .env에 진짜 값, .env.example에 견본을 둔다.

## 왜 나누나

비밀번호를 git에 올리면 저장소를 볼 수 있는 모든 사람이 알게 된다.
**한 번 커밋되면 지워도 기록에 남는다.**

| 파일           | 내용                      | git     |
| -------------- | ------------------------- | ------- |
| `.env`         | 진짜 값                   | ❌ 제외 |
| `.env.example` | 어떤 변수가 필요한지 견본 | ✅ 올림 |

새 팀원은 `.env.example`을 복사해서 자기 `.env`를 만든다.

```bash
cp .env.example .env
```

## .gitignore 예외 처리

`.env*`로 전부 제외하면 견본까지 무시된다. `!`로 예외를 준다.

```
.env*
!.env.example
```

## compose.yaml에서 쓰기

```yaml
MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
```

`${...}`는 `.env`에서 값을 가져와 끼워 넣는다. 그래서 `compose.yaml`은 git에 올려도 안전하다.

## 로컬 DB 계정

로컬에서는 root를 쓴다. Prisma `migrate dev`가 임시 DB(shadow DB)를 만들었다 지우는 권한이 필요하기 때문이다.
운영에서는 권한을 줄인 전용 계정을 만든다.
