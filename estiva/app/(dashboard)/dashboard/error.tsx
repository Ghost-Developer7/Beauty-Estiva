"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <p className="text-lg font-semibold text-white/60">Bir hata oluştu</p>
        <p className="mt-2 text-sm text-white/30">{error.message}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-xl bg-[#7c5cbf] px-5 py-2 text-sm font-semibold text-white hover:bg-[#6a4dab]"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
