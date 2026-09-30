App Router의 컴포넌트는 기본이 서버 컴포넌트다. 필요한 곳에만 "use client"를 붙인다.

## 서버 컴포넌트 (기본값)

- 서버에서 실행되고 **HTML 결과만** 브라우저로 간다
- `async` 함수로 만들고 데이터를 `await`로 바로 가져올 수 있다
- `useEffect` + `fetch` + 로딩 상태가 필요 없다

```tsx
export async function Sidebar() {
  const notes = await getNotes(); // 서버에서 바로 조회
  return <ul>{notes.map(...)}</ul>;
}
```

## 클라이언트 컴포넌트

파일 맨 위에 `"use client"`를 붙인다. 이럴 때 필요하다.

- `useState`, `useRef` 같은 **상태**
- `onClick` 같은 **이벤트 핸들러**
- `usePathname` 같은 **브라우저 훅**

## 경계는 최대한 아래로

사이드바 전체가 아니라, 현재 URL이 필요한 **링크 하나만** 클라이언트 컴포넌트로 분리했다.
`"use client"`는 가능한 한 **잎사귀(말단) 컴포넌트**에만 붙인다.

## 서버 → 클라이언트로 데이터 넘기기

```
page.tsx (서버) → getNote()로 조회 → props로 전달 → NoteEditor (클라이언트)
```

클라이언트 컴포넌트는 DB에 직접 접근할 수 없다. 서버가 가져와서 props로 넘겨준다.

## key로 상태 초기화

`useState(초기값)`은 컴포넌트가 **처음 만들어질 때 한 번만** 적용된다.
`/write?id=1` → `/write?id=2`로 이동하면 이전 내용이 남는다. `key={note.id}`를 주면 새로 만든다.
