import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { VetsSearch } from "@/components/VetsSearch";

export default async function VetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
          🏥 근처 동물병원
        </h1>
        <span className="w-8 shrink-0 sm:w-12" />
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
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

        <VetsSearch />
      </main>
    </div>
  );
}
