# Threadly - B2B Fashion CRM SaaS UMKM Indonesia

> **Tagline:** *"Kenali pelangganmu, ajak mereka kembali."*

Threadly adalah platform Customer Relationship Management (CRM) dan manajemen inventaris varian busana terpadu yang dirancang khusus untuk pasar fashion UMKM di Indonesia — mencakup butik, toko pakaian, thrift shop, distro, dan brand lokal independen.

---

## 🌟 Fitur Utama

1. **CRM Pelanggan Cerdas**
   - Pencatatan profil lengkap: nama, nomor WhatsApp, alamat, ukuran favorit (S/M/L/XL/All Size), warna favorit, gaya busana, kisaran budget, label kustom, dan catatan khusus.
   - Deteksi otomatis nomor WhatsApp duplikat.
   - **Kalkulasi Siklus Pelanggan Otomatis:**
     - **Baru:** Belum pernah bertransaksi.
     - **Aktif:** Membeli dalam 60 hari terakhir.
     - **Setia:** Minimal 3 pesanan dan membeli dalam 90 hari terakhir.
     - **Tidur:** Tidak bertransaksi lebih dari 60 hari.
     - *(Seluruh ambang batas dapat disesuaikan pada Pengaturan Toko)*.
   - Statistik otomatis: Total belanja, jumlah transaksi, rata-rata nilai pesanan, dan tanggal pembelian terakhir.

2. **Produk & Stok Varian Real-Time**
   - Manajemen katalog produk: SKU, kategori, harga jual, harga modal, deskripsi, dan foto produk.
   - Kombinasi varian ukuran dan warna dengan stok independen.
   - Peringatan stok menipis (low-stock warning) otomatis berdasarkan batas minimum per varian.
   - Riwayat mutasi stok lengkap (masuk, keluar, adjustment, pemotongan pesanan, pengembalian pembatalan).

3. **Alur Pesanan & Faktur Penjualan PDF**
   - Pembuatan dan pembaruan pesanan manual atau otomatis dari etalase.
   - Alur status lengkap: *Menunggu Pembayaran, DP, Lunas, Dikemas, Dikirim, Selesai, Batal*.
   - Input nomor resi pengiriman ekspedisi (JNE, J&T, SiCepat, SPX, dll).
   - **Otomatisasi Stok:** Stok berkurang saat pesanan dikonfirmasi dan dikembalikan saat pesanan dibatalkan.
   - Unduh faktur/invoice penjualan PDF resmi dengan format mata uang Rupiah (`Rp1.250.000`) dan zona waktu WIB (`Asia/Jakarta`).

4. **Etalase Publik & Link Bio Cepat (`/[slug]`)**
   - Setiap toko memiliki halaman etalase publik yang dapat dipasang pada bio Instagram atau status WhatsApp.
   - Menampilkan katalog dan stok varian yang akurat. Varian habis otomatis dicoret.
   - Formulir pemesanan langsung terintegrasi dengan proteksi bot honeypot dan rate limiting.
   - Notifikasi pesanan baru masuk secara real-time pada dashboard penjual.

5. **Tindak Lanjut Retensi Otomatis (WhatsApp)**
   - Pembangkitan otomatis daftar tugas:
     - Pelanggan memasuki tahap Tidur (&gt;60 hari).
     - Pesanan menunggu pembayaran lebih dari 24 jam.
     - Ulang tahun pelanggan (H-3 hingga hari H).
     - Restock varian busana yang diminati pelanggan.
   - Template pesan personalisasi dengan variabel `{nama}`, `{toko}`, `{toko_slug}`, `{produk}`, `{ukuran}`, `{warna}`.
   - Tombol **Kirim via WhatsApp** langsung membuka tautan `wa.me` tanpa membutuhkan API berbayar.

6. **Asisten AI Fashion**
   - **Tempel Chat ke Pesanan:** Ekstraksi obrolan pembeli menjadi format data pesanan terstruktur (nama, kontak, alamat, produk, ukuran, warna, jumlah) sebelum dikonfirmasi penjual.
   - **Penyusun Balasan Cerdas:** AI menyusun draf balasan ramah dan santun berbasis stok dan harga resmi katalog toko (anti-halusinasi).
   - **Ringkasan Preferensi Pelanggan:** Rangkuman cepat riwayat belanja dan selera busana pembeli.
   - Persona dan gaya bahasa AI dapat diatur per toko.
   - Dilengkapi *Intelligent Heuristic Fallback Engine* sehingga aplikasi tetap berfungsi penuh meskipun `LLM_API_KEY` belum diisi. Perlindungan dari prompt injection. Log pencatatan pada tabel `ai_runs`.

7. **Dashboard Analitik & Impor/Ekspor CSV**
   - Metrik omzet, jumlah pesanan, pelanggan baru, dan pelanggan tidur.
   - Filter periode: hari ini, 7 hari, 30 hari, semua.
   - Impor data CSV pelanggan & produk dengan pratinjau dan validasi baris.
   - Ekspor data CSV kapan saja.

8. **Dashboard Super Admin Platform (`/admin`)**
   - Terlindungi di sisi server dan RLS (hanya pengguna dengan `is_superadmin = true`).
   - Statistik agregat seluruh platform (total toko, pengguna, pelanggan agregat, transaksi agregat, pemakaian AI).
   - Daftar seluruh toko: aktivasi/nonaktifkan toko.
   - **Mode Dukungan Teknis ("Lihat sebagai toko"):** Mengharuskan pengisian alasan resmi, dicatat permanen pada `audit_logs`, dan memunculkan banner sesi kuning selama inspeksi.

9. **Arsitektur Masa Depan (Forward Omnichannel Scaffolding)**
   - Struktur tabel `conversations` dan `messages` dengan Row Level Security.
   - Antarmuka `ChannelAdapter` (`connect`, `verifyWebhook`, `parseIncoming`, `sendMessage`) yang terdokumentasi rapi untuk persiapan integrasi omnichannel masa depan (WhatsApp Cloud, Shopee, Tokopedia, TikTok Shop).

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling & UI:** Tailwind CSS, Lucide React (Stroke 1.5, No Emojis)
- **Desain Warna:** Navy Gelap (`#0F172A`), Violet Lembut (`#7C6CF0`), Ivory White (`#FAF9F6`)
- **Database & Auth:** Supabase PostgreSQL, Row Level Security (RLS), Supabase Storage
- **PDF Generation:** jsPDF
- **CSV Engine:** PapaParse

---

## 🚀 Panduan Menjalankan Secara Lokal

### 1. Klon Repositori & Pasang Dependensi
```bash
git clone https://github.com/your-username/threadly.git
cd threadly
npm install
```

### 2. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi variabel environment sesuai kebutuhan:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
LLM_PROVIDER=openai
LLM_API_KEY=your-openai-api-key # Opsional: jika kosong, fallback engine cerdas akan bekerja
```

### 3. Jalankan Skrip Seed Data Pengembangan
```bash
npm run seed
```
Skrip ini akan membuat data simulasi toko butik, varian stok pakaian, pelanggan di berbagai tahap loyalitas, pesanan, dan tugas retensi.

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## ☁️ Panduan Deploy ke Supabase

1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Masuk ke menu **SQL Editor**, buka file `supabase/migrations/001_initial_schema.sql` pada repositori ini, lalu klik **Run** untuk membuat seluruh tabel, relasi, indeks, dan RLS policies.
3. Masuk ke menu **Storage** &gt; Buat bucket baru bernama `product-images` dengan akses publik agar foto produk dapat diunggah dan dilihat.
4. Salin **Project URL**, **Anon Key**, dan **Service Role Key** dari menu **Project Settings &gt; API**.
5. Untuk menetapkan Super Admin, jalankan query berikut di SQL Editor:
   ```sql
   UPDATE public.profiles
   SET is_superadmin = true
   WHERE email = 'andariftri7@gmail.com';
   -- Catatan: Super admin login menggunakan email andariftri7@gmail.com
   ```

---

## ⚡ Panduan Deploy ke Vercel

1. Dorong repositori ke GitHub / GitLab.
2. Buka [Vercel Dashboard](https://vercel.com) dan klik **Add New &gt; Project**.
3. Pilih repositori `threadly`.
4. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (misal: `https://threadly.vercel.app`)
   - `APP_URL`
   - `LLM_PROVIDER` (misal: `openai`)
   - `LLM_API_KEY` (kunci API model LLM)
5. Klik **Deploy**. Vercel akan otomatis membangun aplikasi Next.js App Router secara optimal.

---

## 🛡️ Hak Cipta & Lisensi
Hak Cipta &copy; 2026 Threadly Indonesia. Dibangun untuk memajukan daya saing UMKM fashion nusantara.
