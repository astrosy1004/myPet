"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightLog } from "@/lib/types";

export function WeightChart({ weightLogs }: { weightLogs: WeightLog[] }) {
  const data = [...weightLogs]
    .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
    .map((log) => ({
      date: log.recorded_at.slice(5),
      weight: log.weight_kg,
    }));

  if (data.length < 2) {
    return (
      <p className="text-sm text-zinc-400">
        체중을 2회 이상 기록하면 추이 그래프가 표시됩니다.
      </p>
    );
  }

  return (
    <div className="h-56 w-full rounded-2xl bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#a1a1aa" />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#a1a1aa"
            domain={["dataMin - 0.5", "dataMax + 0.5"]}
            unit="kg"
          />
          <Tooltip formatter={(value) => [`${value}kg`, "체중"]} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ r: 3, fill: "#f97316" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
