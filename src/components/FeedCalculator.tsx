"use client";

import { useState } from "react";
import { calculateDailyFeed, DEFAULT_KCAL_PER_100G } from "@/lib/feed";
import type { ActivityLevel, Species } from "@/lib/types";

export function FeedCalculator({
  weightKg,
  species,
  activityLevel,
  isNeutered,
}: {
  weightKg: number;
  species: Species;
  activityLevel: ActivityLevel;
  isNeutered: boolean;
}) {
  const [kcalPer100g, setKcalPer100g] = useState(DEFAULT_KCAL_PER_100G);

  const { der, foodGrams } = calculateDailyFeed({
    weightKg,
    species,
    activityLevel,
    isNeutered,
    kcalPer100g,
  });

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">
          🍽️ 오늘의 사료량
        </h2>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <label htmlFor="kcal">사료 칼로리</label>
          <input
            id="kcal"
            type="number"
            min="100"
            step="10"
            value={kcalPer100g}
            onChange={(e) => setKcalPer100g(Number(e.target.value) || 0)}
            className="w-20 rounded-lg border border-zinc-300 px-2 py-1 text-right focus:border-orange-400 focus:outline-none"
          />
          <span>kcal/100g</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-orange-600">
          {foodGrams > 0 ? foodGrams.toFixed(0) : "-"}
        </span>
        <span className="text-zinc-500">g / 일</span>
      </div>
      <p className="mt-1 text-xs text-zinc-400">
        일일 에너지 요구량(DER) 약 {der.toFixed(0)}kcal 기준 · 참고용
        추정치이며 정확한 급여량은 수의사와 상담하세요.
      </p>
    </div>
  );
}
