import Link from "next/link";
import type { Pet } from "@/lib/types";
import { SPECIES_LABEL } from "@/lib/labels";
import { formatAge } from "@/lib/age";

export function PetCard({ pet }: { pet: Pet }) {
  return (
    <Link
      href={`/pets/${pet.id}`}
      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
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
      <div>
        <p className="font-semibold text-zinc-900">{pet.name}</p>
        <p className="text-sm text-zinc-500">
          {SPECIES_LABEL[pet.species]} · {pet.breed ?? "품종 미등록"} ·{" "}
          {formatAge(pet.birth_date)}
        </p>
      </div>
    </Link>
  );
}
