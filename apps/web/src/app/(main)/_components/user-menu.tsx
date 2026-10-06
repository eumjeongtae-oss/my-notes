"use client";

// 헤더 오른쪽의 프로필 사진 버튼과 메뉴 (이름, 이메일, 로그아웃).
//
// HTML 기본 <details>로 만든다. <summary>를 누르면 열리고 닫히는 걸 브라우저가 해 준다 (라이브러리 없음).
// <details>는 바깥을 눌러도, Esc를 눌러도 닫히지 않아서 그 두 가지만 직접 붙인다.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { logout } from "@/api/browser";
import { getErrorMessage } from "@/api/errors";

export function UserMenu({
  name,
  email,
  picture,
}: {
  name: string;
  email: string;
  picture: string | null;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // 열려 있을 때만: 메뉴 바깥을 누르거나 Esc를 누르면 닫는다
  useEffect(() => {
    if (!open) return;
    const close = () => {
      if (detailsRef.current) detailsRef.current.open = false;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    // 닫히면(open이 false가 되면) 듣기를 그만둔다
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // React Query가 기억하는 데이터(내 노트 목록 등)를 모두 지운다.
      // 안 지우면 같은 브라우저에서 다른 계정으로 로그인했을 때 앞 사람의 목록이 잠깐 보일 수 있다
      queryClient.clear();
      toast.success("로그아웃했어요");
      router.replace("/login");
    },
  });

  return (
    <details
      ref={detailsRef}
      // 열고 닫힐 때마다 상태를 맞춘다 (바깥 클릭 감지를 켜고 끄려고)
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="relative"
    >
      {/* list-none: <summary> 앞의 기본 삼각형(▶)을 없앤다 */}
      <summary
        aria-label="내 메뉴"
        className="flex cursor-pointer list-none items-center rounded-full ring-zinc-300 hover:ring-2 [&::-webkit-details-marker]:hidden"
      >
        <Avatar name={name} picture={picture} />
      </summary>

      <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white py-2 shadow-lg ring-1 ring-zinc-200">
        <div className="px-4 py-2">
          <p className="truncate font-semibold">{name}</p>
          <p className="truncate text-sm text-zinc-500">{email}</p>
        </div>
        <hr className="my-1 border-zinc-100" />
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50 disabled:opacity-50"
        >
          {logoutMutation.isPending ? "로그아웃 중…" : "로그아웃"}
        </button>
        {logoutMutation.isError && (
          <p role="alert" className="px-4 pb-1 text-sm text-red-500">
            {getErrorMessage(logoutMutation.error)}
          </p>
        )}
      </div>
    </details>
  );
}

// 프로필 사진. 사진이 없는 계정은 이름 첫 글자를 동그라미 안에 보여준다
function Avatar({ name, picture }: { name: string; picture: string | null }) {
  if (picture) {
    return (
      <Image
        src={picture}
        alt=""
        width={32}
        height={32}
        className="size-8 rounded-full"
      />
    );
  }
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
      {name.slice(0, 1)}
    </span>
  );
}
