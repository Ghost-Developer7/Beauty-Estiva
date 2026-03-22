export default function DashboardLoading() {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-[#7c5cbf]" />
        <p className="text-sm text-white/40">Yükleniyor...</p>
      </div>
    </div>
  );
}
