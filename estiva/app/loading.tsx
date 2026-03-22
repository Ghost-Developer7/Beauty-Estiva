export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0a12]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#7c5cbf]" />
        <p className="text-sm text-white/40">Yükleniyor...</p>
      </div>
    </div>
  );
}
