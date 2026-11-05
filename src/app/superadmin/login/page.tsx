'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { Button, Input } from '@/components/ui';
import { ShieldCheck, ArrowRight, AlertCircle, Lock, Mail } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function SuperadminLoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [email, setEmail] = useState('andariftri7@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const officialAdminEmail = 'andariftri7@gmail.com';

  const handleSuperadminAuth = async (targetEmail: string) => {
    const cleanEmail = targetEmail.toLowerCase().trim();
    if (cleanEmail !== officialAdminEmail) {
      throw new Error('Akses ditolak. Portal ini khusus untuk akun Super Administrator resmi Threadly.');
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login(cleanEmail, 'owner');
      // Redirect langsung ke panel Super Admin
      router.push('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses autentikasi superadmin.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSuperadminAuth(email);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleGoogleSuperadminLogin = async () => {
    try {
      await handleSuperadminAuth(officialAdminEmail);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen min-h-screen-dvh flex flex-col justify-between bg-background font-sans p-4 sm:p-8">
      <div className="flex justify-between items-center max-w-md w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary dark:bg-secondary text-primary-foreground dark:text-secondary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
            T
          </div>
          <span className="font-bold text-base text-foreground tracking-tight">
            Threadly <span className="text-secondary font-normal text-xs ml-1">Platform</span>
          </span>
        </div>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center space-y-2 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-black text-card-foreground tracking-tight">
              Portal Super Admin
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Akses manajemen platform terpusat Threadly CRM
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-destructive/15 text-destructive text-xs flex items-center gap-2 border border-destructive/30 font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Google Sign-In for Official Superadmin */}
          <button
            type="button"
            onClick={handleGoogleSuperadminLogin}
            disabled={isLoading}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl border border-secondary/40 bg-secondary/5 hover:bg-secondary/10 text-card-foreground font-bold text-xs flex items-center justify-center gap-3 transition shadow-sm touch-target"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
            <span>Masuk via Google ({officialAdminEmail})</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-[10px] uppercase font-bold text-muted-foreground">
              Atau masuk kredensial
            </span>
            <div className="border-t border-border w-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Super Admin"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="min-h-[44px] text-base sm:text-sm"
            />

            <div>
              <label className="block text-xs font-bold text-card-foreground uppercase tracking-wide mb-1">
                Kata Sandi Otorisasi
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi superadmin"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 text-base sm:text-sm bg-card border border-border rounded-xl text-card-foreground placeholder:text-muted-foreground/75 transition-all focus:border-ring focus:ring-2 focus:ring-ring/25"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full shadow-sm min-h-[44px] touch-target"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
            >
              Masuk ke Super Admin
            </Button>
          </form>

          <div className="p-3 rounded-xl bg-muted/60 border border-border text-[11px] text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-card-foreground">
              <Lock className="w-3.5 h-3.5 text-secondary flex-shrink-0" strokeWidth={1.5} />
              <span>Sesi Terisolasi &amp; Terproteksi</span>
            </div>
            <p>
              Portal ini dilindungi verifikasi ganda RLS dan Session Cookie terenkapsulasi.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground py-4">
        &copy; {new Date().getFullYear()} Threadly Platform Security
      </div>
    </div>
  );
}
