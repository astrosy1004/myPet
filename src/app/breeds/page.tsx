import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SPECIES_LABEL } from "@/lib/labels";
import type { Species } from "@/lib/types";

type Breed = {
  id: string;
  species: Species;
  name: string;
  avg_lifespan: string | null;
  size: string | null;
  temperament_tags: string[] | null;
  care_notes: string | null;
};

export default async function BreedsPage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string; q?: string }>;
}) {
  const { species, q } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from("breeds").select("*").order("name");
  if (species === "cat" || species === "dog") {
    query = query.eq("species", species);
  }
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: breeds } = await query.returns<Breed[]>();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href={user ? "/" : "/login"}
          className="shrink-0 text-sm text-zinc-500 hover:text-zinc-800"
        >
          {user ? "← 홈으로" : "← 로그인"}
        </Link>
        <h1 className="truncate text-base font-bold text-zinc-900 sm:text-lg">
          📖 품종 정보
        </h1>
        <span className="w-8 shrink-0 sm:w-12" />
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {!user && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
            <span>회원가입하면 반려동물을 등록하고 더 많은 기능을 쓸 수 있어요.</span>
            <Link
              href="/signup"
              className="shrink-0 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-orange-600"
            >
              회원가입
            </Link>
          </div>
        )}

        <form method="get" className="mb-6 flex flex-wrap gap-3">
          <select
            name="species"
            defaultValue={species ?? ""}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
          >
            <option value="">전체</option>
            <option value="cat">고양이</option>
            <option value="dog">강아지</option>
          </select>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="품종 이름 검색"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            검색
          </button>
        </form>

        {breeds && breeds.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {breeds.map((breed) => (
              <div key={breed.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-semibold text-zinc-900">
                    {breed.species === "cat" ? "🐱" : "🐶"} {breed.name}
                  </h2>
                  <span className="text-xs text-zinc-400">
                    {SPECIES_LABEL[breed.species]}
                  </span>
                </div>
                <p className="mb-2 text-xs text-zinc-500">
                  평균 수명 {breed.avg_lifespan ?? "-"} · 크기{" "}
                  {breed.size ?? "-"}
                </p>
                {breed.temperament_tags && breed.temperament_tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {breed.temperament_tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {breed.care_notes && (
                  <p className="text-xs text-zinc-500">{breed.care_notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">검색 결과가 없습니다.</p>
        )}
      </main>
    </div>
  );
}
