"use client";

import { useState } from "react";
import type { Species } from "@/lib/types";

const MAX_DURATION_SEC = 30;
const FRAME_INTERVAL_SEC = 1.5;
const MAX_FRAMES = 12;
const FRAME_WIDTH = 480;
const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100MB

type Result = { description: string; isAnomaly: boolean; reason: string | null };

function seekTo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    function onSeeked() {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    }
    video.addEventListener("seeked", onSeeked);
    video.currentTime = time;
  });
}

function extractFrames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = async () => {
      try {
        const duration = Math.min(video.duration || 0, MAX_DURATION_SEC);
        const times: number[] = [];
        for (let t = 0; t < duration; t += FRAME_INTERVAL_SEC) times.push(t);

        const step = Math.max(1, Math.ceil(times.length / MAX_FRAMES));
        const sampledTimes = times
          .filter((_, i) => i % step === 0)
          .slice(0, MAX_FRAMES);

        const canvas = document.createElement("canvas");
        canvas.width = FRAME_WIDTH;
        canvas.height =
          Math.round((video.videoHeight / video.videoWidth) * FRAME_WIDTH) ||
          360;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("캔버스를 사용할 수 없습니다.");

        const frames: string[] = [];
        for (const t of sampledTimes) {
          await seekTo(video, t);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL("image/jpeg", 0.7));
        }

        URL.revokeObjectURL(video.src);
        resolve(frames);
      } catch (err) {
        reject(err instanceof Error ? err : new Error("프레임 추출 실패"));
      }
    };

    video.onerror = () => reject(new Error("영상을 불러오지 못했습니다."));
  });
}

export function BehaviorAnalyzer({
  petId,
  species,
}: {
  petId: string;
  species: Species;
}) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [frames, setFrames] = useState<string[] | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    if (file.size > MAX_FILE_BYTES) {
      setError("영상 파일은 100MB 이하만 업로드할 수 있습니다.");
      e.target.value = "";
      return;
    }

    setVideoUrl(URL.createObjectURL(file));
    setFrames(null);
    setExtracting(true);

    try {
      const extracted = await extractFrames(file);
      if (extracted.length === 0) {
        throw new Error("영상에서 프레임을 추출하지 못했습니다.");
      }
      setFrames(extracted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "프레임 추출에 실패했습니다.");
    } finally {
      setExtracting(false);
    }
  }

  async function analyze() {
    if (!frames) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/behavior-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pet_id: petId, species, frames }),
      });
      const data = await res.json();

      if (!res.ok) {
        const detail = data.status
          ? ` (status ${data.status}: ${data.detail ?? ""})`
          : "";
        throw new Error((data.error ?? "분석에 실패했습니다.") + detail);
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석에 실패했습니다.");
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() {
    setVideoUrl(null);
    setFrames(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="mb-2 text-sm text-zinc-500">
        최대 {MAX_DURATION_SEC}초 분량의 mp4/mov 영상(100MB 이하)을
        업로드해주세요. 영상에서 {FRAME_INTERVAL_SEC}초 간격으로 프레임을
        추출해 분석합니다.
      </p>
      <p className="mb-4 text-xs text-zinc-400">
        🔒 영상에서 추출한 이미지 프레임은 분석을 위해 OpenAI 서버로
        전송되며, 원본 영상은 서버에 저장되지 않습니다.
      </p>

      {!videoUrl && (
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleFileChange}
          className="w-full text-sm text-zinc-600"
        />
      )}

      {videoUrl && (
        <div className="flex flex-col gap-3">
          <video controls src={videoUrl} className="w-full rounded-lg" />

          {extracting && (
            <p className="text-sm text-zinc-400">프레임 추출 중...</p>
          )}

          {frames && (
            <div className="flex gap-1 overflow-x-auto rounded-lg bg-zinc-50 p-2">
              {frames.map((frame, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={frame}
                  alt={`프레임 ${i + 1}`}
                  className="h-14 w-20 shrink-0 rounded object-cover"
                />
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              다시 선택
            </button>
            <button
              type="button"
              onClick={analyze}
              disabled={!frames || analyzing}
              className="flex-1 rounded-lg bg-sky-500 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
            >
              {analyzing ? "분석 중..." : "분석하기"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {result && (
        <div
          className={`mt-4 flex flex-col items-center gap-3 rounded-2xl p-6 text-center ${
            result.isAnomaly
              ? "bg-gradient-to-b from-red-50 to-white"
              : "bg-gradient-to-b from-emerald-50 to-white"
          }`}
        >
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-inner ${
              result.isAnomaly ? "bg-red-100" : "bg-emerald-100"
            }`}
          >
            {result.isAnomaly ? "⚠️" : "🐾"}
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              result.isAnomaly
                ? "bg-red-100 text-red-600"
                : "bg-emerald-100 text-emerald-600"
            }`}
          >
            이상 징후 {result.isAnomaly ? "있음" : "없음"}
          </span>

          <p className="text-base font-bold text-zinc-800">
            {result.description}
          </p>

          {result.reason && (
            <p className="text-sm text-zinc-600">{result.reason}</p>
          )}
          <p className="text-xs text-zinc-400">
            ⚠️ 참고용 추정치입니다. 정확한 진단은 수의사와 상담하세요.
          </p>
        </div>
      )}
    </div>
  );
}
