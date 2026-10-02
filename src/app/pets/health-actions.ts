"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PetFormState } from "@/app/pets/actions";

export async function addVaccination(
  petId: string,
  _prevState: PetFormState,
  formData: FormData,
): Promise<PetFormState> {
  const supabase = await createClient();

  const vaccineName = String(formData.get("vaccine_name") ?? "").trim();
  const administeredDate = String(formData.get("administered_date") ?? "");
  const nextDueDate = String(formData.get("next_due_date") ?? "") || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!vaccineName || !administeredDate) {
    return { error: "백신 이름과 접종일은 필수입니다." };
  }

  const { error } = await supabase.from("vaccinations").insert({
    pet_id: petId,
    vaccine_name: vaccineName,
    administered_date: administeredDate,
    next_due_date: nextDueDate,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath(`/pets/${petId}/health`);
  return {};
}

export async function deleteVaccination(
  petId: string,
  vaccinationId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("vaccinations")
    .delete()
    .eq("id", vaccinationId);
  if (error) throw new Error(error.message);
  revalidatePath(`/pets/${petId}/health`);
}

export async function addVetVisit(
  petId: string,
  _prevState: PetFormState,
  formData: FormData,
): Promise<PetFormState> {
  const supabase = await createClient();

  const visitDate = String(formData.get("visit_date") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const diagnosis = String(formData.get("diagnosis") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!visitDate || !reason) {
    return { error: "방문일과 방문 사유는 필수입니다." };
  }

  const { error } = await supabase.from("vet_visits").insert({
    pet_id: petId,
    visit_date: visitDate,
    reason,
    diagnosis,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath(`/pets/${petId}/health`);
  return {};
}

export async function deleteVetVisit(
  petId: string,
  visitId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("vet_visits")
    .delete()
    .eq("id", visitId);
  if (error) throw new Error(error.message);
  revalidatePath(`/pets/${petId}/health`);
}
