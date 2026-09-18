import Link from "next/link";
import type { Pet } from "@/lib/types";
import { SPECIES_LABEL } from "@/lib/labels";
import { formatAge } from "@/lib/age";

export function PetCard({ pet }: { pet: Pet }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link
        href={`/pets/${pet.id}`}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-2xl">
          {pet.profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pet.profile_image_url}
              alt={pet.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{pet.species === "cat" ? "🐱" : "🐶"}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-900">{pet.name}</p>
          <p className="truncate text-sm text-zinc-500">
            {SPECIES_LABEL[pet.species]} · {pet.breed ?? "품종 미등록"} ·{" "}
            {formatAge(pet.birth_date)}
          </p>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/pets/${pet.id}/sound`}
          title="무슨 말이니? (울음 해석)"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-xl transition hover:scale-105 hover:bg-orange-100"
        >
          🔊
        </Link>
        <Link
          href={`/pets/${pet.id}/behavior`}
          title="무슨 행동이니? (행동 분석)"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-xl transition hover:scale-105 hover:bg-sky-100"
        >
          🎥
        </Link>
      </div>
    </div>
  );
}
