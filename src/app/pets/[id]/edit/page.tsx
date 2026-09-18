import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PetForm, type BreedOption } from "@/components/PetForm";
import type { Pet } from "@/lib/types";

export default async function EditPetPage({
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

  const { data: breeds } = await supabase
    .from("breeds")
    .select("species, name")
    .order("name")
    .returns<BreedOption[]>();

  return (
    <div className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-6 text-xl font-bold text-zinc-900">
        반려동물 정보 수정
      </h1>
      <PetForm pet={pet} breeds={breeds ?? []} />
    </div>
  );
}
