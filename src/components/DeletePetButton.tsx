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
      className="text-sm font-medium text-red-500 hover:underline disabled:opacity-50"
    >
      {isPending ? "삭제 중..." : "삭제"}
    </button>
  );
}
