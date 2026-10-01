"use client";

// React Query를 앱 전체에 연결한다. (공식 문서의 Next.js App Router 설정 방식)
//
// QueryClient는 "요청 결과를 보관하는 창고"다.
// QueryClientProvider는 React Context를 쓰므로 클라이언트 컴포넌트여야 한다.
// 그래서 이 파일을 따로 두고, 서버 컴포넌트인 layout.tsx에서 감싼다.
// 감싸도 그 안의 페이지들은 여전히 서버 컴포넌트로 동작한다.
import {
  environmentManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 받아온 데이터를 1분 동안은 "신선하다"고 보고 다시 요청하지 않는다
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  // 서버: 요청마다 새로 만든다. 하나를 공유하면 다른 사용자의 데이터가 섞일 수 있다
  if (environmentManager.isServer()) {
    return makeQueryClient();
  }
  // 브라우저: 하나만 만들어서 계속 쓴다. 페이지를 이동해도 캐시가 유지된다
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 토스트가 그려지는 자리. 루트 레이아웃에 있어서 페이지를 이동해도 토스트가 남아 있다.
          저장 버튼이 아래쪽에 있어서 아래 가운데에 띄운다 */}
      <Toaster position="bottom-center" richColors />
      {/* 개발할 때만 화면 구석에 나타난다. 운영 빌드에는 자동으로 빠진다 */}
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
