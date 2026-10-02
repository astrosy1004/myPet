import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PetCard } from "@/components/PetCard";
import { formatDday } from "@/lib/dday";
import type { Pet } from "@/lib/types";

type UpcomingVaccination = {
  vaccine_name: string;
  next_due_date: string;
  pets: { name: string } | null;
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pets } = await supabase
    .from("pets")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Pet[]>();

  const petIds = (pets ?? []).map((p) => p.id);

  const { data: upcomingRows } =
    petIds.length > 0
      ? await supabase
          .from("vaccinations")
          .select("vaccine_name, next_due_date, pets(name)")
          .in("pet_id", petIds)
          .not("next_due_date", "is", null)
          .order("next_due_date", { ascending: true })
          .limit(1)
          .returns<UpcomingVaccination[]>()
      : { data: null };

  const upcoming = upcomingRows?.[0];
  const isOverdue = upcoming
    ? new Date(upcoming.next_due_date) < new Date(new Date().toDateString())
    : false;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <h1 className="truncate text-base font-bold text-zinc-900 sm:text-lg">
          🐾 행복한 집사생활
        </h1>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            로그아웃
          </button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <p className="mb-4 truncate text-sm text-zinc-500">
          {user?.email}님, 환영합니다!
        </p>

        <div className="mb-6 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-6 text-white shadow-sm">
          <p className="text-sm font-medium text-orange-100">
            등록된 반려동물
          </p>
          <p className="text-5xl font-bold">{pets?.length ?? 0}마리</p>

          {upcoming && (
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
              <div className="min-w-0">
                <p className="text-xs text-orange-100">
                  {isOverdue ? "⚠️ 접종 예정일이 지났어요" : "💉 다음 접종"}
                </p>
                <p className="truncate text-sm font-semibold">
                  {upcoming.pets?.name} · {upcoming.vaccine_name}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-600">
                {formatDday(upcoming.next_due_date)}
              </span>
            </div>
          )}
        </div>

        <div className="mb-4 flex justify-end">
          <Link
            href="/pets/new"
            className="rounded-full bg-orange-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            + 반려동물 등록
          </Link>
        </div>

        {pets && pets.length > 0 ? (
          <div className="flex flex-col gap-3">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <p className="text-zinc-500">
              아직 등록된 반려동물이 없어요. 첫 반려동물을 등록해보세요!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
