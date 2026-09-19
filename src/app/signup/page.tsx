"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="mb-2 text-xl font-bold text-zinc-900">
            가입 확인 메일을 보냈어요 📩
          </h1>
          <p className="text-sm text-zinc-500">
            메일함에서 인증 링크를 눌러 가입을 완료해주세요.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-orange-600 hover:underline"
          >
            로그인 화면으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900">회원가입</h1>
        <p className="mb-6 text-sm text-zinc-500">
          집사님의 정보를 입력해주세요
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              이메일
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              비밀번호
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
              placeholder="6자 이상 입력해주세요"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="font-medium text-orange-600 hover:underline"
          >
            로그인
          </Link>
        </p>

        <div className="mt-4 flex justify-center gap-4 border-t border-zinc-100 pt-4 text-xs text-zinc-400">
          <Link href="/breeds" className="hover:text-zinc-600">
            📖 품종 정보 둘러보기
          </Link>
          <Link href="/vets" className="hover:text-zinc-600">
            🏥 근처 동물병원 찾기
          </Link>
        </div>
      </div>
    </div>
  );
}
