'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { Button, Input, Card } from '@/components/ui';
import { Store, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { createStore, currentUser, currentStore, storeMembers } = useStore();

  useEffect(() => {
    // 1 User = 1 Store rule: if user already has a store, redirect directly to dashboard
    if (currentStore) {
      router.replace('/dashboard');
      return;
    }
    if (currentUser) {
      const membership = storeMembers.find(
        m => m.user_id === currentUser.id || m.user_email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      if (membership) {
        router.replace('/dashboard');
      }
    }
  }, [currentStore, currentUser, storeMembers, router]);

  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-generate slug as user types store name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStoreName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setStoreSlug(generatedSlug);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storePhone) return;

    setIsLoading(true);
    try {
      await createStore({
        name: storeName,
        slug: storeSlug || 'toko-fashion',
        phone_wa: storePhone,
        description: storeDesc || 'Butik Fashion UMKM Indonesia',
      });
      router.push('/dashboard');
    } catch (err: any) {
      alert(`Gagal membuat toko: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 dark:bg-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-6 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md">
            T
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 dark:text-ivory-100">
            Setup Toko Fashion Pertamamu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Hanya butuh 1 menit untuk menyiapkan katalog, stok varian, dan link etalase bio tokomu.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5 border-slate-200 shadow-md">
          <form onSubmit={handleCreateStore} className="space-y-4">
            <Input
              label="Nama Butik / Brand Fashion"
              required
              placeholder="Contoh: Raline Fashion Studio"
              value={storeName}
              onChange={handleNameChange}
            />

            <div>
              <Input
                label="Alamat Tautan Etalase Publik"
                required
                placeholder="raline-fashion"
                value={storeSlug}
                onChange={e => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              />
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Tautan bio kamu nantinya: <strong>threadly.id/{storeSlug || 'namatoko'}</strong>
              </p>
            </div>

            <Input
              label="Nomor WhatsApp Toko (Menerima Pesanan)"
              required
              placeholder="Contoh: 081298765432"
              value={storePhone}
              onChange={e => setStorePhone(e.target.value)}
              helperText="Nomor ini akan dihubungi pembeli saat konfirmasi pesanan dari etalase bio."
            />

            <div>
              <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                Konsep / Kategori Busana
              </label>
              <textarea
                rows={2}
                placeholder="Misal: Busana muslim kasual, thrift outerwear vintage, atau kebaya modern..."
                value={storeDesc}
                onChange={e => setStoreDesc(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
              >
                Mulai Masuk ke Dashboard Toko
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
