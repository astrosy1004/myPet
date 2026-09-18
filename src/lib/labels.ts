import type { ActivityLevel, Gender, Species } from "@/lib/types";

export const SPECIES_LABEL: Record<Species, string> = {
  cat: "고양이",
  dog: "강아지",
};

export const GENDER_LABEL: Record<Gender, string> = {
  male: "수컷",
  female: "암컷",
  unknown: "미상",
};

export const ACTIVITY_LABEL: Record<ActivityLevel, string> = {
  low: "저활동",
  moderate: "보통",
  active: "활동적",
};
