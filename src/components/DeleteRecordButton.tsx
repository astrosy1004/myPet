"use client";

import { useTransition } from "react";
import { TrashIcon } from "@/components/icons";

export function DeleteRecordButton({
  onDelete,
}: {
  onDelete: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("이 기록을 삭제하시겠습니까?")) return;
    startTransition(() => {
      onDelete();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
    >
      <TrashIcon className="h-3.5 w-3.5" />
    </button>
  );
}
