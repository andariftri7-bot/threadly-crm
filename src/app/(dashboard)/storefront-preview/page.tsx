'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store-context';
import { Card, Button, Badge } from '@/components/ui';
import {
  Store,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Smartphone,
  Bell,
} from 'lucide-react';

export default function StorefrontPreviewPage() {
  const { currentStore } = useStore();
  const [copied, setCopied] = useState(false);

  const storefrontUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${currentStore?.slug}`
    : `https://threadly.id/${currentStore?.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-navy-900 dark:text-ivory-100">
          Etalase Publik & Link Bio
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Bagikan tautan katalog ini di bio Instagram, TikTok, atau status WhatsApp tokomu.
        </p>
      </div>

      {/* Share Link Card */}
      <Card className="p-6 bg-gradient-to-br from-violet-500/10 via-transparent to-navy-900/5 border-violet-200 dark:border-violet-900/40 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500 text-white flex items-center justify-center">
            <Share2 className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
              Tautan Siap Pasang di Bio
            </h3>
            <p className="text-xs text-slate-500">
              Pembeli dapat langsung memilih varian busana dan memesan tanpa perlu tanya harga bolak-balik.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-navy-900 p-2 rounded-xl border border-slate-200 dark:border-navy-700">
          <input
            type="text"
            readOnly
            value={storefrontUrl}
            className="flex-1 min-w-[200px] bg-transparent px-2 text-xs font-mono text-navy-900 dark:text-ivory-100 select-all focus:outline-none"
          />
          <Button
            size="sm"
            variant={copied ? 'primary' : 'secondary'}
            onClick={handleCopy}
            leftIcon={
              copied ? (
                <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              ) : (
                <Copy className="w-4 h-4" strokeWidth={1.5} />
              )
            }
          >
            {copied ? 'Tersalin' : 'Salin Link'}
          </Button>

          <Link href={`/${currentStore?.slug}`} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="w-4 h-4" strokeWidth={1.5} />}
            >
              Buka Etalase
            </Button>
          </Link>
        </div>
      </Card>

      {/* Feature Highlights of Storefront */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Smartphone className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <h4 className="text-sm font-bold text-navy-900 dark:text-ivory-100">
            Tampilan Cepat di Ponsel
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Didesain ringan dan cepat dibuka dari in-app browser Instagram atau TikTok tanpa lag.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <Store className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <h4 className="text-sm font-bold text-navy-900 dark:text-ivory-100">
            Stok Varian Selalu Akurat
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Varian yang habis otomatis dicoret sehingga pembeli tidak kecewa memesan barang kosong.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Bell className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <h4 className="text-sm font-bold text-navy-900 dark:text-ivory-100">
            Notifikasi Penjual Seketika
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Setiap pesanan baru langsung memicu notifikasi realtime pada dashboard kasir toko.
          </p>
        </Card>
      </div>

      {/* Live Preview Embed */}
      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
          <h3 className="font-bold text-sm text-navy-900 dark:text-ivory-100">
            Pratinjau Etalase Publik ({currentStore?.name})
          </h3>
          <Badge variant="purple">Live Preview</Badge>
        </div>

        <div className="border border-slate-200 dark:border-navy-700 rounded-2xl overflow-hidden shadow-inner h-[550px] bg-slate-100">
          <iframe
            src={`/${currentStore?.slug}`}
            className="w-full h-full border-0"
            title="Pratinjau Etalase"
          />
        </div>
      </Card>
    </div>
  );
}
