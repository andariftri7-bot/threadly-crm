import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-ivory-100 dark:bg-navy-950 text-navy-900 dark:text-ivory-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-900 dark:hover:text-white transition">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Kembali ke Beranda Threadly</span>
        </Link>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-violet-500" strokeWidth={1.5} />
            <span className="text-xs uppercase font-bold text-violet-600 dark:text-violet-400 tracking-wider">
              Ketentuan Hukum Layanan
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Syarat &amp; Ketentuan Layanan</h1>
          <p className="text-xs text-slate-500 mt-1">Berlaku untuk seluruh pengguna aplikasi Threadly di Indonesia</p>
        </div>

        <Card className="p-8 space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900 dark:text-ivory-100">
              1. Penerimaan Syarat
            </h2>
            <p>
              Dengan mendaftar dan menggunakan platform Threadly, Anda menyatakan setuju untuk terikat dengan syarat dan ketentuan ini. Apabila Anda tidak menyetujui salah satu poin, mohon untuk tidak menggunakan layanan ini.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900 dark:text-ivory-100">
              2. Tanggung Jawab Penjual
            </h2>
            <p>
              Penjual bertanggung jawab penuh atas keakuratan informasi produk pakaian, penetapan harga jual, pemenuhan pesanan, dan pengiriman barang fisik kepada pembeli. Threadly bertindak murni sebagai penyedia perangkat lunak CRM dan etalase digital.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900 dark:text-ivory-100">
              3. Penggunaan Wajar dan Pembatasan Fitur
            </h2>
            <p>
              Dilarang menggunakan formulir pemesanan publik untuk aktivitas spamming, penyalahgunaan bot, atau tindakan melanggar hukum lainnya. Threadly menerapkan perlindungan spam dan pembatasan laju (rate limiting) secara ketat.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900 dark:text-ivory-100">
              4. Perubahan Layanan
            </h2>
            <p>
              Threadly berhak melakukan pembaruan fitur, perbaikan keamanan, dan pemeliharaan sistem secara berkala untuk menjaga stabilitas operasional seluruh toko mitra.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
