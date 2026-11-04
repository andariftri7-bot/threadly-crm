'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Sparkles,
  Store,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button, Badge, Card } from '@/components/ui';

export default function LandingPage() {
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Apa itu Threadly dan untuk siapa aplikasi ini dirancang?',
      a: 'Threadly adalah sistem Customer Relationship Management (CRM) dan manajemen inventaris varian yang dirancang khusus untuk pelaku UMKM fashion di Indonesia, mulai dari butik pakaian wanita, toko distro pria, thrift vintage, hingga brand lokal busana muslim.',
    },
    {
      q: 'Bagaimana cara Threadly membantu meningkatkan repeat order toko fashion saya?',
      a: 'Threadly secara otomatis mengelompokkan pelanggan ke dalam tahap Baru, Aktif, Setia, dan Tidur. Ketika pelanggan lama tidak bertransaksi melewati batas 60 hari, sistem akan membuat tugas tindak lanjut otomatis dengan tautan pesan WhatsApp yang sudah disiapkan personal sesuai ukuran dan warna favorit mereka.',
    },
    {
      q: 'Apakah saya membutuhkan API resmi WhatsApp yang berbayar?',
      a: 'Tidak. Threadly menggunakan integrasi tautan langsung wa.me yang dapat dibuka langsung di aplikasi WhatsApp ponsel atau WhatsApp Web di laptop tanpa memerlukan WhatsApp Cloud API atau biaya langganan nomor per pesan.',
    },
    {
      q: 'Bagaimana fitur Etalase Publik bekerja untuk bio media sosial saya?',
      a: 'Setiap tokomu memiliki alamat etalase unik seperti threadly.id/koleksilokal. Pembeli bisa melihat foto koleksi busana dengan stok varian ukuran dan warna yang akurat secara real-time. Pesanan dari pembeli akan langsung masuk ke dashboard tokomu secara seketika.',
    },
    {
      q: 'Apakah fitur AI tetap dapat digunakan jika saya belum mengisi API key?',
      a: 'Tentu saja. Fitur AI Threadly dilengkapi Intelligent Heuristic Engine lokal yang tetap memproses ekstraksi chat pembeli dan menyusun rekomendasi balasan santun secara otomatis tanpa error, meskipun kunci API belum dikonfigurasi.',
    },
    {
      q: 'Apakah data pelanggan saya aman dan terpisah dari toko lain?',
      a: 'Sangat aman. Threadly dibangun dengan arsitektur multi-tenant sejati yang dilindungi Row Level Security (RLS) pada level database PostgreSQL Supabase. Tidak ada toko lain yang dapat melihat basis data pelanggan, omzet, atau produk tokomu.',
    },
    {
      q: 'Bagaimana skema harga dan cara pembayarannya saat ini?',
      a: 'Seluruh akun baru mendapatkan masa coba 7 hari gratis untuk Paket Standar (Rp20.000/bln) dan Pro (Rp45.000/bln). Sistem pembayaran saat ini belum diaktifkan sehingga kamu dapat langsung mengeksplorasi seluruh fitur tanpa kartu kredit.',
    },
  ];

  return (
    <div className="min-h-screen bg-ivory-100 dark:bg-navy-950 text-navy-900 dark:text-ivory-100 font-sans selection:bg-violet-500 selection:text-white">
      {/* 1. STICKY NAVBAR */}
      <header className="sticky top-0 z-40 bg-ivory-100/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-navy-800 transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-navy-900 dark:bg-violet-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              T
            </div>
            <span className="font-bold text-xl tracking-tight text-navy-900 dark:text-ivory-100">
              Threadly
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#masalah" className="hover:text-violet-600 dark:hover:text-violet-400 transition">
              Masalah
            </a>
            <a href="#solusi" className="hover:text-violet-600 dark:hover:text-violet-400 transition">
              Solusi
            </a>
            <a href="#cara-kerja" className="hover:text-violet-600 dark:hover:text-violet-400 transition">
              Cara Kerja
            </a>
            <a href="#fitur" className="hover:text-violet-600 dark:hover:text-violet-400 transition">
              Fitur
            </a>
            <a href="#harga" className="hover:text-violet-600 dark:hover:text-violet-400 transition">
              Harga
            </a>
            <a href="#faq" className="hover:text-violet-600 dark:hover:text-violet-400 transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="sm">
                Mulai Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-brand text-white p-8 sm:p-14 lg:p-16 text-center space-y-6 shadow-2xl border border-white/10 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-accent opacity-20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#C9A96E] opacity-10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-ivory-100 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-champagne" strokeWidth={1.5} />
            <span>Platform CRM Khusus Fashion UMKM Indonesia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Kenali pelangganmu, ajak mereka kembali.
          </h1>

          <p className="text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Catat preferensi ukuran dan warna favorit pelanggan, kelola stok varian secara akurat, dan dapatkan repeat order berkelanjutan tanpa repot mencatat manual di buku chat.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 relative z-10">
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto shadow-glow-violet"
                rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
              >
                Mulai Gratis Sekarang
              </Button>
            </Link>
            <a href="#cara-kerja" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20">
                Pelajari Cara Kerja
              </Button>
            </a>
          </div>

          <p className="text-xs text-slate-300 pt-1">
            Tidak perlu kartu kredit &bull; Siap pakai dalam 2 menit &bull; Dukungan penuh UMKM
          </p>
        </div>
      </section>

      {/* 3. PROBLEM SECTION */}
      <section id="masalah" className="py-20 bg-white dark:bg-navy-900 border-y border-slate-200 dark:border-navy-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-ivory-100">
              Tantangan Nyata Penjual Fashion UMKM
            </h2>
            <p className="text-sm text-slate-500">
              Kebanyakan pemilik butik dan thrift kehilangan hingga 40% repeat order karena masalah klasik ini:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3 border-rose-100 dark:border-rose-950 bg-rose-50/20 dark:bg-rose-950/10">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                Preferensi Pelanggan Terlupakan
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ukuran favorit (S/M/L) dan warna yang disukai pembeli hilang di tumpukan riwayat chat WhatsApp. Penjual menanyakan ulang info yang sama sehingga terasa tidak profesional.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-amber-100 dark:border-amber-950 bg-amber-50/20 dark:bg-amber-950/10">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
                <Users className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                Pelanggan Lama Tidak Dihubungi
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Pembeli yang pernah puas berbelanja dibiarkan begitu saja tanpa pernah disapa kembali saat ada restock koleksi baru yang sesuai ukuran mereka.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-sky-100 dark:border-sky-950 bg-sky-50/20 dark:bg-sky-950/10">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 flex items-center justify-center">
                <Layers className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                Stok Varian Ukuran Tidak Akurat
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Catatan manual di buku membuat jumlah varian (misal Size M Hitam vs Size L Putih) sering selisih, berujung pembatalan pesanan yang mengecewakan pembeli.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. SOLUTION SECTION */}
      <section id="solusi" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <Badge variant="purple">Solusi Cerdas Threadly</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-ivory-100">
            Didesain Khusus untuk Karakter Fashion Lokal
          </h2>
          <p className="text-sm text-slate-500">
            Satu ekosistem lengkap untuk mengubah pembeli satu kali menjadi pelanggan setia berulang kali.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Users className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-lg text-navy-900 dark:text-ivory-100">
              Profil CRM Busana Terlengkap
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Catat ukuran favorit, warna yang disukai, gaya busana, hingga tanggal lahir. Tahap loyalitas (Baru, Aktif, Setia, Tidur) dan total belanja terhitung otomatis setiap ada pesanan baru.
            </p>
          </Card>

          <Card className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-lg text-navy-900 dark:text-ivory-100">
              Tindak Lanjut WhatsApp 1-Klik
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Daftar pelanggan yang tidur (&gt;60 hari) atau pesanan yang belum dibayar (&gt;24 jam) otomatis muncul dengan tautan WhatsApp wa.me siap kirim tanpa repot mengetik template.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. 3-STEP HOW IT WORKS */}
      <section id="cara-kerja" className="py-20 bg-slate-50 dark:bg-navy-900/60 border-y border-slate-200 dark:border-navy-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-ivory-100">
              Cara Kerja Tiga Langkah Sederhana
            </h2>
            <p className="text-sm text-slate-500">
              Mulai dari pendaftaran hingga peningkatan omzet toko dalam hitungan hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-navy-900 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                Daftar &amp; Masukkan Koleksi
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Buat toko dalam 2 menit. Input busana beserta variasi ukuran (S, M, L) dan warna dengan jumlah stok masing-masing.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                Pasang Link Bio &amp; Catat Pesanan
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Salin tautan etalase publik ke bio Instagram/TikTok. Pesanan yang masuk otomatis memotong stok varian dan mencatat profil pembeli.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                Ajak Kembali dengan Retensi
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Pantau daftar pelanggan Tidur dan sapa mereka via WhatsApp dengan penawaran koleksi baru sesuai ukuran favorit mereka.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ALTERNATING FEATURES */}
      <section id="fitur" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Feature 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <Badge variant="purple">Asisten AI Cerdas</Badge>
            <h3 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-ivory-100">
              Tempel Chat WhatsApp Menjadi Pesanan Rapi
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Cukup salin teks obrolan pembeli yang berantakan, AI Threadly mengekstrak nama, nomor HP, alamat tujuan, produk, ukuran, dan jumlah dalam format terstruktur. Kamu tinggal mengonfirmasi sebelum disimpan!
            </p>
          </div>
          <Card className="p-6 bg-slate-50 dark:bg-navy-900 border-slate-200 text-xs font-mono space-y-2">
            <div className="text-slate-400 uppercase font-bold text-[10px]">Contoh Ekstraksi:</div>
            <p className="text-slate-700 dark:text-slate-300">
              &quot;Mbak mau pesen Kemeja Linen Broken White size M 1 pcs, kirim ke Jl. Kemang No. 14, Rania (08123456789)&quot;
            </p>
            <div className="p-3 bg-white dark:bg-navy-950 rounded-xl border border-violet-200 dark:border-violet-900 text-violet-700 dark:text-violet-300 space-y-1">
              <p>&bull; Pelanggan: Rania (08123456789)</p>
              <p>&bull; Produk: Kemeja Linen (Broken White / M) &times; 1</p>
              <p>&bull; Status: Menunggu Pembayaran</p>
            </div>
          </Card>
        </div>

        {/* Feature 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <Card className="order-2 md:order-1 p-6 bg-slate-50 dark:bg-navy-900 border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-navy-800 pb-2">
              <span className="font-bold">Koleksi Busana</span>
              <span className="font-bold">Stok Varian</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Kemeja Linen &bull; Size M / Sage</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">15 pcs</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Kulot Highwaist &bull; Size L / Hitam</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">2 pcs (Menipis)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>Midi Dress Floral &bull; Size S / Cream</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">0 pcs (Habis)</span>
            </div>
          </Card>
          <div className="space-y-4 order-1 md:order-2">
            <Badge variant="success">Stok Varian &amp; Mutasi</Badge>
            <h3 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-ivory-100">
              Kendali Mutasi Stok Tanpa Khawatir Selisih
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Setiap kali pesanan dikonfirmasi lunas, stok varian otomatis berkurang. Jika pesanan dibatalkan, stok langsung dikembalikan ke rak. Lengkap dengan riwayat mutasi masuk, keluar, dan peringatan stok menipis.
            </p>
          </div>
        </div>
      </section>

      {/* 7. PRICING PLANS SECTION */}
      <section id="harga" className="py-20 bg-white dark:bg-navy-900 border-y border-slate-200 dark:border-navy-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="purple">Pilihan Paket Langganan</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-ivory-100">
              Investasi Terjangkau untuk Pertumbuhan Toko Fashion
            </h2>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl inline-block border border-amber-200 dark:border-amber-800">
              Pembayaran belum diaktifkan; seluruh akun baru mendapat masa coba 7 hari
            </p>
          </div>

          {/* 2 Column Cards: Standar vs Pro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Paket Standar: Rp20.000/bln */}
            <Card className="p-8 space-y-6 border-2 border-slate-200 dark:border-navy-700 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Paket Standar
                  </span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold text-navy-900 dark:text-ivory-100">
                      Rp20.000
                    </span>
                    <span className="text-xs text-slate-400">/ bulan</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Solusi esensial untuk butik dan thrift shop yang mulai merapikan basis pelanggan dan stok varian.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={1.5} />
                    <span><strong>1 toko</strong>, <strong>2 pengguna</strong> (1 Owner dan 1 Staff)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Hingga <strong>300 pelanggan</strong> dan <strong>100 produk</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Pesanan, stok varian, dan invoice PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Etalase publik dan form pesan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Tindak lanjut dasar (pelanggan Tidur dan pesanan unpaid)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Ekspor data CSV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Asisten AI: <strong>30 pemakaian</strong> per bulan</span>
                  </div>
                </div>
              </div>

              <Link href="/register" className="block pt-4">
                <Button variant="outline" size="md" className="w-full">
                  Coba Gratis 7 Hari
                </Button>
              </Link>
            </Card>

            {/* Paket Pro: Rp45.000/bln */}
            <Card className="p-8 space-y-6 border-2 border-violet-500 bg-violet-50/20 dark:bg-violet-950/20 relative shadow-lg flex flex-col justify-between">
              <div className="absolute -top-3 right-6">
                <span className="bg-violet-600 text-white text-[10px] uppercase font-extrabold px-3 py-1 rounded-full shadow-sm">
                  Paling Populer
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                    Paket Pro
                  </span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold text-navy-900 dark:text-ivory-100">
                      Rp45.000
                    </span>
                    <span className="text-xs text-slate-400">/ bulan</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Fitur lengkap tanpa batas untuk brand lokal yang agresif mengejar repeat order berkelanjutan.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" strokeWidth={1.5} />
                    <span><strong>1 toko</strong>, hingga <strong>5 pengguna</strong> tim</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" strokeWidth={1.5} />
                    <span><strong>Pelanggan dan produk tanpa batas</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Semua fitur Paket Standar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Tindak lanjut lengkap (Ultah &amp; Restock) + template kustom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Impor dan ekspor CSV lengkap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Dashboard lanjutan (produk terlaris &amp; filter kustom)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Asisten AI: <strong>300 pemakaian</strong>/bulan + persona kustom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" strokeWidth={1.5} />
                    <span>Dukungan prioritas tim Threadly</span>
                  </div>
                </div>
              </div>

              <Link href="/register" className="block pt-4">
                <Button variant="secondary" size="md" className="w-full">
                  Coba Gratis 7 Hari
                </Button>
              </Link>
            </Card>
          </div>

          {/* Feature Comparison Table */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-navy-900 dark:text-ivory-100 text-center">
              Perbandingan Fitur Lengkap
            </h3>

            <div className="bg-slate-50 dark:bg-navy-900/70 border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-navy-800 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-navy-700">
                  <tr>
                    <th className="p-4">Fitur Layanan</th>
                    <th className="p-4 text-center">Standar (Rp20.000/bln)</th>
                    <th className="p-4 text-center text-violet-600 dark:text-violet-400">Pro (Rp45.000/bln)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
                  <tr>
                    <td className="p-4 font-semibold">Batas Pengguna</td>
                    <td className="p-4 text-center text-slate-600 dark:text-slate-400">2 Pengguna (Owner + Staff)</td>
                    <td className="p-4 text-center font-bold text-violet-600 dark:text-violet-400">Hingga 5 Pengguna</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Kapasitas Basis Pelanggan</td>
                    <td className="p-4 text-center text-slate-600 dark:text-slate-400">300 Pelanggan</td>
                    <td className="p-4 text-center font-bold text-violet-600 dark:text-violet-400">Tanpa Batas</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Kapasitas Katalog Produk</td>
                    <td className="p-4 text-center text-slate-600 dark:text-slate-400">100 Produk</td>
                    <td className="p-4 text-center font-bold text-violet-600 dark:text-violet-400">Tanpa Batas</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Tindak Lanjut Retensi WhatsApp</td>
                    <td className="p-4 text-center text-slate-600 dark:text-slate-400">Dasar (Tidur &amp; Unpaid)</td>
                    <td className="p-4 text-center font-bold text-violet-600 dark:text-violet-400">Lengkap (Ultah + Restock + Kustom)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Impor &amp; Ekspor CSV</td>
                    <td className="p-4 text-center text-slate-600 dark:text-slate-400">Hanya Ekspor CSV</td>
                    <td className="p-4 text-center font-bold text-violet-600 dark:text-violet-400">Impor &amp; Ekspor Lengkap</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Asisten AI Fashion</td>
                    <td className="p-4 text-center text-slate-600 dark:text-slate-400">30 Pemakaian / Bulan</td>
                    <td className="p-4 text-center font-bold text-violet-600 dark:text-violet-400">300 Pemakaian / Bulan + Persona Kustom</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Dashboard Analisis Lanjutan</td>
                    <td className="p-4 text-center text-slate-400">-</td>
                    <td className="p-4 text-center font-bold text-emerald-600">Termasuk</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Dukungan Prioritas</td>
                    <td className="p-4 text-center text-slate-400">Standar</td>
                    <td className="p-4 text-center font-bold text-emerald-600">Prioritas WhatsApp</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION (MINIMAL 7 QUESTIONS) */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="purple">Pertanyaan Populer</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 dark:text-ivory-100">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-sm text-slate-500">
            Segala hal yang perlu kamu ketahui tentang pengoperasian Threadly CRM.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <Card
                key={idx}
                className="p-5 cursor-pointer transition border border-slate-200 dark:border-navy-800"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-bold text-sm text-navy-900 dark:text-ivory-100">
                    {faq.q}
                  </h4>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-violet-500 flex-shrink-0" strokeWidth={1.5} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                  )}
                </div>

                {isOpen && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-navy-800 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-20 bg-navy-900 text-ivory-100 text-center px-4 sm:px-6 lg:px-8 border-t border-navy-800 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Saatnya naik kelas dari catatan manual ke CRM fashion modern.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Jangan biarkan pembeli setia tokomu terlupakan. Gabung bersama ratusan pemilik butik dan brand lokal lainnya sekarang.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button
                variant="secondary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
              >
                Mulai Gratis Hari Ini
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-navy-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 text-xs border-t border-navy-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-xs">
              T
            </div>
            <span className="font-bold text-sm text-white">Threadly</span>
            <span className="text-slate-500 ml-2">&bull; &quot;Kenali pelangganmu, ajak mereka kembali.&quot;</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition">
              Kebijakan Privasi
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Syarat Layanan
            </Link>
            <Link href="/login" className="hover:text-white transition">
              Masuk Toko
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-navy-900 text-center sm:text-left text-slate-500">
          &copy; {new Date().getFullYear()} Threadly. Hak Cipta Dilindungi Undang-Undang. Zona Waktu WIB (Asia/Jakarta).
        </div>
      </footer>
    </div>
  );
}
