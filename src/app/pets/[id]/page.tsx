import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ACTIVITY_LABEL, GENDER_LABEL, SPECIES_LABEL } from "@/lib/labels";
import { formatAge } from "@/lib/age";
import { DeletePetButton } from "@/components/DeletePetButton";
import { AddWeightForm } from "@/components/AddWeightForm";
import { WeightChart } from "@/components/WeightChart";
import { FeedCalculator } from "@/components/FeedCalculator";
import type { Pet, WeightLog } from "@/lib/types";

export default async function PetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pet } = await supabase
    .from("pets")
    .select("*")
    .eq("id", id)
    .single<Pet>();

  if (!pet) notFound();

  const { data: weightLogs } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("pet_id", id)
    .order("recorded_at", { ascending: false })
    .returns<WeightLog[]>();

  const latestWeight = weightLogs?.[0]?.weight_kg;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← 목록으로
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href={`/pets/${pet.id}/sound`}
            className="text-sm font-medium text-orange-600 hover:underline"
          >
            🔊 울음 해석
          </Link>
          <Link
            href={`/pets/${pet.id}/edit`}
            className="text-sm font-medium text-orange-600 hover:underline"
          >
            수정
          </Link>
          <DeletePetButton petId={pet.id} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-4xl">
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
            <h1 className="text-2xl font-bold text-zinc-900">{pet.name}</h1>
            <p className="text-sm text-zinc-500">
              {SPECIES_LABEL[pet.species]} · {pet.breed ?? "품종 미등록"} ·{" "}
              {formatAge(pet.birth_date)}
            </p>
          </div>
        </div>

        <dl className="mb-8 grid grid-cols-2 gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-zinc-400">성별</dt>
            <dd className="font-medium text-zinc-900">
              {GENDER_LABEL[pet.gender]}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">중성화</dt>
            <dd className="font-medium text-zinc-900">
              {pet.is_neutered ? "완료" : "미완료"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">활동량</dt>
            <dd className="font-medium text-zinc-900">
              {ACTIVITY_LABEL[pet.activity_level]}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">현재 체중</dt>
            <dd className="font-medium text-zinc-900">
              {latestWeight ? `${latestWeight}kg` : "-"}
            </dd>
          </div>
        </dl>

        {latestWeight && (
          <div className="mb-8">
            <FeedCalculator
              weightKg={latestWeight}
              species={pet.species}
              activityLevel={pet.activity_level}
              isNeutered={pet.is_neutered}
            />
          </div>
        )}

        <h2 className="mb-3 text-lg font-semibold text-zinc-900">체중 기록</h2>

        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <AddWeightForm petId={pet.id} />
        </div>

        {weightLogs && weightLogs.length > 0 && (
          <div className="mb-4">
            <WeightChart weightLogs={weightLogs} />
          </div>
        )}

        {weightLogs && weightLogs.length > 0 ? (
          <ul className="divide-y divide-zinc-100 rounded-2xl bg-white shadow-sm">
            {weightLogs.map((log) => (
              <li
                key={log.id}
                className="flex items-center justify-between px-5 py-3 text-sm"
              >
                <span className="text-zinc-500">{log.recorded_at}</span>
                <span className="font-medium text-zinc-900">
                  {log.weight_kg}kg
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400">체중 기록이 없습니다.</p>
        )}
      </main>
    </div>
  );
}
