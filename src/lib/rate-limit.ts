import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// 반려동물 소유 관계를 거쳐 최근 N분 내 사용자의 분석 요청 수를 세어
// 남용/오작동으로 인한 OpenAI 비용 급증을 막는다.
export async function checkRateLimit(
  supabase: SupabaseServerClient,
  userId: string,
  table: "sound_analyses" | "behavior_analyses",
  limit: number,
  windowMinutes: number,
): Promise<boolean> {
  const { data: pets } = await supabase.from("pets").select("id").eq("user_id", userId);
  const petIds = (pets ?? []).map((p) => p.id as string);
  if (petIds.length === 0) return true;

  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .in("pet_id", petIds)
    .gte("created_at", since);

  return (count ?? 0) < limit;
}
