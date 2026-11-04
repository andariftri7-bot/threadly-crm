# Panduan Setup Supabase untuk Threadly di GitHub & Production

Panduan ini menjelaskan langkah demi langkah cara menghubungkan repositori GitHub **Threadly** ke project **Supabase** (baik lokal menggunakan Supabase CLI maupun cloud di Supabase Platform).

---

## 1. Persiapan Proyek di Supabase Cloud

1. Buka [database.new](https://database.new) dan masuk dengan akun GitHub Anda.
2. Buat proyek baru:
   - **Name**: `Threadly CRM`
   - **Database Password**: *(Simpan kata sandi ini dengan aman)*
   - **Region**: Pilih yang terdekat (contoh: `Singapore - ap-southeast-1` untuk latensi terendah di Indonesia).
3. Setelah proyek dibuat, buka menu **Project Settings** $\rightarrow$ **API**:
   - Salin **Project URL** (contoh: `https://xyzcompany.supabase.co`).
   - Salin **anon public key**.
   - Salin **service_role secret key** *(Hanya untuk server/backend superadmin)*.

---

## 2. Menjalankan Migrasi Database

### Opsi A: Melalui Supabase SQL Editor (Paling Cepat & Mudah)
1. Buka menu **SQL Editor** di dashboard Supabase Anda.
2. Buat query baru, buka file [`supabase/migrations/001_initial_schema.sql`](./migrations/001_initial_schema.sql), salin seluruh isinya, lalu klik **Run**.
3. Buat query baru, buka file [`supabase/migrations/002_superadmin_security.sql`](./migrations/002_superadmin_security.sql), salin seluruh isinya, lalu klik **Run**.
4. (Opsional untuk data demo) Buka file [`supabase/seed.sql`](./seed.sql), salin seluruh isinya, lalu klik **Run**.

### Opsi B: Menggunakan Supabase CLI
```bash
# Login ke Supabase CLI
npx supabase login

# Hubungkan ke proyek Supabase Anda
npx supabase link --project-ref <PROJECT_REF_ANDA>

# Push seluruh migrasi secara otomatis
npx supabase db push

# (Opsional) Jalankan data seed
npx supabase db reset
```

---

## 3. Konfigurasi Environment Variables

Buat file `.env.local` di root proyek (atau duplikasi dari `.env.example`):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Super Admin Dedicated Email
SUPERADMIN_EMAIL=andariftri7@gmail.com
```

---

## 4. Konfigurasi GitHub Actions & Deployment (Vercel / Hosting)

### Menambahkan ke GitHub Secrets (Untuk CI/CD):
Buka repositori GitHub Anda $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPERADMIN_EMAIL`: `andariftri7@gmail.com`

### Menambahkan ke Platform Hosting (Vercel / Railway / Netlify):
Tambahkan variabel lingkungan yang sama di panel **Environment Variables** platform hosting Anda.

---

## 5. Konfigurasi Otentikasi Supabase

Buka menu **Authentication** $\rightarrow$ **URL Configuration** di Supabase Dashboard:
- **Site URL**: `https://domain-anda.vercel.app` (atau `http://localhost:3000` saat development).
- **Redirect URLs**:
  - `http://localhost:3000/**`
  - `https://*.vercel.app/**`
  - `https://domain-anda.com/**`

---

## Struktur File Supabase di Repositori

```
supabase/
├── config.toml                     # Konfigurasi Supabase CLI & lokal
├── seed.sql                        # Data awal toko UMKM, user, produk, pesanan
├── migrations/
│   ├── 001_initial_schema.sql      # Skema 14 tabel, constraint, dan aturan RLS
│   └── 002_superadmin_security.sql # Keamanan & isolasi super admin
└── README.md                       # Panduan setup ini
src/
├── lib/supabase/
│   ├── client.ts                   # Client browser Next.js (CSR)
│   ├── server.ts                   # Client server-side Next.js (SSR / Server Actions)
│   └── middleware.ts               # Handler refresh sesi Supabase
└── types/
    └── supabase.ts                 # Definisi tipe TypeScript lengkap Database Supabase
```
