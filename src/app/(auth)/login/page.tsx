'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { Button, Input } from '@/components/ui';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

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
    <div className="min-h-screen flex w-full bg-background font-sans">
      {/* Brand Panel (40% width on Desktop, hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0F172A] bg-gradient-brand text-white flex-col justify-between p-12 relative overflow-hidden border-r border-white/10">
        {/* Soft decorative background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#5B4BDB] bg-gradient-accent opacity-25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#C9A96E] opacity-15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary text-white flex items-center justify-center font-bold text-lg shadow-sm">
              T
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Threadly</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            Kenali pelangganmu, ajak mereka kembali.
          </h1>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            Satu-satunya CRM terintegrasi khusus UMKM fashion Indonesia. Kelola varian ukuran &amp; warna, ingat preferensi pembeli, dan raih repeat order otomatis.
          </p>

          <div className="space-y-3 pt-4 text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-300" strokeWidth={1.5} />
              <span>Otomatisasi pengingat pelanggan tidur via WhatsApp</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-300" strokeWidth={1.5} />
              <span>Stok varian akurat real-time dengan etalase bio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-300" strokeWidth={1.5} />
              <span>Asisten AI cerdas pengubah chat menjadi pesanan</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-300 font-medium">
          &copy; {new Date().getFullYear()} Threadly. Dibuat untuk UMKM Fashion Indonesia.
        </div>
      </div>

      {/* Form Panel (60% width on Desktop, 100% on mobile) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 relative">
        <div className="flex justify-end w-full">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md mx-auto space-y-6 my-auto animate-in fade-in duration-300">
          {/* Mobile Brand Logo */}
          <div className="lg:hidden text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                T
              </div>
              <span className="font-bold text-lg text-foreground">Threadly</span>
            </Link>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-foreground">
              Selamat datang kembali
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Masuk untuk mengelola pelanggan dan stok tokomu hari ini.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-destructive/15 text-destructive text-xs flex items-center gap-2 border border-destructive/30 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-border bg-card text-foreground font-semibold text-xs flex items-center justify-center gap-2.5 hover:bg-muted transition shadow-sm"
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
            <div className="border-t border-border w-full" />
            <span className="bg-background px-3 text-[11px] uppercase font-bold text-muted-foreground">
              Atau dengan email
            </span>
            <div className="border-t border-border w-full" />
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
                <label className="block text-xs font-bold text-foreground uppercase tracking-wide">
                  Kata Sandi
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-secondary hover:underline font-semibold"
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
                className="w-full px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/75 transition-all focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full shadow-sm"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
            >
              Masuk ke Toko
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground font-medium">
            Belum punya akun Threadly?{' '}
            <Link href="/register" className="font-bold text-secondary hover:underline">
              Daftar Gratis Sekarang
            </Link>
          </p>
        </div>

        <div className="text-center text-[11px] text-muted-foreground pt-4">
          Keamanan terjamin &bull; Privasi Row Level Security (RLS)
        </div>
      </div>
    </div>
  );
}
