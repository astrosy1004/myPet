"use client";

import { useActionState } from "react";
import { addWeightLog } from "@/app/pets/actions";
import type { PetFormState } from "@/app/pets/actions";

const initialState: PetFormState = {};

export function AddWeightForm({ petId }: { petId: string }) {
  const action = addWeightLog.bind(null, petId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          체중 (kg)
        </label>
        <input
          type="number"
          name="weight_kg"
          required
          step="0.1"
          min="0.1"
          className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
          placeholder="4.2"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-500">
          측정일
        </label>
        <input
          type="date"
          name="recorded_at"
          defaultValue={new Date().toISOString().split("T")[0]}
          max={new Date().toISOString().split("T")[0]}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
      >
        {isPending ? "저장 중..." : "기록 추가"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-red-500">{state.error}</p>
      )}
    </form>
  );
}
