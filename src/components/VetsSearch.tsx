"use client";

import { useState } from "react";

type Vet = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  distance: number | null;
  placeUrl: string;
};

export function VetsSearch() {
  const [vets, setVets] = useState<Vet[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function findNearby() {
    if (!navigator.geolocation) {
      setError("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `/api/vets?lat=${latitude}&lng=${longitude}`,
          );
          const data = await res.json();
          if (!res.ok) {
            const detail = data.status
              ? ` (status ${data.status}: ${data.detail ?? ""})`
              : "";
            throw new Error((data.error ?? "검색에 실패했습니다.") + detail);
          }
          setVets(data.vets);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "검색에 실패했습니다.",
          );
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("위치 권한을 허용해주세요.");
        setLoading(false);
      },
    );
  }

  return (
    <>
      <button
        onClick={findNearby}
        disabled={loading}
        className="mb-6 w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? "검색 중..." : "내 주변 동물병원 찾기"}
      </button>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {vets && vets.length === 0 && (
        <p className="text-sm text-zinc-400">
          주변 5km 내 동물병원을 찾지 못했습니다.
        </p>
      )}

      {vets && vets.length > 0 && (
        <ul className="flex flex-col gap-3">
          {vets.map((vet) => (
            <li key={vet.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <a
                href={vet.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-zinc-900 hover:underline"
              >
                {vet.name}
              </a>
              <p className="mt-1 text-sm text-zinc-500">{vet.address}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
                {vet.distance !== null && (
                  <span>{(vet.distance / 1000).toFixed(1)}km</span>
                )}
                {vet.phone && <span>{vet.phone}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
