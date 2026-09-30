App Router에서는 폴더 구조가 곧 URL이다. 폴더 모양 네 가지만 알면 된다.

## 폴더 규칙

| 폴더 모양     | 의미                                                 | 예                     |
| ------------- | ---------------------------------------------------- | ---------------------- |
| `notes`       | URL 경로가 된다                                      | `/notes`               |
| `[id]`        | 동적 경로                                            | `/notes/1`, `/notes/2` |
| `(main)`      | **라우트 그룹**. URL에 안 나타나고 레이아웃만 묶는다 | -                      |
| `_components` | **private 폴더**. 라우팅에서 완전히 제외             | -                      |

## 특별한 파일

- `page.tsx`: 그 경로의 화면
- `layout.tsx`: 하위 페이지들이 공유하는 틀. **페이지를 이동해도 다시 그려지지 않는다**

## 이 프로젝트의 구조

```
app/
  layout.tsx            ← 루트 (폰트, html/body)
  (main)/               ← 헤더가 있는 화면들
    layout.tsx          ← 헤더
    _components/        ← (main)에서만 쓰는 컴포넌트
    page.tsx            ← 홈 /
    notes/[id]/page.tsx ← 읽기 /notes/1
  write/                ← 헤더 없는 전체 화면
    _components/
    page.tsx            ← 글쓰기 /write
```

## 컴포넌트 위치 규칙 (colocation)

- 한 라우트에서만 쓰면 → 그 폴더의 `_components/`
- 여러 라우트에서 같이 쓰면 → `src/components/`
- 기준: **그 컴포넌트를 쓰는 곳들의 가장 가까운 공통 부모 폴더**

## Next 16에서 달라진 점

`params`, `searchParams`가 **Promise**라서 `await`로 꺼낸다.

```tsx
export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
}
```
