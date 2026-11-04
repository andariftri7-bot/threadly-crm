'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { Button, Input } from '@/components/ui';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      if (email.toLowerCase().trim() === 'andariftri7@gmail.com') {
        throw new Error('Alamat email ini dilindungi dan tidak dapat didaftarkan ulang.');
      }
      await login(email, 'owner');
      // Transition to store onboarding
      router.push('/onboarding');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    // Google OAuth: hanya menerima akun yang emailnya sudah terverifikasi
    await login('new.google.user@fashion.id', 'owner');
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen flex w-full bg-ivory-100 dark:bg-navy-950 font-sans">
      {/* Brand Panel (40% desktop, hidden mobile) */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-brand text-ivory-100 flex-col justify-between p-12 relative overflow-hidden border-r border-navy-800">
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
            Mulai bangun basis pelanggan setiamu sekarang.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Tidak ada lagi catatan pesanan yang tercecer atau preferensi ukuran yang terlupakan. Dapatkan repeat order lebih tinggi untuk brand pakaianmu.
          </p>

          <div className="space-y-3 pt-4 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-400" strokeWidth={1.5} />
              <span>Masa coba gratis 7 hari tanpa kartu kredit</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-400" strokeWidth={1.5} />
              <span>Etalase publik langsung aktif dengan link bio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-400" strokeWidth={1.5} />
              <span>Privasi data multi-tenant terisolasi penuh RLS</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Threadly. Dibuat untuk UMKM Fashion Indonesia.
        </div>
      </div>

      {/* Form Panel (60% desktop, 100% mobile) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-6 animate-in fade-in duration-300">
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
              Daftar Akun Threadly
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Buat akun barumu dan mulai atur etalase serta pelanggan fashion dalam 2 menit.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleRegister}
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
            <span>Daftar dengan Akun Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-navy-700 w-full" />
            <span className="bg-ivory-100 dark:bg-navy-950 px-3 text-[11px] uppercase font-bold text-slate-400">
              Atau isi formulir
            </span>
            <div className="border-t border-slate-200 dark:border-navy-700 w-full" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Nama Pemilik Toko"
              required
              placeholder="Contoh: Riska Melinda"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />

            <Input
              label="Alamat Email"
              type="email"
              required
              placeholder="owner@butikmu.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <Input
              label="Kata Sandi"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <Input
              label="Konfirmasi Kata Sandi"
              type="password"
              required
              placeholder="Ketik ulang kata sandi"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
            >
              Daftar &amp; Lanjut Onboarding
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-bold text-violet-600 hover:underline">
              Masuk di Sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
