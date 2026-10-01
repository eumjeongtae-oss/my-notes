Tailwind는 모바일 우선이다. 앞에 아무것도 없는 클래스가 기본값이고, 화면이 넓어질 때 덮어쓴다.

## 반응형

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"></div>
```

| 접두어 | 의미            |
| ------ | --------------- |
| (없음) | 기본값 (모바일) |
| `sm:`  | 640px 이상      |
| `md:`  | 768px 이상      |
| `lg:`  | 1024px 이상     |

글쓰기 화면의 미리보기는 `hidden md:block`: 좁으면 숨기고 768px 이상에서만 보인다.

## 상태 variant

앞에 붙는 조건을 **variant**라고 부른다.

- `hover:bg-zinc-100`: 마우스를 올렸을 때
- `disabled:opacity-50`: 비활성화됐을 때
- `placeholder:text-zinc-300`: placeholder 글자

## group-hover

부모에 `group`을 붙이면 자식에서 "**부모**에 마우스가 올라갔을 때"를 표현할 수 있다.

```html
<a class="group">
  <h2 class="group-hover:underline">제목</h2>
</a>
```

## TypeScript satisfies

variant별 스타일 객체에 빠진 키가 없는지 검사하면서, 값의 실제 타입은 유지한다.

```ts
const styles = {
  grid: { ... },
  list: { ... },
} satisfies Record<NoteView, ...>;
```
