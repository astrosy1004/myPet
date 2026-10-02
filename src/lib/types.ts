export type Species = "cat" | "dog";
export type Gender = "male" | "female" | "unknown";
export type ActivityLevel = "low" | "moderate" | "active";

export type Pet = {
  id: string;
  user_id: string;
  name: string;
  species: Species;
  breed: string | null;
  gender: Gender;
  birth_date: string | null;
  is_neutered: boolean;
  activity_level: ActivityLevel;
  profile_image_url: string | null;
  created_at: string;
};

export type WeightLog = {
  id: string;
  pet_id: string;
  weight_kg: number;
  recorded_at: string;
  created_at: string;
};

export type Vaccination = {
  id: string;
  pet_id: string;
  vaccine_name: string;
  administered_date: string;
  next_due_date: string | null;
  notes: string | null;
  created_at: string;
};

export type VetVisit = {
  id: string;
  pet_id: string;
  visit_date: string;
  reason: string;
  diagnosis: string | null;
  notes: string | null;
  created_at: string;
};
