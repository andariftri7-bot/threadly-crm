'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import {
  Users,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { Button, Badge, Card, Modal } from '@/components/ui';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function LandingPage() {
  const router = useRouter();
  const { login } = useStore();

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Mobile menu drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hidden Super Admin modal state (Ctrl + Shift + A)
  const [isSuperadminModalOpen, setIsSuperadminModalOpen] = useState(false);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsSuperadminModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSuperadminGoogleAuth = async () => {
    setIsAdminLoggingIn(true);
    try {
      await login('andariftri7@gmail.com', 'owner');
      router.push('/superadmin');
    } catch {
      setIsAdminLoggingIn(false);
    }
  };

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
    <div className="min-h-screen min-h-screen-dvh bg-background text-foreground font-sans selection:bg-secondary selection:text-white">
      {/* 1. STICKY NAVBAR */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary dark:bg-secondary text-primary-foreground dark:text-secondary-foreground flex items-center justify-center font-bold text-base shadow-sm">
              T
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Threadly
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-muted-foreground">
            <a href="#masalah" className="hover:text-secondary transition">
              Masalah
            </a>
            <a href="#solusi" className="hover:text-secondary transition">
              Solusi
            </a>
            <a href="#cara-kerja" className="hover:text-secondary transition">
              Cara Kerja
            </a>
            <a href="#fitur" className="hover:text-secondary transition">
              Fitur
            </a>
            <a href="#harga" className="hover:text-secondary transition">
              Harga
            </a>
            <a href="#faq" className="hover:text-secondary transition">
              FAQ
            </a>
          </nav>

          {/* Desktop Auth & Theme Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

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

          {/* Mobile Right Bar: Theme Toggle + Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu Navigasi"
              className="p-2.5 rounded-xl border border-border text-foreground hover:bg-muted touch-target flex items-center justify-center"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              ) : (
                <Menu className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2 text-sm font-semibold text-foreground">
              <a
                href="#masalah"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted"
              >
                Masalah
              </a>
              <a
                href="#solusi"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted"
              >
                Solusi
              </a>
              <a
                href="#cara-kerja"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted"
              >
                Cara Kerja
              </a>
              <a
                href="#fitur"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted"
              >
                Fitur
              </a>
              <a
                href="#harga"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted"
              >
                Harga
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-muted"
              >
                FAQ
              </a>
            </nav>

            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full min-h-[44px]">
                  Masuk ke Toko
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="secondary" size="md" className="w-full min-h-[44px]">
                  Mulai Coba Gratis 7 Hari
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hidden Superadmin Login Modal (Triggered by Ctrl + Shift + A) */}
      <Modal
        isOpen={isSuperadminModalOpen}
        onClose={() => setIsSuperadminModalOpen(false)}
        title="Akses Super Administrator"
        description="Portal otorisasi root manajemen sistem Threadly."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Portal Terproteksi</p>
              <p className="text-[11px] text-muted-foreground">Kombinasi tombol rahasia aktif.</p>
            </div>
          </div>

          <button
            type="button"
            disabled={isAdminLoggingIn}
            onClick={handleSuperadminGoogleAuth}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl border border-secondary/40 bg-secondary/10 hover:bg-secondary/20 text-foreground font-bold text-xs flex items-center justify-center gap-2.5 transition shadow-sm touch-target"
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
            <span>Masuk via Google (andariftri7@gmail.com)</span>
          </button>

          <div className="pt-2 border-t border-border text-center">
            <Link
              href="/superadmin/login"
              onClick={() => setIsSuperadminModalOpen(false)}
              className="text-xs text-secondary hover:underline font-semibold"
            >
              Buka Halaman Otorisasi Kredensial Khusus &rarr;
            </Link>
          </div>
        </div>
      </Modal>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative rounded-3xl bg-[#0F172A] bg-gradient-brand text-white p-8 sm:p-14 lg:p-16 text-center space-y-6 shadow-2xl border border-white/10 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#5B4BDB] bg-gradient-accent opacity-25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#C9A96E] opacity-15 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#EBD9B4]" strokeWidth={1.5} />
            <span>Platform CRM Khusus Fashion UMKM Indonesia</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Kenali pelangganmu, ajak mereka kembali.
          </h1>

          <p className="text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
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
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/15 text-white border-white/30 hover:bg-white/25">
                Pelajari Cara Kerja
              </Button>
            </a>
          </div>

          <p className="text-xs text-slate-300 pt-1 font-semibold">
            Tidak perlu kartu kredit &bull; Siap pakai dalam 2 menit &bull; Dukungan penuh UMKM
          </p>
        </div>
      </section>

      {/* 3. PROBLEM SECTION */}
      <section id="masalah" className="py-20 bg-muted/50 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Tantangan Nyata Penjual Fashion UMKM
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Kebanyakan pemilik butik dan thrift kehilangan hingga 40% repeat order karena masalah klasik ini:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-3 border-destructive/20 bg-destructive/5">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-base text-card-foreground">
                Preferensi Pelanggan Terlupakan
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Ukuran favorit (S/M/L) dan warna yang disukai pembeli hilang di tumpukan riwayat chat WhatsApp. Penjual menanyakan ulang info yang sama sehingga terasa tidak profesional.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-warning/20 bg-warning/5">
              <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center">
                <Users className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-base text-card-foreground">
                Pelanggan Lama Tidak Dihubungi
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Pembeli yang pernah puas berbelanja dibiarkan begitu saja tanpa pernah disapa kembali saat ada restock koleksi baru yang sesuai ukuran mereka.
              </p>
            </Card>

            <Card className="p-6 space-y-3 border-secondary/20 bg-secondary/5">
              <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                <Layers className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-base text-card-foreground">
                Stok Varian Ukuran Tidak Akurat
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Didesain Khusus untuk Karakter Fashion Lokal
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Satu ekosistem lengkap untuk mengubah pembeli satu kali menjadi pelanggan setia berulang kali.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Users className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-lg text-card-foreground">
              Profil CRM Busana Terlengkap
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Catat ukuran favorit, warna yang disukai, gaya busana, hingga tanggal lahir. Tahap loyalitas (Baru, Aktif, Setia, Tidur) dan total belanja terhitung otomatis setiap ada pesanan baru.
            </p>
          </Card>

          <Card className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-success/15 text-success flex items-center justify-center">
              <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-lg text-card-foreground">
              Tindak Lanjut WhatsApp 1-Klik
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Daftar pelanggan yang tidur (&gt;60 hari) atau pesanan yang belum dibayar (&gt;24 jam) otomatis muncul dengan tautan WhatsApp wa.me siap kirim tanpa repot mengetik template.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. 3-STEP HOW IT WORKS */}
      <section id="cara-kerja" className="py-20 bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Cara Kerja Tiga Langkah Sederhana
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Mulai dari pendaftaran hingga peningkatan omzet toko dalam hitungan hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
                1
              </div>
              <h3 className="font-bold text-base text-foreground">
                Daftar &amp; Masukkan Koleksi
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Buat toko dalam 2 menit. Input busana beserta variasi ukuran (S, M, L) dan warna dengan jumlah stok masing-masing.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-secondary text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
                2
              </div>
              <h3 className="font-bold text-base text-foreground">
                Pasang Link Bio &amp; Catat Pesanan
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Salin tautan etalase publik ke bio Instagram/TikTok. Pesanan yang masuk otomatis memotong stok varian dan mencatat profil pembeli.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-success text-success-foreground font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
                3
              </div>
              <h3 className="font-bold text-base text-foreground">
                Ajak Kembali dengan Retensi
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
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
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Tempel Chat WhatsApp Menjadi Pesanan Rapi
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Cukup salin teks obrolan pembeli yang berantakan, AI Threadly mengekstrak nama, nomor HP, alamat tujuan, produk, ukuran, dan jumlah dalam format terstruktur. Kamu tinggal mengonfirmasi sebelum disimpan!
            </p>
          </div>
          <Card className="p-6 bg-muted/40 border border-border text-xs font-mono space-y-2">
            <div className="text-muted-foreground uppercase font-bold text-[10px]">Contoh Ekstraksi:</div>
            <p className="text-foreground font-medium">
              &quot;Mbak mau pesen Kemeja Linen Broken White size M 1 pcs, kirim ke Jl. Kemang No. 14, Rania (08123456789)&quot;
            </p>
            <div className="p-3 bg-card rounded-xl border border-secondary/30 text-secondary space-y-1 font-semibold">
              <p>&bull; Pelanggan: Rania (08123456789)</p>
              <p>&bull; Produk: Kemeja Linen (Broken White / M) &times; 1</p>
              <p>&bull; Status: Menunggu Pembayaran</p>
            </div>
          </Card>
        </div>

        {/* Feature 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <Card className="order-2 md:order-1 p-6 bg-muted/40 border border-border space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-border pb-2">
              <span className="font-bold text-card-foreground">Koleksi Busana</span>
              <span className="font-bold text-card-foreground">Stok Varian</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-card-foreground">Kemeja Linen &bull; Size M / Sage</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold">15 pcs</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-card-foreground">Kulot Highwaist &bull; Size L / Hitam</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold">2 pcs (Menipis)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-card-foreground">Midi Dress Floral &bull; Size S / Cream</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700 font-bold">0 pcs (Habis)</span>
            </div>
          </Card>
          <div className="space-y-4 order-1 md:order-2">
            <Badge variant="success">Stok Varian &amp; Mutasi</Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Kendali Mutasi Stok Tanpa Khawatir Selisih
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
              Setiap kali pesanan dikonfirmasi lunas, stok varian otomatis berkurang. Jika pesanan dibatalkan, stok langsung dikembalikan ke rak. Lengkap dengan riwayat mutasi masuk, keluar, dan peringatan stok menipis.
            </p>
          </div>
        </div>
      </section>

      {/* 7. PRICING PLANS SECTION */}
      <section id="harga" className="py-20 bg-card border-y border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="purple">Pilihan Paket Langganan</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-card-foreground">
              Investasi Terjangkau untuk Pertumbuhan Toko Fashion
            </h2>
            <p className="text-xs text-amber-900 dark:text-amber-200 font-semibold bg-amber-100 dark:bg-amber-950/70 p-2.5 rounded-xl inline-block border border-amber-300 dark:border-amber-700">
              Pembayaran belum diaktifkan; seluruh akun baru mendapat masa coba 7 hari gratis
            </p>
          </div>

          {/* 2 Column Cards: Standar vs Pro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Paket Standar: Rp20.000/bln */}
            <Card className="p-8 space-y-6 border-2 border-border flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Paket Standar
                  </span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold text-card-foreground">
                      Rp20.000
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">/ bulan</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-medium">
                    Solusi esensial untuk butik dan thrift shop yang mulai merapikan basis pelanggan dan stok varian.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
                    <span><strong className="text-card-foreground">1 toko</strong>, <strong className="text-card-foreground">2 pengguna</strong> (1 Owner dan 1 Staff)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
                    <span>Hingga <strong className="text-card-foreground">300 pelanggan</strong> dan <strong className="text-card-foreground">100 produk</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
                    <span>Pesanan, stok varian, dan invoice PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
                    <span>Etalase publik dan form pesan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
                    <span>Tindak lanjut dasar (pelanggan Tidur dan pesanan unpaid)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
                    <span>Ekspor data CSV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" strokeWidth={1.5} />
                    <span>Asisten AI: <strong className="text-card-foreground">30 pemakaian</strong> per bulan</span>
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
            <Card className="p-8 space-y-6 border-2 border-secondary bg-secondary/5 relative shadow-lg flex flex-col justify-between">
              <div className="absolute -top-3 right-6">
                <span className="bg-secondary text-white text-[10px] uppercase font-extrabold px-3 py-1 rounded-full shadow-sm">
                  Paling Populer
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    Paket Pro
                  </span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-extrabold text-card-foreground">
                      Rp45.000
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">/ bulan</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-medium">
                    Fitur lengkap tanpa batas untuk brand lokal yang agresif mengejar repeat order berkelanjutan.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={1.5} />
                    <span><strong className="text-card-foreground">1 toko</strong>, hingga <strong className="text-card-foreground">5 pengguna</strong> tim</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={1.5} />
                    <span><strong className="text-card-foreground">Pelanggan dan produk tanpa batas</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={1.5} />
                    <span>Semua fitur Paket Standar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={1.5} />
                    <span>Tindak lanjut lengkap (Ultah &amp; Restock) + template kustom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={1.5} />
                    <span>Impor dan ekspor CSV lengkap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={1.5} />
                    <span>Dashboard lanjutan (produk terlaris &amp; filter kustom)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={1.5} />
                    <span>Asisten AI: <strong className="text-card-foreground">300 pemakaian</strong>/bulan + persona kustom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={1.5} />
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
            <h3 className="text-lg font-bold text-card-foreground text-center">
              Perbandingan Fitur Lengkap
            </h3>

            <div className="bg-card border border-border rounded-2xl overflow-x-auto shadow-sm">
              <table className="w-full min-w-[500px] text-xs text-left">
                <thead className="bg-muted text-[11px] font-bold text-muted-foreground uppercase border-b border-border">
                  <tr>
                    <th className="p-4">Fitur Layanan</th>
                    <th className="p-4 text-center">Standar (Rp20.000/bln)</th>
                    <th className="p-4 text-center text-secondary">Pro (Rp45.000/bln)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4 font-semibold text-card-foreground">Batas Pengguna</td>
                    <td className="p-4 text-center text-muted-foreground font-medium">2 Pengguna (Owner + Staff)</td>
                    <td className="p-4 text-center font-bold text-secondary">Hingga 5 Pengguna</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-card-foreground">Kapasitas Basis Pelanggan</td>
                    <td className="p-4 text-center text-muted-foreground font-medium">300 Pelanggan</td>
                    <td className="p-4 text-center font-bold text-secondary">Tanpa Batas</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-card-foreground">Kapasitas Katalog Produk</td>
                    <td className="p-4 text-center text-muted-foreground font-medium">100 Produk</td>
                    <td className="p-4 text-center font-bold text-secondary">Tanpa Batas</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-card-foreground">Tindak Lanjut Retensi WhatsApp</td>
                    <td className="p-4 text-center text-muted-foreground font-medium">Dasar (Tidur &amp; Unpaid)</td>
                    <td className="p-4 text-center font-bold text-secondary">Lengkap (Ultah + Restock + Kustom)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-card-foreground">Impor &amp; Ekspor CSV</td>
                    <td className="p-4 text-center text-muted-foreground font-medium">Hanya Ekspor CSV</td>
                    <td className="p-4 text-center font-bold text-secondary">Impor &amp; Ekspor Lengkap</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-card-foreground">Asisten AI Fashion</td>
                    <td className="p-4 text-center text-muted-foreground font-medium">30 Pemakaian / Bulan</td>
                    <td className="p-4 text-center font-bold text-secondary">300 Pemakaian / Bulan + Persona Kustom</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-card-foreground">Dashboard Analisis Lanjutan</td>
                    <td className="p-4 text-center text-muted-foreground font-medium">-</td>
                    <td className="p-4 text-center font-bold text-success">Termasuk</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold text-card-foreground">Dukungan Prioritas</td>
                    <td className="p-4 text-center text-muted-foreground font-medium">Standar</td>
                    <td className="p-4 text-center font-bold text-success">Prioritas WhatsApp</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="purple">Pertanyaan Populer</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Segala hal yang perlu kamu ketahui tentang pengoperasian Threadly CRM.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <Card
                key={idx}
                className="p-5 cursor-pointer transition border border-border"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-bold text-sm text-card-foreground">
                    {faq.q}
                  </h4>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-secondary flex-shrink-0" strokeWidth={1.5} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                  )}
                </div>

                {isOpen && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border leading-relaxed font-medium">
                    {faq.a}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-20 bg-[#0F172A] bg-gradient-brand text-white text-center px-4 sm:px-6 lg:px-8 border-t border-white/10 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Saatnya naik kelas dari catatan manual ke CRM fashion modern.
          </h2>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto font-medium">
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
      <footer className="bg-[#0B1020] text-slate-300 py-12 px-4 sm:px-6 lg:px-8 text-xs border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-secondary text-white flex items-center justify-center font-bold text-xs">
              T
            </div>
            <span className="font-bold text-sm text-white">Threadly</span>
            <span className="text-slate-400 ml-2">&bull; &quot;Kenali pelangganmu, ajak mereka kembali.&quot;</span>
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
        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-white/10 text-center sm:text-left text-slate-400">
          &copy; {new Date().getFullYear()} Threadly. Hak Cipta Dilindungi Undang-Undang. Zona Waktu WIB (Asia/Jakarta).
        </div>
      </footer>
    </div>
  );
}
