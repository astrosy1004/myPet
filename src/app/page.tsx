import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-lg font-bold text-zinc-900">🐾 행복한 집사생활</h1>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            로그아웃
          </button>
        </form>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <p className="mb-8 text-sm text-zinc-500">
          {user?.email}님, 환영합니다!
        </p>

        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
          <p className="text-zinc-500">
            아직 등록된 반려동물이 없어요. 반려동물 등록 기능은 곧
            추가됩니다.
          </p>
        </div>
      </main>
    </div>
  );
}
