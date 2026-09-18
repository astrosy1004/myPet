"use client";

import { useRef, useState } from "react";
import { audioBufferToWav } from "@/lib/wav-encoder";
import { SOUND_CATEGORY_LABEL } from "@/lib/labels";
import type { Species } from "@/lib/types";

const MAX_SECONDS = 30;

type Result = { category: string; confidence: number; reason: string | null };

export function SoundAnalyzer({
  petId,
  species,
}: {
  petId: string;
  species: Species;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  async function startRecording() {
    setError(null);
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        stopTimer();
        setIsRecording(false);

        const webmBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        try {
          const arrayBuffer = await webmBlob.arrayBuffer();
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          const audioContext = new AudioContextClass();
          const decoded = await audioContext.decodeAudioData(arrayBuffer);
          const wavBlob = audioBufferToWav(decoded);
          setAudioBlob(wavBlob);
          setAudioUrl(URL.createObjectURL(wavBlob));
        } catch {
          setError("녹음 파일을 변환하지 못했습니다. 다시 시도해주세요.");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev + 1 >= MAX_SECONDS) {
            recorder.stop();
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError("마이크 권한을 허용해주세요.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
  }

  async function analyze() {
    if (!audioBlob) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      const ext = audioBlob.type.includes("wav") ? "wav" : "mp3";
      formData.append("audio", audioBlob, `recording.${ext}`);
      formData.append("pet_id", petId);
      formData.append("species", species);

      const res = await fetch("/api/sound-analysis", {
        method: "POST",
        body: formData,
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
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="mb-4 text-sm text-zinc-500">
        최대 {MAX_SECONDS}초까지 녹음하거나 mp3/wav 파일을 업로드해주세요.
      </p>

      {!audioUrl && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full rounded-lg py-2.5 text-sm font-semibold text-white transition ${
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {isRecording ? `녹음 중지 (${seconds}s)` : "🎙️ 녹음 시작"}
          </button>

          <div className="text-center text-xs text-zinc-400">또는</div>

          <input
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/x-wav"
            onChange={handleFileChange}
            className="w-full text-sm text-zinc-600"
          />
        </div>
      )}

      {audioUrl && (
        <div className="flex flex-col gap-3">
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              다시 녹음/선택
            </button>
            <button
              type="button"
              onClick={analyze}
              disabled={analyzing}
              className="flex-1 rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {analyzing ? "분석 중..." : "분석하기"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {result && (
        <div className="mt-4 rounded-xl bg-orange-50 p-4">
          <p className="text-lg font-bold text-orange-700">
            {SOUND_CATEGORY_LABEL[result.category] ?? result.category}
            <span className="ml-2 text-sm font-normal text-orange-500">
              확신도 {result.confidence}%
            </span>
          </p>
          {result.reason && (
            <p className="mt-1 text-sm text-zinc-600">{result.reason}</p>
          )}
          <p className="mt-2 text-xs text-zinc-400">
            ⚠️ 참고용 추정치입니다. 정확한 진단은 수의사와 상담하세요.
          </p>
        </div>
      )}
    </div>
  );
}
