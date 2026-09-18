"use client";

import { useActionState, useState } from "react";
import { createPet, updatePet, type PetFormState } from "@/app/pets/actions";
import type { Pet, Species } from "@/lib/types";

const initialState: PetFormState = {};

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-zinc-700";

export type BreedOption = { species: Species; name: string };

export function PetForm({
  pet,
  breeds,
}: {
  pet?: Pet;
  breeds: BreedOption[];
}) {
  const action = pet ? updatePet.bind(null, pet.id) : createPet;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [species, setSpecies] = useState<Species>(pet?.species ?? "cat");

  const breedOptions = breeds
    .filter((b) => b.species === species)
    .map((b) => b.name);
  if (pet?.breed && !breedOptions.includes(pet.breed)) {
    breedOptions.unshift(pet.breed);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>이름</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={pet?.name}
          className={inputClass}
          placeholder="예: 나비"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>종</label>
          <select
            name="species"
            required
            value={species}
            onChange={(e) => setSpecies(e.target.value as Species)}
            className={inputClass}
          >
            <option value="cat">고양이</option>
            <option value="dog">강아지</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>성별</label>
          <select
            name="gender"
            required
            defaultValue={pet?.gender ?? "unknown"}
            className={inputClass}
          >
            <option value="male">수컷</option>
            <option value="female">암컷</option>
            <option value="unknown">미상</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>품종</label>
        <select
          name="breed"
          required
          defaultValue={pet?.breed ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            품종 선택
          </option>
          {breedOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>생일</label>
          <input
            type="date"
            name="birth_date"
            required
            defaultValue={pet?.birth_date ?? ""}
            max={new Date().toISOString().split("T")[0]}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>활동량</label>
          <select
            name="activity_level"
            defaultValue={pet?.activity_level ?? "moderate"}
            className={inputClass}
          >
            <option value="low">저활동</option>
            <option value="moderate">보통</option>
            <option value="active">활동적</option>
          </select>
        </div>
      </div>

      {!pet && (
        <div>
          <label className={labelClass}>현재 체중 (kg)</label>
          <input
            type="number"
            name="weight_kg"
            required
            step="0.1"
            min="0.1"
            className={inputClass}
            placeholder="예: 4.2"
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="is_neutered"
          defaultChecked={pet?.is_neutered}
          className="h-4 w-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-400"
        />
        중성화 완료
      </label>

      <div>
        <label className={labelClass}>프로필 사진 (선택)</label>
        {pet?.profile_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pet.profile_image_url}
            alt={pet.name}
            className="mb-2 h-16 w-16 rounded-full object-cover"
          />
        )}
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="w-full text-sm text-zinc-600"
        />
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
      >
        {isPending ? "저장 중..." : pet ? "수정하기" : "등록하기"}
      </button>
    </form>
  );
}
