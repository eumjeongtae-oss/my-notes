보기 방식과 정렬은 useState 대신 URL 쿼리에 저장했다. 클라이언트 컴포넌트가 하나도 필요 없었다.

## 흐름

```
/?view=grid&sort=oldest
```

1. 링크(`<Link>`)를 누르면 URL이 바뀐다
2. 서버 컴포넌트가 `searchParams`로 URL을 읽는다
3. 그 값으로 목록을 다시 그린다

```tsx
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const view = parseView(params.view);
  const sort = parseSort(params.sort);
}
```

## 장점

- 새로고침해도 유지된다
- 뒤로 가기가 자연스럽게 동작한다
- 주소를 공유하면 같은 화면이 보인다
- 기본값은 URL에서 빼서 주소를 깔끔하게 유지한다

## URL 값은 믿으면 안 된다

사용자는 주소창에 `?view=abc`처럼 아무 값이나 넣을 수 있다.
**허용된 값만 통과시키고 나머지는 기본값으로.** 백엔드의 입력값 검증과 같은 개념이다.

```ts
export function parseView(value): NoteView {
  return value === "grid" ? "grid" : "list";
}
```

## 참고

- `searchParams`를 읽는 페이지는 요청마다 서버에서 그리는 **동적 페이지**가 된다 (빌드 결과에 `ƒ`)
- 여러 값이 오면(`?id=1&id=2`) **배열**로 들어온다. 문자열인지 확인해야 한다
