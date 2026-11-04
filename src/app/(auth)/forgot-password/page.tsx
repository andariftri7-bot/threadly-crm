'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-ivory-100 dark:bg-navy-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-300">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-navy-900 text-white flex items-center justify-center font-bold">
              T
            </div>
            <span className="font-bold text-lg text-navy-900 dark:text-ivory-100">Threadly</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-ivory-100">
            Lupa Kata Sandi
          </h1>
          <p className="text-xs text-slate-500">
            Masukkan email tokomu untuk menerima tautan pemulihan kata sandi.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-4 shadow-md">
          {isSent ? (
            <div className="text-center space-y-4 py-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                Tautan Pemulihan Terkirim!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
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

          <div className="pt-2 border-t border-slate-100 dark:border-navy-800 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-navy-900 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Kembali ke Halaman Masuk</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
