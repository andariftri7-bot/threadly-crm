import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0B1020] text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
