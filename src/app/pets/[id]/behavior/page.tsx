import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BehaviorAnalyzer } from "@/components/BehaviorAnalyzer";
import type { Pet } from "@/lib/types";

type BehaviorAnalysisRow = {
  id: string;
  description: string | null;
  is_anomaly: boolean | null;
  created_at: string;
};

export default async function BehaviorPage({
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

  const { data: analyses } = await supabase
    .from("behavior_analyses")
    .select("id, description, is_anomaly, created_at")
    .eq("pet_id", id)
    .order("created_at", { ascending: false })
    .returns<BehaviorAnalysisRow[]>();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <Link
          href={`/pets/${pet.id}`}
          className="text-sm text-zinc-500 hover:text-zinc-800"
        >
          ← {pet.name}
        </Link>
        <h1 className="text-lg font-bold text-zinc-900">🎥 무슨 행동이니?</h1>
        <span className="w-12" />
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
        <BehaviorAnalyzer petId={pet.id} species={pet.species} />

        {analyses && analyses.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-sm font-semibold text-zinc-700">
              이전 분석 기록
            </h2>
            <ul className="flex flex-col gap-2">
              {analyses.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg bg-white px-4 py-2 text-sm shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-700">{a.description}</span>
                    <span className="text-xs text-zinc-400">
                      {new Date(a.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  {a.is_anomaly && (
                    <span className="mt-1 inline-block text-xs font-semibold text-red-500">
                      이상 징후 있음
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
