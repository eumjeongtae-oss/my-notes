import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// remark-gfm: 표, 체크박스(- [ ]), 취소선 같은 GitHub 스타일 문법을 지원한다.
// react-markdown은 기본적으로 HTML 태그를 렌더링하지 않아서 XSS에 안전하다.
export function MarkdownPreview({ content }: { content: string }) {
  return (
    <article className="prose max-w-none prose-zinc">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </article>
  );
}
