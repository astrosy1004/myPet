import { createClient } from "@/lib/supabase/server";
import { PetForm, type BreedOption } from "@/components/PetForm";

export default async function NewPetPage() {
  const supabase = await createClient();
  const { data: breeds } = await supabase
    .from("breeds")
    .select("species, name")
    .order("name")
    .returns<BreedOption[]>();

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-10">
      <h1 className="mb-6 text-xl font-bold text-zinc-900">반려동물 등록</h1>
      <PetForm breeds={breeds ?? []} />
    </div>
  );
}
