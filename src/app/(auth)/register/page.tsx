'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { Button, Input } from '@/components/ui';
import { ArrowRight, CheckCircle2, AlertCircle, Info, Store as StoreIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerAndCreateStore } = useStore();

  const urlEmail = searchParams?.get('email') || '';
  const isUnregisteredRedirect = searchParams?.get('unregistered') === 'true';

  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState(urlEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (urlEmail) {
      setEmail(urlEmail);
    }
  }, [urlEmail]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes('@')) {
      setErrorMsg('Alamat email tidak valid.');
      return;
    }
    if (cleanEmail === 'andariftri7@gmail.com') {
      setErrorMsg('Alamat email super admin dilindungi dan tidak dapat didaftarkan ulang.');
      return;
    }
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
      const userFullName = fullName.trim() || cleanEmail.split('@')[0];
      const userStoreName = storeName.trim() || `Butik ${userFullName}`;

      await registerAndCreateStore({
        email: cleanEmail,
        fullName: userFullName,
        storeName: userStoreName,
      });

      // Setelah pendaftaran berhasil, pengguna langsung masuk ke dashboard toko
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar. Silakan coba kembali.');
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const targetEmail = (email.trim() && email.includes('@'))
        ? email.toLowerCase().trim()
        : `pemilik.${Date.now().toString().slice(-4)}@gmail.com`;

      if (targetEmail === 'andariftri7@gmail.com') {
        throw new Error('Alamat email super admin dilindungi.');
      }

      const userFullName = fullName.trim() || targetEmail.split('@')[0];
      const userStoreName = storeName.trim() || `Butik ${userFullName}`;

      await registerAndCreateStore({
        email: targetEmail,
        fullName: userFullName,
        storeName: userStoreName,
      });

      // Langsung masuk ke dashboard toko setelah daftar via Google
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mendaftar dengan Google.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background font-sans">
      {/* Brand Panel (40% desktop, hidden mobile) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0F172A] bg-gradient-brand text-white flex-col justify-between p-12 relative overflow-hidden border-r border-white/10">
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
            Mulai bangun basis pelanggan setiamu sekarang.
          </h1>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            Tidak ada lagi catatan pesanan yang tercecer atau preferensi ukuran yang terlupakan. Dapatkan repeat order lebih tinggi untuk brand pakaianmu.
          </p>

          <div className="space-y-3 pt-4 text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-300" strokeWidth={1.5} />
              <span>Masa coba gratis 7 hari tanpa kartu kredit</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-300" strokeWidth={1.5} />
              <span>Etalase publik langsung aktif dengan link bio</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-violet-300" strokeWidth={1.5} />
              <span>Privasi data multi-tenant terisolasi penuh RLS</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-300 font-medium">
          &copy; {new Date().getFullYear()} Threadly. Dibuat untuk UMKM Fashion Indonesia.
        </div>
      </div>

      {/* Form Panel (60% desktop, 100% mobile) */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 relative">
        <div className="flex justify-end w-full">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md mx-auto space-y-6 my-auto animate-in fade-in duration-300">
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
              Daftar Akun Threadly
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Buat akun barumu dan toko fashion Anda langsung aktif dalam sekejap.
            </p>
          </div>

          {/* Notifikasi jika dialihkan dari halaman login karena belum terdaftar */}
          {isUnregisteredRedirect && (
            <div className="p-3.5 rounded-xl bg-secondary/15 text-secondary text-xs flex items-start gap-2.5 border border-secondary/30 font-semibold animate-in fade-in">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-bold text-foreground">Akun Belum Terdaftar</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-relaxed">
                  Email <span className="font-bold text-foreground">{email || urlEmail}</span> belum terdaftar di Threadly. Silakan lengkapi form pendaftaran ini. Setelah mendaftar, Anda akan <strong>langsung masuk</strong> ke dashboard toko tanpa perlu login ulang.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-destructive/15 text-destructive text-xs flex items-center gap-2 border border-destructive/30 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tombol Cepat Google */}
          <button
            type="button"
            onClick={handleGoogleRegister}
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
            <span>Daftar &amp; Langsung Masuk dengan Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-background px-3 text-[11px] uppercase font-bold text-muted-foreground">
              Atau isi formulir
            </span>
            <div className="border-t border-border w-full" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Nama Pemilik Toko"
              autoComplete="name"
              required
              placeholder="Contoh: Riska Melinda"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="min-h-[44px] text-base sm:text-sm"
            />

            <Input
              label="Nama Butik / Toko Fashion"
              autoComplete="organization"
              placeholder="Contoh: Butik Cantik Elegan (Opsional)"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              className="min-h-[44px] text-base sm:text-sm"
            />

            <Input
              label="Alamat Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              placeholder="owner@butikmu.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="min-h-[44px] text-base sm:text-sm"
            />

            <Input
              label="Kata Sandi"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="min-h-[44px] text-base sm:text-sm"
            />

            <Input
              label="Konfirmasi Kata Sandi"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Ketik ulang kata sandi"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="min-h-[44px] text-base sm:text-sm"
            />

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full shadow-sm"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
            >
              Daftar &amp; Langsung Masuk
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground font-medium">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="font-bold text-secondary hover:underline">
              Masuk di Sini
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-sm font-medium">
          Memuat formulir pendaftaran...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
