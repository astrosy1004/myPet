"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActivityLevel, Gender, Species } from "@/lib/types";

export type PetFormState = { error?: string };

type PetFields = {
  name: string;
  species: Species;
  breed: string | null;
  gender: Gender;
  birth_date: string | null;
  is_neutered: boolean;
  activity_level: ActivityLevel;
};

function parsePetFields(formData: FormData): PetFields | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const species = String(formData.get("species") ?? "");
  const breed = String(formData.get("breed") ?? "").trim();
  const gender = String(formData.get("gender") ?? "unknown");
  const birthDate = String(formData.get("birth_date") ?? "");
  const activityLevel = String(formData.get("activity_level") ?? "moderate");
  const isNeutered = formData.get("is_neutered") === "on";

  if (!name || !breed || !birthDate) {
    return { error: "이름, 품종, 생일은 필수 입력값입니다." };
  }
  if (species !== "cat" && species !== "dog") {
    return { error: "종을 선택해주세요." };
  }
  if (gender !== "male" && gender !== "female" && gender !== "unknown") {
    return { error: "성별을 선택해주세요." };
  }
  if (
    activityLevel !== "low" &&
    activityLevel !== "moderate" &&
    activityLevel !== "active"
  ) {
    return { error: "활동량을 선택해주세요." };
  }

  return {
    name,
    species,
    breed,
    gender,
    birth_date: birthDate,
    is_neutered: isNeutered,
    activity_level: activityLevel,
  };
}

async function uploadPetPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  petId: string,
  photo: File,
): Promise<string | null> {
  const ext = photo.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${petId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("pet-photos")
    .upload(path, photo, { upsert: true });

  if (uploadError) return null;

  const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function createPet(
  _prevState: PetFormState,
  formData: FormData,
): Promise<PetFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fields = parsePetFields(formData);
  if ("error" in fields) return fields;

  const weightKg = Number(formData.get("weight_kg"));
  if (!weightKg || weightKg <= 0) {
    return { error: "현재 체중을 올바르게 입력해주세요." };
  }

  const { data: pet, error } = await supabase
    .from("pets")
    .insert({ ...fields, user_id: user.id })
    .select()
    .single();

  if (error || !pet) {
    return { error: error?.message ?? "반려동물 등록에 실패했습니다." };
  }

  const { error: weightError } = await supabase
    .from("weight_logs")
    .insert({ pet_id: pet.id, weight_kg: weightKg });

  if (weightError) {
    return { error: weightError.message };
  }

  const photo = formData.get("photo") as File | null;
  if (photo && photo.size > 0) {
    const url = await uploadPetPhoto(supabase, user.id, pet.id, photo);
    if (url) {
      await supabase
        .from("pets")
        .update({ profile_image_url: url })
        .eq("id", pet.id);
    }
  }

  revalidatePath("/");
  redirect(`/pets/${pet.id}`);
}

export async function updatePet(
  petId: string,
  _prevState: PetFormState,
  formData: FormData,
): Promise<PetFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fields = parsePetFields(formData);
  if ("error" in fields) return fields;

  const update: PetFields & { profile_image_url?: string } = { ...fields };

  const photo = formData.get("photo") as File | null;
  if (photo && photo.size > 0) {
    const url = await uploadPetPhoto(supabase, user.id, petId, photo);
    if (url) update.profile_image_url = url;
  }

  const { error } = await supabase.from("pets").update(update).eq("id", petId);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath(`/pets/${petId}`);
  redirect(`/pets/${petId}`);
}

export async function deletePet(petId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("pets").delete().eq("id", petId);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}
