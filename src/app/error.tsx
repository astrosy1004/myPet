"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl">😿</p>
      <h1 className="text-xl font-bold text-zinc-900">문제가 발생했어요</h1>
      <p className="text-sm text-zinc-500">
        일시적인 오류일 수 있어요. 다시 시도해주세요.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        다시 시도
      </button>
    </div>
  );
}
