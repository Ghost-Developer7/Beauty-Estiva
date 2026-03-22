"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0a12]">
      <div className="max-w-md text-center">
        <h1 className="text-5xl font-bold text-white/20">500</h1>
        <p className="mt-4 text-lg text-white/60">Bir hata oluştu / Something went wrong</p>
        <p className="mt-2 text-sm text-white/30">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-[#7c5cbf] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6a4dab]"
        >
          Tekrar Dene / Try Again
        </button>
      </div>
    </div>
  );
}
