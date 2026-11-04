'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 font-sans">
      <div className="flex justify-end w-full">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md mx-auto space-y-6 my-auto animate-in fade-in duration-300">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              T
            </div>
            <span className="font-bold text-lg text-foreground">Threadly</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            Lupa Kata Sandi
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Masukkan email tokomu untuk menerima tautan pemulihan kata sandi.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-4 shadow-md">
          {isSent ? (
            <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-base text-card-foreground">
                Tautan Pemulihan Terkirim!
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Kami telah mengirimkan instruksi pengaturan ulang kata sandi ke <strong>{email}</strong>. Silakan periksa kotak masuk atau folder spam emailmu.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="secondary" size="md" className="w-full">
                    Kembali ke Halaman Masuk
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Alamat Email Terdaftar"
                type="email"
                required
                placeholder="nama@tokomu.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                Kirim Tautan Pemulihan
              </Button>
            </form>
          )}

          <div className="pt-2 border-t border-border text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </Card>
      </div>

      <div className="text-center text-[11px] text-muted-foreground pt-4">
        Keamanan terjamin &bull; Threadly Fashion CRM
      </div>
    </div>
  );
}
