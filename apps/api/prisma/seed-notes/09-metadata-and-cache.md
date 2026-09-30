페이지마다 브라우저 탭 제목을 바꾸고, 같은 데이터를 두 번 조회하지 않게 했다.

## generateMetadata

React에서는 react-helmet 같은 라이브러리가 필요했다. Next에서는 함수 하나만 export하면 된다.

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params;
  const note = await getNote(id);
  return { title: note?.title };
}
```

루트 레이아웃에 템플릿을 두면 `노트 제목 | my-notes`가 된다.

```ts
title: { default: "my-notes", template: "%s | my-notes" }
```

## React cache

`generateMetadata`와 페이지 본문이 **각각** `getNote(id)`를 호출한다.
`cache`로 감싸면 **한 번의 요청 안에서는** 실제 조회를 한 번만 한다.

```ts
export const getNote = cache(async (id: string) => {
  // DB 조회
});
```

DB를 붙이면 쿼리가 두 번 나가는 걸 막아준다.

## 올바른 HTML

날짜는 `<span>`보다 `<time dateTime="...">`이 맞다. 검색엔진과 스크린리더가 날짜를 정확히 이해한다.
