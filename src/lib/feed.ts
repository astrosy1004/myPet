import type { ActivityLevel, Species } from "@/lib/types";

export const DEFAULT_KCAL_PER_100G = 350;

export function calculateRER(weightKg: number): number {
  return 70 * Math.pow(weightKg, 0.75);
}

// 종/활동량/중성화 여부에 따른 DER 계수 (참고용 근사치, 수의사 상담을 대체하지 않음)
export function getActivityFactor(
  species: Species,
  activityLevel: ActivityLevel,
  isNeutered: boolean,
): number {
  if (activityLevel === "low") return species === "cat" ? 1.0 : 1.4;
  if (activityLevel === "active") return species === "cat" ? 1.6 : 2.0;
  if (species === "cat") return isNeutered ? 1.2 : 1.4;
  return isNeutered ? 1.6 : 1.8;
}

export function calculateDailyFeed(params: {
  weightKg: number;
  species: Species;
  activityLevel: ActivityLevel;
  isNeutered: boolean;
  kcalPer100g: number;
}) {
  const rer = calculateRER(params.weightKg);
  const factor = getActivityFactor(
    params.species,
    params.activityLevel,
    params.isNeutered,
  );
  const der = rer * factor;
  const foodGrams = (der / params.kcalPer100g) * 100;

  return { rer, der, factor, foodGrams };
}
