import React from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { ArrowLeft, ShieldCheck, Download, Trash2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-ivory-100 dark:bg-navy-950 text-navy-900 dark:text-ivory-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-900 dark:hover:text-white transition">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span>Kembali ke Beranda Threadly</span>
        </Link>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-violet-500" strokeWidth={1.5} />
            <span className="text-xs uppercase font-bold text-violet-600 dark:text-violet-400 tracking-wider">
              Kepatuhan Privasi &amp; Perlindungan Data
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Kebijakan Privasi Threadly</h1>
          <p className="text-xs text-slate-500 mt-1">Terakhir diperbarui: November 2026</p>
        </div>

        <Card className="p-8 space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900 dark:text-ivory-100">
              1. Komitmen Terhadap Perlindungan Data Pelanggan
            </h2>
            <p>
              Threadly menghormati hak privasi setiap pengguna, pemilik toko fashion, dan pembeli akhir. Kami menerapkan prinsip isolasi multi-tenant penuh menggunakan Row Level Security (RLS) pada PostgreSQL sehingga data antartoko tidak dapat saling diakses atau dibocorkan.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900 dark:text-ivory-100">
              2. Data yang Dikumpulkan
            </h2>
            <p>
              Informasi yang disimpan melalui sistem Threadly CRM mencakup:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Identitas akun penjual (nama, alamat email terdaftar, nomor WhatsApp toko).</li>
              <li>Profil preferensi pelanggan (nama pembeli, nomor WhatsApp, alamat pengiriman, ukuran pakaian favorit, warna favorit, dan riwayat pesanan).</li>
              <li>Data katalog produk dan stok per kombinasi varian.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900 dark:text-ivory-100">
              3. Hak Ekspor dan Penghapusan Data (Right to be Forgotten)
            </h2>
            <p>
              Setiap pelanggan berhak meminta salinan data pribadinya atau meminta penghapusan total dari sistem kami. Penjual dapat mengekspor data individual pelanggan dalam format JSON atau menghapus profil secara permanen langsung dari halaman detail pelanggan di dashboard CRM.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-navy-900 dark:text-ivory-100">
              4. Transparansi Penggunaan AI &amp; Keamanan Multi-Tenant
            </h2>
            <p>
              Pengelola sistem platform hanya mengamati data agregat performa teknis (seperti jumlah toko dan kuota pemakaian AI) dan tidak pernah mengakses atau melihat isi data pelanggan maupun rincian pesanan masing-masing toko secara langsung. Seluruh data transaksi terlindungi secara ketat oleh isolasi tenant PostgreSQL.
            </p>
          </section>

          <div className="pt-4 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Ada pertanyaan seputar privasi data?</span>
            <a href="mailto:privacy@threadly.id" className="text-xs font-bold text-violet-600 hover:underline">
              Hubungi Tim Kepatuhan Privasi
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
