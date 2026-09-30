Prisma는 schema.prisma 설계도로 DB를 만들고, 마이그레이션으로 변경 기록을 남긴다.

## 파일

| 파일                   | 역할                                   |
| ---------------------- | -------------------------------------- |
| `prisma/schema.prisma` | 설계도 (모델)                          |
| `prisma7.config.ts`    | 설정 (설계도 위치, DB 주소, seed 명령) |
| `prisma/migrations/`   | DB 변경 기록 (SQL)                     |
| `src/generated/prisma` | 자동 생성 코드 (git 제외)              |

## 설계하면서 주의한 것

- MySQL에서 `String` 기본값은 **`VARCHAR(191)`**. 긴 본문은 `@db.MediumText`
- 코드는 `camelCase`, DB는 `snake_case` (`@map`, `@@map`)
- 관계 필드(`series`, `notes`)는 **DB 칸이 아니라** 연결 설명. 실제 칸은 `seriesId`

## 마이그레이션은 DB의 git 커밋

```bash
pnpm prisma migrate dev --name init   # 변경을 SQL로 만들고 DB에 반영
pnpm prisma generate                  # 클라이언트 코드 생성
pnpm prisma db seed                   # 예시 데이터
pnpm prisma studio                    # 브라우저로 DB 보기
```

⚠️ **이미 적용된 마이그레이션 파일은 절대 수정하지 않는다.** 바꾸려면 새 마이그레이션을 만든다.

## Prisma 7에서 달라진 점

- `prisma.config.ts` 설정 파일
- MySQL은 **드라이버 어댑터** `@prisma/adapter-mariadb`가 필요
- `migrate dev`가 generate와 seed를 **자동으로 하지 않는다**
- npm `latest` 태그가 8.0 RC를 가리켜서 **7.10.0으로 버전 고정**

## 한글이 ????로 보였던 일

데이터가 아니라 조회 도구의 **표시 문제**였다. `HEX()`로 실제 저장값을 확인해서 판단했다.
