import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PetCard } from "@/components/PetCard";
import type { Pet } from "@/lib/types";

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

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-lg font-bold text-zinc-900">🐾 행복한 집사생활</h1>
        <nav className="flex items-center gap-4">
          <Link
            href="/breeds"
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            품종 정보
          </Link>
          <Link
            href="/vets"
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            동물병원
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-zinc-500 hover:text-zinc-800"
            >
              로그아웃
            </button>
          </form>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-zinc-500">{user?.email}님, 환영합니다!</p>
          <Link
            href="/pets/new"
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
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
