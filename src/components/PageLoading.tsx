export function PageLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
        <p className="text-sm text-zinc-400">불러오는 중...</p>
      </div>
    </div>
  );
}
