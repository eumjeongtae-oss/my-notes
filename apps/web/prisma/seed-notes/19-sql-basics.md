대부분의 조회는 SELECT 한 문장이다. 순서는 SELECT → FROM → WHERE → ORDER BY → LIMIT.

## 기본 틀

```sql
SELECT 보고 싶은 칸
FROM 테이블
WHERE 조건
ORDER BY 정렬 기준
LIMIT 개수;
```

## 예시 (앞으로 만들 기능과 연결)

**최신순 2개** → 홈 목록, 무한스크롤

```sql
SELECT id, title, updated_at FROM notes ORDER BY updated_at DESC LIMIT 2;
```

**제목 검색** → 검색 기능 첫 버전

```sql
SELECT id, title FROM notes WHERE title LIKE '%컴포넌트%';
```

**JOIN** → 시리즈 상세 페이지

```sql
SELECT n.title, s.name, n.series_order
FROM notes n
JOIN series s ON s.id = n.series_id
ORDER BY n.series_order;
```

**GROUP BY** → 시리즈별 노트 개수 (엑셀 피벗 테이블)

```sql
SELECT s.name, COUNT(n.id) AS note_count
FROM series s
LEFT JOIN notes n ON n.series_id = s.id
GROUP BY s.id;
```

## ⚠️ 실무 규칙

- `UPDATE`, `DELETE`에는 **항상 WHERE 먼저**. 없으면 테이블 전체가 바뀐다
- 수정 전에 같은 조건으로 **SELECT부터** 해서 몇 줄인지 확인
- 운영 DB에는 **조회만**
- 로컬은 망가져도 `pnpm prisma db seed`로 복구된다. 마음껏 연습하기

## 도구

DBeaver(무료), DataGrip, MySQL Workbench. 추출은 결과 표에서 **Export → CSV/Excel**.
MySQL 8 접속 시 `allowPublicKeyRetrieval=true`가 필요할 수 있다.
