import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WeightChart } from "@/components/WeightChart";
import { AddVaccinationForm } from "@/components/AddVaccinationForm";
import { AddVetVisitForm } from "@/components/AddVetVisitForm";
import { DeleteRecordButton } from "@/components/DeleteRecordButton";
import { deleteVaccination, deleteVetVisit } from "@/app/pets/health-actions";
import { formatDday } from "@/lib/dday";
import { HealthIcon } from "@/components/icons";
import type { Pet, Vaccination, VetVisit, WeightLog } from "@/lib/types";

export default async function HealthPage({
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

  const [{ data: weightLogs }, { data: vaccinations }, { data: vetVisits }] =
    await Promise.all([
      supabase
        .from("weight_logs")
        .select("*")
        .eq("pet_id", id)
        .order("recorded_at", { ascending: false })
        .returns<WeightLog[]>(),
      supabase
        .from("vaccinations")
        .select("*")
        .eq("pet_id", id)
        .order("administered_date", { ascending: false })
        .returns<Vaccination[]>(),
      supabase
        .from("vet_visits")
        .select("*")
        .eq("pet_id", id)
        .order("visit_date", { ascending: false })
        .returns<VetVisit[]>(),
    ]);

  const upcoming = (vaccinations ?? [])
    .filter(
      (v): v is Vaccination & { next_due_date: string } =>
        v.next_due_date !== null,
    )
    .sort((a, b) => (a.next_due_date < b.next_due_date ? -1 : 1))[0];

  const isOverdue = upcoming
    ? new Date(upcoming.next_due_date) < new Date(new Date().toDateString())
    : false;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href={`/pets/${pet.id}`}
          className="shrink-0 truncate text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← {pet.name}
        </Link>
        <h1 className="flex items-center justify-center gap-1.5 truncate text-base font-bold text-zinc-900 sm:text-lg">
          <HealthIcon className="h-5 w-5 shrink-0 text-emerald-500" />
          건강 관리
        </h1>
        <span className="w-8 shrink-0 sm:w-12" />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {upcoming && (
          <div
            className={`mb-6 flex items-center justify-between gap-3 rounded-2xl p-4 ${
              isOverdue ? "bg-red-50" : "bg-orange-50"
            }`}
          >
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${
                  isOverdue ? "text-red-600" : "text-orange-700"
                }`}
              >
                {isOverdue ? "⚠️ 접종 예정일이 지났어요" : "💉 다음 접종 예정"}
              </p>
              <p className="truncate text-xs text-zinc-500">
                {upcoming.vaccine_name} · {upcoming.next_due_date}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white ${
                isOverdue ? "bg-red-500" : "bg-orange-500"
              }`}
            >
              {formatDday(upcoming.next_due_date)}
            </span>
          </div>
        )}

        <h2 className="mb-1 text-lg font-semibold text-zinc-900">
          📈 성장 그래프
        </h2>
        <p className="mb-3 text-xs text-zinc-400">
          품종별 표준 체중 데이터가 없어 비교 곡선 없이, 실제 체중 변화만
          보여드려요.
        </p>
        <div className="mb-8">
          {weightLogs && weightLogs.length > 0 ? (
            <WeightChart weightLogs={weightLogs} />
          ) : (
            <p className="text-sm text-zinc-400">체중 기록이 없습니다.</p>
          )}
        </div>

        <h2 className="mb-3 text-lg font-semibold text-zinc-900">
          💉 예방접종 기록
        </h2>
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <AddVaccinationForm petId={pet.id} />
        </div>
        {vaccinations && vaccinations.length > 0 ? (
          <ul className="mb-8 flex flex-col gap-2">
            {vaccinations.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-white px-4 py-3 text-sm shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-800">
                    {v.vaccine_name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    접종일 {v.administered_date}
                    {v.next_due_date && ` · 다음 ${v.next_due_date}`}
                  </p>
                  {v.notes && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {v.notes}
                    </p>
                  )}
                </div>
                <DeleteRecordButton
                  onDelete={deleteVaccination.bind(null, pet.id, v.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-8 text-sm text-zinc-400">접종 기록이 없습니다.</p>
        )}

        <h2 className="mb-3 text-lg font-semibold text-zinc-900">
          🏥 병원 방문 기록
        </h2>
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <AddVetVisitForm petId={pet.id} />
        </div>
        {vetVisits && vetVisits.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {vetVisits.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-white px-4 py-3 text-sm shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-800">
                    {v.reason}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {v.visit_date}
                    {v.diagnosis && ` · ${v.diagnosis}`}
                  </p>
                  {v.notes && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {v.notes}
                    </p>
                  )}
                </div>
                <DeleteRecordButton
                  onDelete={deleteVetVisit.bind(null, pet.id, v.id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-400">방문 기록이 없습니다.</p>
        )}
      </main>
    </div>
  );
}
