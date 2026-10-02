import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PetCard } from "@/components/PetCard";
import { formatDday } from "@/lib/dday";
import { BookIcon, MapPinIcon, PawIcon } from "@/components/icons";
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
      <div className="bg-gradient-to-br from-orange-500 to-orange-400 px-4 pt-6 pb-10 text-white sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          <h1 className="truncate text-base font-bold sm:text-lg">
            🐾 행복한 집사생활
          </h1>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="shrink-0 text-sm text-orange-100 hover:text-white"
            >
              로그아웃
            </button>
          </form>
        </div>

        <div className="mx-auto mt-6 max-w-3xl">
          <p className="truncate text-sm text-orange-100">
            {user?.email}님, 환영합니다!
          </p>
          <p className="mt-3 text-sm font-medium text-orange-100">
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
      </div>

      <main className="mx-auto -mt-5 w-full max-w-3xl flex-1 rounded-t-3xl bg-white px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 flex gap-3 overflow-x-auto pb-1">
          <Link
            href="/pets/new"
            className="flex min-w-[128px] flex-col justify-between rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 p-4 text-white transition hover:brightness-105"
          >
            <PawIcon className="h-5 w-5" />
            <span className="mt-6 text-sm font-semibold">
              + 반려동물 등록
            </span>
          </Link>
          <Link
            href="/breeds"
            className="flex min-w-[128px] flex-col justify-between rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 p-4 text-white transition hover:brightness-105"
          >
            <BookIcon className="h-5 w-5" />
            <span className="mt-6 text-sm font-semibold">품종 정보</span>
          </Link>
          <Link
            href="/vets"
            className="flex min-w-[128px] flex-col justify-between rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 p-4 text-white transition hover:brightness-105"
          >
            <MapPinIcon className="h-5 w-5" />
            <span className="mt-6 text-sm font-semibold">동물병원 찾기</span>
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
