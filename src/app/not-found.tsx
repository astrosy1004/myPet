import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl">🐾</p>
      <h1 className="text-xl font-bold text-zinc-900">페이지를 찾을 수 없어요</h1>
      <p className="text-sm text-zinc-500">
        주소가 잘못되었거나 삭제된 페이지일 수 있어요.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
