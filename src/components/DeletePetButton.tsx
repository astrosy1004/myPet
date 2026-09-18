"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePet } from "@/app/pets/actions";

export function DeletePetButton({ petId }: { petId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;

    startTransition(async () => {
      await deletePet(petId);
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      title="삭제"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-lg transition hover:bg-red-100 disabled:opacity-50"
    >
      {isPending ? "⏳" : "🗑️"}
    </button>
  );
}
