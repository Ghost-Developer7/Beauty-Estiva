"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0a12]">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-white/20">404</h1>
        <p className="mt-4 text-lg text-white/60">Sayfa bulunamadı / Page not found</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-[#7c5cbf] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6a4dab]"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
