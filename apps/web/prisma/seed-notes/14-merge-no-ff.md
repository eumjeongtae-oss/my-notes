기능 브랜치를 main에 합칠 때 --no-ff로 merge 커밋을 남겼다.

## fast-forward vs --no-ff

main이 그동안 바뀌지 않았으면 git은 **fast-forward**를 한다. main의 위치 표시만 앞으로 옮겨서 기록이 한 줄로 이어진다. 어디부터 어디까지가 한 기능인지 구분이 안 된다.

`--no-ff`를 붙이면 **합친 지점에 merge 커밋**이 생겨서 기능 단위가 가지로 묶여 보인다.

```bash
git switch main
git merge --no-ff feat/write-page
git branch -d feat/write-page
```

```
*   Merge branch 'feat/write-page'
|\
| * feat: /write?id=로 기존 노트 수정 화면 열기
| * feat: 툴바에 이미지 주소 넣기 버튼 추가
|/
*   Merge branch 'feat/layout'
```

GitHub PR의 "Merge pull request" 버튼이 만드는 것도 이 merge 커밋이다.

## Merge vs Squash

| 방법   | 결과                   | 언제                         |
| ------ | ---------------------- | ---------------------------- |
| Merge  | 커밋들이 그대로 들어감 | 커밋 하나하나가 의미 있을 때 |
| Squash | 하나로 뭉쳐서 들어감   | 중간 커밋이 지저분할 때      |

## 브랜치 크기

첫 브랜치는 커밋이 12개나 쌓였다. 실무 기준으로 큰 PR이라 리뷰가 어렵다.
**브랜치 하나에 기능 하나**로 작게 끊는다.

```bash
git log --oneline --graph   # 그래프로 보기
```
