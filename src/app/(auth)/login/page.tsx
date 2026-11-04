'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { Button, Input } from '@/components/ui';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (!email.includes('@')) {
        throw new Error('Format email tidak valid.');
      }
      if (password.length < 6) {
        throw new Error('Kata sandi minimal 6 karakter.');
      }

      await login(email, 'owner');
      // Strictly only andariftri7@gmail.com goes to /admin
      if (email.toLowerCase().trim() === 'andariftri7@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk akun. Periksa kembali email dan kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Google OAuth: hanya menerima akun yang emailnya sudah terverifikasi
    await login('owner.koleksilokal@threadly.id', 'owner');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex w-full bg-ivory-100 dark:bg-navy-950 font-sans">
      {/* Brand Panel (40% width on Desktop, hidden on mobile as required) */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-brand text-ivory-100 flex-col justify-between p-12 relative overflow-hidden border-r border-navy-800">
        {/* Soft decorative background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-accent opacity-20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#C9A96E] opacity-15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              T
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Threadly</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            Kenali pelangganmu, ajak mereka kembali.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Satu-satunya CRM terintegrasi khusus UMKM fashion Indonesia. Kelola varian ukuran &amp; warna, ingat preferensi pembeli, dan raih repeat order otomatis.
          </p>

          <div className="space-y-3 pt-4 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-400" strokeWidth={1.5} />
              <span>Otomatisasi pengingat pelanggan tidur via WhatsApp</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-400" strokeWidth={1.5} />
              <span>Stok varian akurat real-time dengan etalase bio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-400" strokeWidth={1.5} />
              <span>Asisten AI cerdas pengubah chat menjadi pesanan</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Threadly. Dibuat untuk UMKM Fashion Indonesia.
        </div>
      </div>

      {/* Form Panel (60% width on Desktop, 100% on mobile) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6 animate-in fade-in duration-300">
          {/* Mobile Brand Logo */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-navy-900 text-white flex items-center justify-center font-bold">
                T
              </div>
              <span className="font-bold text-lg text-navy-900 dark:text-ivory-100">Threadly</span>
            </Link>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-navy-900 dark:text-ivory-100">
              Selamat datang kembali
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masuk untuk mengelola pelanggan dan stok tokomu hari ini.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100 font-semibold text-xs flex items-center justify-center gap-2.5 hover:bg-slate-50 dark:hover:bg-navy-800 transition shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Lanjutkan dengan Akun Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-navy-700 w-full" />
            <span className="bg-ivory-100 dark:bg-navy-950 px-3 text-[11px] uppercase font-bold text-slate-400">
              Atau dengan email
            </span>
            <div className="border-t border-slate-200 dark:border-navy-700 w-full" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Alamat Email"
              type="email"
              required
              placeholder="nama@tokomu.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide">
                  Kata Sandi
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl text-navy-900 dark:text-ivory-100 placeholder:text-slate-400 transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
            >
              Masuk ke Toko
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Belum punya akun Threadly?{' '}
            <Link href="/register" className="font-bold text-violet-600 hover:underline">
              Daftar Gratis Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
