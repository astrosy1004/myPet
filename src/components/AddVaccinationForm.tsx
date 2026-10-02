"use client";

import { useActionState } from "react";
import { addVaccination } from "@/app/pets/health-actions";
import type { PetFormState } from "@/app/pets/actions";

const initialState: PetFormState = {};
const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none";
const labelClass = "mb-1 block text-xs font-medium text-zinc-500";

export function AddVaccinationForm({ petId }: { petId: string }) {
  const action = addVaccination.bind(null, petId);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>백신 이름</label>
          <input
            type="text"
            name="vaccine_name"
            required
            placeholder="예: 종합백신 1차"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>접종일</label>
          <input
            type="date"
            name="administered_date"
            required
            max={new Date().toISOString().split("T")[0]}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>다음 접종 예정일 (선택)</label>
        <input type="date" name="next_due_date" className={inputClass} />
      </div>
      <input
        type="text"
        name="notes"
        placeholder="메모 (선택)"
        className={inputClass}
      />
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
      >
        {isPending ? "저장 중..." : "접종 기록 추가"}
      </button>
    </form>
  );
}
