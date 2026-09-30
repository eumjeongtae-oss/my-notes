클래스에 마우스를 올리면 Tailwind CSS IntelliSense가 실제 CSS를 보여준다. 모르는 클래스는 이걸로 확인한다.

## 자주 쓰는 클래스

| 분류     | 클래스                                                                |
| -------- | --------------------------------------------------------------------- |
| 레이아웃 | `flex`, `grid`, `gap-4`, `items-center`, `justify-between`            |
| 여백     | `p-4`, `px-2`, `mt-8`, `space-y-4`                                    |
| 크기     | `w-64`, `h-full`, `size-8`, `max-w-3xl`, `min-w-0`                    |
| 글자     | `text-sm`, `font-bold`, `leading-relaxed`, `truncate`, `line-clamp-3` |
| 모양     | `rounded-xl`, `shadow-sm`, `ring-1`, `border-b`                       |

## 알아두면 좋은 것

- `size-8` = `w-8 h-8`. 정사각형은 한 번에 쓴다
- `text-[15px]`처럼 **대괄호**로 임의의 값을 줄 수 있다
- `truncate`: 한 줄에서 넘치면 `...`
- `line-clamp-3`: 3줄에서 자르고 `...`
- `break-keep`: 한글 단어가 중간에서 잘리지 않게 (한국어 서비스에서 자주 씀)

## 가운데 정렬 컨테이너

```html
<div class="mx-auto max-w-5xl px-4"></div>
```

- `max-w-5xl`: 최대 너비 1024px
- `mx-auto`: 좌우 여백 자동 → 가운데
- `px-4`: 좁은 화면에서 가장자리에 붙지 않게

## 가독성을 위한 값

- 본문 폭은 약 **768px** (`max-w-3xl`). 한 줄이 너무 길면 눈이 다음 줄을 찾기 어렵다
- 오래 읽는 본문은 `prose-lg` (18px, 줄 간격 약 1.8)
