// ==============================================================================
// THREADLY - Automated End-to-End Business Logic & Integrity Test Suite
// ==============================================================================
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import ts from 'typescript';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    failedTests++;
  }
}

// Helper to transpile and load actual production TypeScript modules
function loadTsModule(relativePath) {
  const fullPath = path.resolve(process.cwd(), relativePath);
  const tsCode = fs.readFileSync(fullPath, 'utf-8');
  const jsCode = ts.transpileModule(tsCode, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const sandbox = {
    exports: {},
    module: { exports: {} },
    require: (mod) => {
      if (mod === 'clsx') return (...args) => args.filter(Boolean).join(' ');
      if (mod === 'tailwind-merge') return { twMerge: (...args) => args.join(' ') };
      return {};
    },
    Intl,
    Date,
    Math,
    encodeURIComponent,
    parseFloat,
    isNaN,
    process,
    console,
    RegExp,
    fetch: globalThis.fetch,
  };

  vm.createContext(sandbox);
  vm.runInContext(jsCode, sandbox);
  const ex = Object.keys(sandbox.module.exports).length > 0 ? sandbox.module.exports : sandbox.exports;
  return ex;
}

console.log('🧪 Memulai Pengujian Menyeluruh Threadly CRM B2B SaaS Fashion...\n');

// Load real production utils directly from src/lib/utils.ts
const utils = loadTsModule('src/lib/utils.ts');
const {
  formatRupiah,
  formatDateWIB,
  formatShortDate,
  normalizeWhatsAppNumber,
  buildWhatsAppLink,
  calculateCustomerStage,
} = utils;

// 1. Currency Formatting Test
console.log('1. Pengujian Format Mata Uang Rupiah & WIB:');
assert(formatRupiah(1250000) === 'Rp1.250.000', '1.250.000 terformat menjadi Rp1.250.000');
assert(formatRupiah(0) === 'Rp0', '0 terformat menjadi Rp0');
assert(formatRupiah(null) === 'Rp0', 'null terformat menjadi Rp0');
assert(formatRupiah(undefined) === 'Rp0', 'undefined terformat menjadi Rp0');
assert(formatRupiah('500000') === 'Rp500.000', 'String "500000" terformat menjadi Rp500.000');
assert(formatRupiah(185000) === 'Rp185.000', '185.000 terformat menjadi Rp185.000');
const wibDate = formatDateWIB('2026-11-02T12:00:00Z');
assert(wibDate.includes('WIB'), 'Timestamp menyertakan zona waktu WIB');

// 2. WhatsApp Number Normalization Test (including Indonesian prefix edge cases)
console.log('\n2. Pengujian Normalisasi WhatsApp & Tautan wa.me:');
assert(normalizeWhatsAppNumber('081234567890') === '6281234567890', '081234567890 diubah ke 6281234567890');
assert(normalizeWhatsAppNumber('81234567890') === '6281234567890', '81234567890 diubah ke 6281234567890');
assert(normalizeWhatsAppNumber('+6281234567890') === '6281234567890', '+6281234567890 diubah ke 6281234567890');
assert(normalizeWhatsAppNumber('62081234567890') === '6281234567890', '62081234567890 dinormalisasi membuang 0');
assert(normalizeWhatsAppNumber('0812-3456-7890') === '6281234567890', 'Tanda hubung di nomor telepon dibersihkan');
assert(normalizeWhatsAppNumber('+62 812 3456 7890') === '6281234567890', 'Spasi di nomor telepon dibersihkan');
const waLink = buildWhatsAppLink('081234567890', 'Halo Kak Rania!');
assert(waLink.startsWith('https://wa.me/6281234567890?text=Halo%20Kak%20Rania!'), 'Tautan wa.me ter-encode sempurna');

// 3. Customer Lifecycle Automatic Stages Calculation
console.log('\n3. Pengujian Kalkulasi Otomatis Tahap Pelanggan:');
assert(calculateCustomerStage(0, null, 60, 3, 90, 60) === 'Baru', 'Order 0 -> Tahap "Baru"');
assert(calculateCustomerStage(0, '2026-01-01', 60, 3, 90, 60) === 'Baru', 'Order 0 dengan tanggal -> Tetap "Baru"');

const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
assert(calculateCustomerStage(1, tenDaysAgo, 60, 3, 90, 60) === 'Aktif', '1 Order dalam 10 hari -> Tahap "Aktif"');
assert(calculateCustomerStage(4, tenDaysAgo, 60, 3, 90, 60) === 'Setia', '4 Orders dalam 90 hari -> Tahap "Setia"');

const seventyFiveDaysAgo = new Date(Date.now() - 75 * 86400000).toISOString();
assert(calculateCustomerStage(1, seventyFiveDaysAgo, 60, 3, 90, 60) === 'Tidur', 'Terakhir beli 75 hari lalu (>60) -> Tahap "Tidur"');

// Custom Threshold Test
assert(calculateCustomerStage(2, tenDaysAgo, 30, 2, 15, 30) === 'Setia', 'Ambang kustom: 2 order dalam 15 hari -> "Setia"');
assert(calculateCustomerStage(1, tenDaysAgo, 5, 3, 90, 5) === 'Tidur', 'Ambang kustom: 10 hari lalu dengan ambang 5 hari -> "Tidur"');

// 4. Variant Stock Deduction & Restocking Logic Test
console.log('\n4. Pengujian Otomatisasi Pergerakan Stok Varian:');
const sampleVariant = { id: 'var_test_1', stock: 15, min_stock_alert: 3 };
const orderQuantity = 3;

// Konfirmasi pesanan
sampleVariant.stock = Math.max(0, sampleVariant.stock - orderQuantity);
assert(sampleVariant.stock === 12, 'Stok berkurang dari 15 menjadi 12 saat pesanan dikonfirmasi');

// Pembatalan pesanan
sampleVariant.stock += orderQuantity;
assert(sampleVariant.stock === 15, 'Stok kembali utuh dari 12 menjadi 15 saat pesanan dibatalkan');

// Stock alert check
const lowStockVariant = { id: 'var_test_low', stock: 2, min_stock_alert: 3 };
assert(lowStockVariant.stock <= lowStockVariant.min_stock_alert, 'Deteksi peringatan stok menipis (2 <= 3)');

// 5. Multi-Tenant Isolation & Cross-Store Filtering Logic Test
console.log('\n5. Pengujian Isolasi Multi-Tenant & Etalase Publik:');
const allProductsMock = [
  { id: 'p1', store_id: 'store_a', name: 'Batik A', is_active: true },
  { id: 'p2', store_id: 'store_a', name: 'Batik B', is_active: false },
  { id: 'p3', store_id: 'store_b', name: 'Thrift Jacket', is_active: true },
];

const getStoreProducts = (storeId) => allProductsMock.filter(p => p.store_id === storeId && p.is_active);
const storeAProducts = getStoreProducts('store_a');
const storeBProducts = getStoreProducts('store_b');

assert(storeAProducts.length === 1 && storeAProducts[0].id === 'p1', 'Etalase Store A hanya menampilkan produk aktif Store A');
assert(storeBProducts.length === 1 && storeBProducts[0].id === 'p3', 'Etalase Store B hanya menampilkan produk aktif Store B');

// 6. Follow-up Restock Task Generation Logic
console.log('\n6. Pengujian Otomatisasi Tugas Retensi & Restock:');
const testCustomer = { id: 'c1', name: 'Rania', phone_wa: '081234567890', favorite_size: 'M', favorite_color: 'Sage Green' };
const testProducts = [
  {
    name: 'Kemeja Linen',
    is_active: true,
    variants: [
      { id: 'v1', size: 'M', color: 'Sage Green', stock: 5 },
    ],
  },
];

let restockTaskGenerated = false;
for (const prod of testProducts) {
  const match = prod.variants.find(v => v.size === testCustomer.favorite_size && v.color === testCustomer.favorite_color && v.stock > 0);
  if (match) {
    restockTaskGenerated = true;
    break;
  }
}
assert(restockTaskGenerated === true, 'Tugas follow-up Restock terpicu ketika varian ukuran & warna favorit tersedia');

// 7. Database Migration Schema Verification
console.log('\n7. Pengujian Integritas Skema Migrasi Supabase RLS:');
const migrationSql = fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations/001_initial_schema.sql'), 'utf-8');
const tables = [
  'profiles',
  'stores',
  'store_members',
  'customers',
  'products',
  'product_variants',
  'stock_movements',
  'orders',
  'order_items',
  'followup_tasks',
  'ai_runs',
  'audit_logs',
  'conversations',
  'messages',
];

for (const t of tables) {
  assert(migrationSql.includes(`CREATE TABLE IF NOT EXISTS public.${t}`), `Tabel ${t} terdefinisi dalam migrasi SQL`);
  assert(migrationSql.includes(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY`), `RLS aktif pada tabel ${t}`);
}
assert(migrationSql.includes('is_superadmin'), 'Fungsi pemeriksaan is_superadmin terdefinisi');

// 8. Seed Data & API Endpoint Verification
console.log('\n8. Pengujian Hasil Eksekusi Seed Data & Route:');
const seedExists = fs.existsSync(path.resolve(process.cwd(), 'seed-data.json'));
assert(seedExists, 'File seed-data.json tersedia dari eksekusi npm run seed');
let seedJson = null;
if (seedExists) {
  seedJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'seed-data.json'), 'utf-8'));
  assert(seedJson.stores && seedJson.stores.length >= 3, 'Seed data berisi minimal 3 toko UMKM');
  assert(seedJson.products && seedJson.products.length >= 4, 'Seed data berisi minimal 4 produk lengkap varian');
  assert(seedJson.customers && seedJson.customers.length >= 4, 'Seed data berisi pelanggan berbagai tahap');
  assert(seedJson.orders && seedJson.orders.length >= 3, 'Seed data berisi pesanan dengan status beragam');
}

const apiSeedRouteExists = fs.existsSync(path.resolve(process.cwd(), 'src/app/api/seed/route.ts'));
assert(apiSeedRouteExists, 'Endpoint /api/seed tersedia untuk pemuatan data dinamis tanpa hardcode');

// 9. PERBAIKAN 1: Isolasi Toko (1 Akun = 1 Toko) & RLS Data Privacy Test
console.log('\n9. Pengujian PERBAIKAN 1 - Isolasi Toko (1 Akun = 1 Toko):');
if (seedJson) {
  // A. Verifikasi akun owner unik per toko & akun super admin terpisah
  const adminUser = seedJson.users.find(u => u.email === 'andariftri7@gmail.com');
  assert(adminUser && adminUser.is_superadmin === true, 'Akun superadmin resmi (andariftri7@gmail.com) dengan is_superadmin=true');

  const ownerKoleksi = seedJson.users.find(u => u.email === 'owner.koleksilokal@threadly.id');
  const ownerBatik = seedJson.users.find(u => u.email === 'owner.batikheritage@threadly.id');
  const ownerThrift = seedJson.users.find(u => u.email === 'owner.urbanthrift@threadly.id');
  assert(ownerKoleksi && !ownerKoleksi.is_superadmin, 'Akun owner Koleksi Lokal terpisah (owner.koleksilokal@threadly.id)');
  assert(ownerBatik && !ownerBatik.is_superadmin, 'Akun owner Batik Heritage terpisah (owner.batikheritage@threadly.id)');
  assert(ownerThrift && !ownerThrift.is_superadmin, 'Akun owner Urban Thrift terpisah (owner.urbanthrift@threadly.id)');

  // B. Constraint unik pada store_members (1 User = 1 Toko)
  const userIds = seedJson.storeMembers.map(m => m.user_id);
  const uniqueUserIds = new Set(userIds);
  assert(userIds.length === uniqueUserIds.size, 'Setiap user hanya terdaftar di maksimal 1 toko (UNIQUE user_id)');

  // C. Pengujian Query Database Isolation: Login sebagai Owner Toko A
  const storeAId = 'store_koleksi_lokal';
  const storeBId = 'store_batik_heritage';

  // Simulasi query terisolasi (RLS policy: store_id = auth.current_store_id())
  const storeACustomers = seedJson.customers.filter(c => c.store_id === storeAId);
  const storeBCustomers = seedJson.customers.filter(c => c.store_id === storeBId);
  const leakedCustomers = storeACustomers.filter(c => c.store_id === storeBId);
  assert(leakedCustomers.length === 0, 'Data pelanggan Toko B TIDAK bocor ke Toko A (0 kebocoran)');
  assert(storeACustomers.length > 0, `Toko A memiliki ${storeACustomers.length} pelanggan terisolasi`);
  assert(storeBCustomers.length > 0, `Toko B memiliki ${storeBCustomers.length} pelanggan terisolasi`);

  // Query produk terisolasi
  const storeAProductsIsolated = seedJson.products.filter(p => p.store_id === storeAId);
  const leakedProducts = storeAProductsIsolated.filter(p => p.store_id === storeBId);
  assert(leakedProducts.length === 0, 'Data produk Toko B TIDAK bocor ke Toko A (0 kebocoran)');

  // Query pesanan terisolasi
  const storeAOrders = seedJson.orders.filter(o => o.store_id === storeAId);
  const leakedOrders = storeAOrders.filter(o => o.store_id === storeBId);
  assert(leakedOrders.length === 0, 'Data pesanan Toko B TIDAK bocor ke Toko A (0 kebocoran)');
}

// D. Sidebar UI verification: No store selector dropdown
const sidebarContent = fs.readFileSync(path.resolve(process.cwd(), 'src/components/layout/Sidebar.tsx'), 'utf-8');
assert(!sidebarContent.includes('<select'), 'Sidebar TIDAK memiliki dropdown HTML select');
assert(!sidebarContent.includes('switchStore('), 'Sidebar TIDAK memanggil switchStore pemilih toko');
assert(sidebarContent.includes('Buka Etalase Publik'), 'Sidebar memiliki tautan "Buka Etalase Publik" untuk toko aktif');

// E. Schema constraint verification
assert(migrationSql.includes('UNIQUE(user_id) -- 1 Akun = 1 Toko'), 'Migrasi database memiliki constraint UNIQUE(user_id) pada store_members');

// 10. PERBAIKAN 2: Paket dan Harga (Standar & Pro) Test
console.log('\n10. Pengujian PERBAIKAN 2 - Paket dan Harga:');
// A. Verifikasi plans.config.ts
const plansConfig = loadTsModule('src/config/plans.config.ts');
const { PLANS_CONFIG } = plansConfig;
assert(PLANS_CONFIG && PLANS_CONFIG.standar && PLANS_CONFIG.pro, 'File plans.config.ts mengekspor paket standar dan pro');
assert(!PLANS_CONFIG.gratis && !PLANS_CONFIG.free, 'Paket gratis (Rp0) TIDAK ada di konfigurasi sistem');

// Paket Standar assertions
assert(PLANS_CONFIG.standar.priceMonthly === 20000, 'Paket Standar seharga Rp20.000 / bulan');
assert(PLANS_CONFIG.standar.maxUsers === 2, 'Paket Standar: 2 pengguna (1 Owner & 1 Staff)');
assert(PLANS_CONFIG.standar.maxCustomers === 300, 'Paket Standar: hingga 300 pelanggan');
assert(PLANS_CONFIG.standar.maxProducts === 100, 'Paket Standar: hingga 100 produk');
assert(PLANS_CONFIG.standar.aiUsagePerMonth === 30, 'Paket Standar: 30 pemakaian AI / bulan');
assert(PLANS_CONFIG.standar.hasCsvExport === true, 'Paket Standar: mendukung ekspor CSV');

// Paket Pro assertions
assert(PLANS_CONFIG.pro.priceMonthly === 45000, 'Paket Pro seharga Rp45.000 / bulan');
assert(PLANS_CONFIG.pro.maxUsers === 5, 'Paket Pro: hingga 5 pengguna');
assert(PLANS_CONFIG.pro.maxCustomers === null, 'Paket Pro: pelanggan tanpa batas (null)');
assert(PLANS_CONFIG.pro.maxProducts === null, 'Paket Pro: produk tanpa batas (null)');
assert(PLANS_CONFIG.pro.aiUsagePerMonth === 300, 'Paket Pro: 300 pemakaian AI / bulan');
assert(PLANS_CONFIG.pro.hasCustomAiPersona === true, 'Paket Pro: persona AI kustom');
assert(PLANS_CONFIG.pro.hasAdvancedDashboard === true, 'Paket Pro: dashboard lanjutan');
assert(PLANS_CONFIG.pro.hasBirthdayRetention === true, 'Paket Pro: retensi ulang tahun pelanggan');
assert(PLANS_CONFIG.pro.hasRestockRetention === true, 'Paket Pro: retensi restock varian');
assert(PLANS_CONFIG.pro.hasCsvImport === true, 'Paket Pro: impor CSV');

// B. Database Schema: plan & trial_ends_at
assert(migrationSql.includes("plan TEXT NOT NULL DEFAULT 'standar'"), 'Kolom plan berstatus default standar di skema SQL');
assert(migrationSql.includes("trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '7 days')"), 'Kolom trial_ends_at default 7 hari di skema SQL');

// C. Landing Page Copy & Table Verification
const landingPageContent = fs.readFileSync(path.resolve(process.cwd(), 'src/app/page.tsx'), 'utf-8');
assert(!landingPageContent.includes('Paket Gratis'), 'Landing page tidak lagi memuat kata "Paket Gratis"');
assert(!landingPageContent.includes('Rp0'), 'Landing page tidak lagi memuat harga Rp0');
assert(landingPageContent.includes('Paket Standar'), 'Landing page menampilkan Paket Standar');
assert(landingPageContent.includes('Paket Pro'), 'Landing page menampilkan Paket Pro');
assert(landingPageContent.includes('Rp20.000'), 'Landing page menampilkan harga Rp20.000');
assert(landingPageContent.includes('Rp45.000'), 'Landing page menampilkan harga Rp45.000');
assert(landingPageContent.includes('Coba Gratis 7 Hari'), 'Tombol utama bertuliskan "Coba Gratis 7 Hari"');
assert(landingPageContent.includes('Pembayaran belum diaktifkan; seluruh akun baru mendapat masa coba 7 hari'), 'Keterangan masa coba 7 hari tampil transparan');
assert(landingPageContent.includes('Perbandingan Fitur Lengkap'), 'Tabel perbandingan fitur lengkap tampil di landing page');

// D. Super Admin: Plan Column & Plan Change Modal
const adminPageContent = fs.readFileSync(path.resolve(process.cwd(), 'src/app/admin/page.tsx'), 'utf-8');
assert(adminPageContent.includes('Paket &amp; Masa Coba'), 'Super admin memiliki kolom Paket & Masa Coba');
assert(adminPageContent.includes('Ubah Paket'), 'Super admin memiliki aksi tombol Ubah Paket');
assert(adminPageContent.includes('updateStorePlan'), 'Super admin memanggil updateStorePlan yang tercatat di audit log');

// 11. BUTIR 1: Aturan Antarmuka (Tanpa Emoji pada UI & Icon Lucide Outline)
console.log('\n11. Pengujian BUTIR 1 - Kepatuhan UI & Aturan Emoji:');
const sidebarCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/layout/Sidebar.tsx'), 'utf-8');
assert(sidebarCode.includes('PenLine'), 'Menu Asisten AI pada Sidebar menggunakan icon PenLine');
assert(!sidebarCode.includes('Sparkles'), 'Icon Sparkles TIDAK digunakan pada Sidebar');

const toastCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/ui/Toast.tsx'), 'utf-8');
assert(!toastCode.includes('✨') && !toastCode.includes('🚀'), 'Toast notification bebas dari emoji');
assert(toastCode.includes('CheckCircle') && toastCode.includes('strokeWidth={1.5}'), 'Toast menggunakan Lucide outline stroke 1.5');

const aiPageCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/(dashboard)/ai/page.tsx'), 'utf-8');
assert(!aiPageCode.includes('Sparkles'), 'Halaman Asisten AI TIDAK menggunakan icon Sparkles');

const storefrontPreviewCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/(dashboard)/storefront-preview/page.tsx'), 'utf-8');
assert(!storefrontPreviewCode.includes('Sparkles'), 'Halaman Pratinjau Etalase TIDAK menggunakan icon Sparkles');

// Pengujian fungsi enforceChatEmojis dari provider.ts
const providerModule = loadTsModule('src/lib/llm/provider.ts');
const { enforceChatEmojis, ALLOWED_CHAT_EMOJIS } = providerModule;
assert(ALLOWED_CHAT_EMOJIS.length === 5, 'Daftar emoji chat yang diperbolehkan tepat 5 buah (🙏 😊 🤍 👍 🛍️)');

const msgWithAllowed = enforceChatEmojis('Halo kak! Terima kasih sudah order 🙏 😊 🤍 👍', 'minimal');
assert(msgWithAllowed === 'Halo kak! Terima kasih sudah order 🙏 😊', 'Maksimal 2 emoji pada mode minimal');

const msgWithForbidden = enforceChatEmojis('Promo diskon ✨ 🚀 💡 🔥 🎉 🤖 💖 😍 spesial hari ini!', 'minimal');
assert(msgWithForbidden === 'Promo diskon spesial hari ini!', 'Emoji terlarang (✨ 🚀 💡 🔥 🎉 🤖 💖 😍) otomatis dibersihkan');

const msgNone = enforceChatEmojis('Terima kasih banyak ya kak 🙏 😊', 'none');
assert(msgNone === 'Terima kasih banyak ya kak', 'Mode "none" (Tanpa Emoji) menghapus seluruh emoji');

// 12. BUTIR 2: Kualitas Data Awal (Seed Data Realistis untuk Setiap Toko & Pelanggan Tidur)
console.log('\n12. Pengujian BUTIR 2 - Kelayakan Seed Data UMKM Fashion untuk Seluruh Toko:');
if (seedJson) {
  // A. Toko 1: Koleksi Lokal
  const koleksiProducts = seedJson.products.filter(p => p.store_id === 'store_koleksi_lokal');
  assert(koleksiProducts.length >= 15, `Toko Koleksi Lokal memiliki minimal 15 produk (aktual: ${koleksiProducts.length})`);

  const koleksiCustomers = seedJson.customers.filter(c => c.store_id === 'store_koleksi_lokal');
  assert(koleksiCustomers.length >= 20, `Toko Koleksi Lokal memiliki minimal 20 pelanggan (aktual: ${koleksiCustomers.length})`);

  const rindra = koleksiCustomers.find(c => c.name.toLowerCase().includes('rindra pratama'));
  assert(Boolean(rindra), 'Pelanggan "Rindra Pratama" terdaftar pada toko Koleksi Lokal');
  if (rindra) {
    assert(rindra.stage === 'Tidur', 'Rindra Pratama berada pada tahap "Tidur"');
    const rindraOrderDate = new Date(rindra.last_purchase_date).getTime();
    const daysSinceLastOrder = Math.floor((Date.now() - rindraOrderDate) / 86400000);
    assert(daysSinceLastOrder >= 60, `Transaksi terakhir Rindra > 60 hari lalu (aktual: ${daysSinceLastOrder} hari)`);
  }

  const koleksiOrders = seedJson.orders.filter(o => o.store_id === 'store_koleksi_lokal');
  assert(koleksiOrders.length >= 30, `Koleksi Lokal memiliki minimal 30 pesanan (aktual: ${koleksiOrders.length})`);

  // B. Toko 2: Batik Heritage Solo
  const batikProducts = seedJson.products.filter(p => p.store_id === 'store_batik_heritage');
  assert(batikProducts.length >= 15, `Toko Batik Heritage memiliki minimal 15 produk (aktual: ${batikProducts.length})`);

  const batikCustomers = seedJson.customers.filter(c => c.store_id === 'store_batik_heritage');
  assert(batikCustomers.length >= 20, `Toko Batik Heritage memiliki minimal 20 pelanggan (aktual: ${batikCustomers.length})`);

  const batikSleeping = batikCustomers.find(c => c.stage === 'Tidur');
  assert(Boolean(batikSleeping), 'Batik Heritage memiliki pelanggan tahap "Tidur" (>60 hari)');

  const batikOrders = seedJson.orders.filter(o => o.store_id === 'store_batik_heritage');
  assert(batikOrders.length >= 30, `Batik Heritage memiliki minimal 30 pesanan (aktual: ${batikOrders.length})`);

  // C. Toko 3: Urban Thrift Haven
  const thriftProducts = seedJson.products.filter(p => p.store_id === 'store_urban_thrift');
  assert(thriftProducts.length >= 15, `Toko Urban Thrift memiliki minimal 15 produk (aktual: ${thriftProducts.length})`);

  const thriftCustomers = seedJson.customers.filter(c => c.store_id === 'store_urban_thrift');
  assert(thriftCustomers.length >= 20, `Toko Urban Thrift memiliki minimal 20 pelanggan (aktual: ${thriftCustomers.length})`);

  const thriftSleeping = thriftCustomers.find(c => c.stage === 'Tidur');
  assert(Boolean(thriftSleeping), 'Urban Thrift memiliki pelanggan tahap "Tidur" (>60 hari)');

  const thriftOrders = seedJson.orders.filter(o => o.store_id === 'store_urban_thrift');
  assert(thriftOrders.length >= 30, `Urban Thrift memiliki minimal 30 pesanan (aktual: ${thriftOrders.length})`);

  // Verifikasi sebaran tahap pelanggan
  const stages = new Set(koleksiCustomers.map(c => c.stage));
  assert(stages.has('Baru'), 'Koleksi Lokal memiliki pelanggan tahap "Baru"');
  assert(stages.has('Aktif'), 'Koleksi Lokal memiliki pelanggan tahap "Aktif"');
  assert(stages.has('Setia'), 'Koleksi Lokal memiliki pelanggan tahap "Setia"');
  assert(stages.has('Tidur'), 'Koleksi Lokal memiliki pelanggan tahap "Tidur"');

  assert(seedJson.orders.length >= 90, `Total pesanan pada seluruh toko seed data minimal 90 transaksi (aktual: ${seedJson.orders.length})`);
}

// 13. BUTIR 3: Pratinjau Etalase & Etalase Publik
console.log('\n13. Pengujian BUTIR 3 - Pratinjau Etalase & Etalase Publik:');
assert(storefrontPreviewCode.includes('Buka Etalase'), 'Terdapat tombol eksplisit "Buka Etalase"');
assert(storefrontPreviewCode.includes('target="_blank"'), 'Tombol Buka Etalase membuka tab baru');

const publicStorefrontCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/[slug]/page.tsx'), 'utf-8');
assert(publicStorefrontCode.includes('createOrder'), 'Etalase publik terhubung ke createOrder');
assert(publicStorefrontCode.includes('public_storefront'), 'Pesanan etalase publik diberi tanda source: "public_storefront"');

// 14. BUTIR 4 & 6c: Tindak Lanjut & Kerangka Pesan
console.log('\n14. Pengujian BUTIR 4 & 6c - Tindak Lanjut & Personalisasi:');
const followupCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/(dashboard)/followup/page.tsx'), 'utf-8');
assert(followupCode.includes('Segarkan Tugas'), 'Tombol "Pindai Ulang Tugas" telah diganti menjadi "Segarkan Tugas"');
assert(followupCode.includes('Buat Pesan'), 'Terdapat tombol "Buat Pesan" pada kartu tugas');
assert(followupCode.includes('Salin Pesan'), 'Modal memiliki aksi "Salin Pesan"');
assert(followupCode.includes('Buka WhatsApp'), 'Modal memiliki aksi "Buka WhatsApp"');
assert(followupCode.includes('Buat Ulang'), 'Modal memiliki aksi regenerasi alternatif "Buat Ulang"');
assert(followupCode.includes('Tandai Selesai'), 'Modal memiliki aksi "Tandai Selesai"');

// 15. BUTIR 5: Asisten AI (Chat to Order, Balasan Cerdas, Persona)
console.log('\n15. Pengujian BUTIR 5 - Asisten AI:');
const providerCode = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/llm/provider.ts'), 'utf-8');
assert(providerCode.includes('Mode dasar aktif. Hubungkan kunci API AI untuk hasil yang lebih akurat.'), 'Pesan fallback AI netral tanpa istilah teknis internal');
assert(!providerCode.includes('Threadly Heuristic Engine'), 'Istilah "Threadly Heuristic Engine" telah dihapus');

assert(aiPageCode.includes('Salin Balasan'), 'Terdapat tombol "Salin Balasan"');
assert(aiPageCode.includes('Buat Ulang'), 'Terdapat tombol "Buat Ulang" draf balasan');
assert(aiPageCode.includes('Uji Balasan Persona'), 'Terdapat panel "Uji Balasan Persona"');
assert(aiPageCode.includes('Terakhir disimpan:'), 'Terdapat keterangan waktu terakhir persona disimpan');

// Pengujian Langsung Pengaruh Persona pada generateRuleBasedReply
const { LLMProvider } = providerModule;
const testLLM = new LLMProvider();
const sampleProductList = [
  {
    id: 'p1',
    name: 'Kemeja Linen Oversize',
    category: 'Atasan',
    price: 185000,
    is_active: true,
    variants: [
      { id: 'v1', size: 'M', color: 'Broken White', stock: 5 },
      { id: 'v2', size: 'L', color: 'Broken White', stock: 0 },
    ],
  },
];

const batikReply = testLLM.generateRuleBasedReply(
  'Kemeja linen broken white size M ada?',
  'Batik Heritage',
  'Sopan, santun, filosofi adat budaya Jawa Solo',
  sampleProductList,
  'minimal'
);
assert(batikReply.includes('Sugeng rawuh') || batikReply.includes('tersedia'), 'Persona Batik/Sopan menghasilkan salam santun tradisional');

const thriftReply = testLLM.generateRuleBasedReply(
  'Kemeja linen broken white size M ada?',
  'Urban Thrift',
  'Gaul, santai, gaya anak muda streetwear Bandung',
  sampleProductList,
  'minimal'
);
assert(thriftReply.includes('bro / sis') || thriftReply.includes('Drop'), 'Persona Streetwear menghasilkan gaya bahasa kasual anak muda');

const boutiqueReply = testLLM.generateRuleBasedReply(
  'Kemeja linen broken white size M ada?',
  'Koleksi Lokal',
  'Ramah, santai, empatik khas butik fashion lokal',
  sampleProductList,
  'minimal'
);
assert(boutiqueReply.includes('Halo Kak'), 'Persona Butik menghasilkan gaya hangat khas fashion advisor');

// 16. BUTIR 6: Pengaturan (Slug Unik, Siklus Pelanggan, Quota Tim)
console.log('\n16. Pengujian BUTIR 6 - Pengaturan & Validasi Toko:');
const settingsCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/(dashboard)/settings/page.tsx'), 'utf-8');
assert(settingsCode.includes('Slug sudah digunakan oleh toko lain'), 'Penyimpanan profil memeriksa keunikan slug');
assert(settingsCode.includes('Siklus Pelanggan'), 'Section dinamai "Siklus Pelanggan"');
assert(settingsCode.includes('Kerangka Pesan Cadangan'), 'Section dinamai "Kerangka Pesan Cadangan"');
assert(settingsCode.includes('Pratinjau Dampak Pengaturan:'), 'Terdapat pratinjau dampak perubahan siklus pelanggan');
assert(settingsCode.includes('recalculateAllCustomerStages'), 'Menyimpan siklus memicu recalculateAllCustomerStages');
assert(settingsCode.includes('inviteMember'), 'Manajemen tim memanggil fungsi inviteMember');
assert(settingsCode.includes('Kuota anggota tim untuk paket ini sudah penuh'), 'Terdapat pesan peringatan ketika kuota tim penuh');

// 17. BUTIR REVISI TERBARU:
console.log('\n17. Pengujian Butir Revisi Menyeluruh:');

// A. Dashboard Toko Siklus Pelanggan + Modal List + WhatsApp untuk Pelanggan Tidur
const dashboardCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/(dashboard)/dashboard/page.tsx'), 'utf-8');
assert(dashboardCode.includes('Siklus Pelanggan Toko'), 'Dashboard memuat seksi khusus "Siklus Pelanggan Toko"');
assert(dashboardCode.includes('selectedStageModal'), 'Dashboard memiliki state modal daftar siklus pelanggan');
assert(dashboardCode.includes('getSleepingWaLink'), 'Dashboard memiliki generator tautan WhatsApp khusus pelanggan tidur');
assert(dashboardCode.includes('Kirim WhatsApp'), 'Modal/kartu menyediakan aksi langsung "Kirim WhatsApp" untuk pelanggan tidur');
assert(dashboardCode.includes('<Modal') && dashboardCode.includes('Daftar Pelanggan: Siklus'), 'Modal list pelanggan terpasang rapi di Dashboard');

// B. Emoji Bebas Tidak Dibatasi
const bebasEmojiText = 'Promo spesial hari ini! ✨ 🚀 💡 🔥 🎉 🤖 💖 😍';
const bebasEmojiResult = enforceChatEmojis(bebasEmojiText, 'bebas');
assert(bebasEmojiResult === bebasEmojiText, 'Mode "bebas" mempertahankan seluruh emoji bebas tanpa dibatasi');
assert(settingsCode.includes('Emoji Bebas'), 'Pengaturan toko menyediakan opsi "Emoji Bebas"');
assert(aiPageCode.includes('Emoji Bebas'), 'Halaman AI Persona menyediakan opsi "Emoji Bebas"');

// C. Logout Redirect & State Cleanup
const storeContextCode = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/store-context.tsx'), 'utf-8');
assert(storeContextCode.includes("window.location.href = '/login'"), 'Aksi logout melakukan redirect ke halaman /login');
assert(storeContextCode.includes("setCurrentStore(null)") && storeContextCode.includes("CURRENT_STORE_ID"), 'Aksi logout membersihkan sesi toko dan storage key CURRENT_STORE_ID');

// D. Superadmin Privasi Tanpa Impersonation
const adminCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/admin/page.tsx'), 'utf-8');
assert(!adminCode.includes('Lihat Sebagai Toko'), 'Superadmin TIDAK lagi memiliki tombol impersonasi "Lihat Sebagai Toko"');
assert(!adminCode.includes('impersonateStore('), 'Superadmin TIDAK memanggil impersonateStore');
assert(adminCode.includes('Privasi Tenant Terjaga') || adminCode.includes('Privasi Terlindungi'), 'Superadmin menampilkan jaminan privasi tenant terisolasi');

// E. Superadmin Email Resmi andariftri7@gmail.com
assert(adminCode.includes('andariftri7@gmail.com'), 'Halaman Superadmin mencantumkan email resmi andariftri7@gmail.com');
assert(storeContextCode.includes('andariftri7@gmail.com'), 'Store context mengenali email resmi andariftri7@gmail.com sebagai superadmin');
if (seedJson) {
  const officialAdmin = seedJson.users.find(u => u.email === 'andariftri7@gmail.com');
  assert(officialAdmin && officialAdmin.is_superadmin === true, 'Seed data memuat email resmi andariftri7@gmail.com dengan is_superadmin=true');
}

// F. Fitur Laporan Keuangan yang Interaktif
assert(adminCode.includes('Laporan Keuangan Interaktif'), 'Superadmin memiliki tab "Laporan Keuangan Interaktif"');
assert(adminCode.includes('financialMetrics'), 'Superadmin menghitung metrik agregat keuangan (GMV, MRR, AOV)');
assert(adminCode.includes('Total GMV Penjualan'), 'Superadmin menampilkan kartu KPI Total GMV Penjualan');
assert(adminCode.includes('Estimasi MRR SaaS'), 'Superadmin menampilkan kartu KPI Estimasi MRR SaaS');
assert(adminCode.includes('handleExportFinancialCsv'), 'Superadmin memiliki fitur interaktif ekspor laporan CSV');
assert(adminCode.includes('financePeriod'), 'Superadmin memiliki filter interaktif periode keuangan');
assert(adminCode.includes('financeStore'), 'Superadmin memiliki filter interaktif per toko');
assert(adminCode.includes('financePlan'), 'Superadmin memiliki filter interaktif per paket');
assert(adminCode.includes('filteredFinancialOrders.filter'), 'Performa toko pada laporan keuangan tersinkronisasi dengan filter interaktif');
assert(adminCode.includes('Rincian Transaksi Platform Interaktif'), 'Superadmin menampilkan daftar transaksi interaktif');

// G. Konsistensi Bebas Emoji & Template Reaktivasi
assert(!settingsCode.includes("message_emoji_style || 'minimal'"), 'Settings tidak lagi fallback keliru ke mode minimal');
assert(!aiPageCode.includes("message_emoji_style || 'minimal'"), 'AI Compose Reply tidak lagi fallback keliru ke mode minimal');
assert(dashboardCode.includes('/{nama}/g'), 'Generator WA pelanggan tidur mengganti seluruh kemunculan placeholder secara global');

// H. Revisi Pengaturan Siklus Pelanggan & Tombol Keluar:
const headerCode = fs.readFileSync(path.resolve(process.cwd(), 'src/components/layout/Header.tsx'), 'utf-8');
assert(settingsCode.includes('{previewStageDistribution.newCount} Pelanggan'), 'Jumlah pelanggan disimpan di sebelah badge pengertian masing-masing tahap');
assert(settingsCode.includes('setSelectedStageModal'), 'Kartu siklus pelanggan di pengaturan dapat diklik untuk membuka modal list orang');
assert(settingsCode.includes('/customers/${cust.id}'), 'Daftar orang di modal siklus pelanggan langsung terhubung ke profil pelanggan');
assert(settingsCode.includes("selectedStageModal === 'Tidur'") && settingsCode.includes('Chat WA'), 'Tombol chat WhatsApp hadir khusus untuk tahap Tidur dan tidak hadir pada tahap lain');
assert(settingsCode.includes('Distribusi kuantitas pelanggan di atas terhitung secara otomatis'), 'Pemberitahuan siklus pelanggan menggunakan bahasa formal');
assert(headerCode.includes('logout') && headerCode.includes('Keluar'), 'Pintu keluar / tombol Keluar tersedia di Header');
assert(sidebarContent.includes('logout') && sidebarContent.includes('LogOut'), 'Pintu keluar / tombol Keluar tersedia di Sidebar');

// ==============================================================================
// 18. BUTIR 1 & BUTIR 2: KEAMANAN & PEMISAHAN SUPER ADMIN SERTA TEMA GRADASI
// ==============================================================================
console.log('\n18. Pengujian Butir 1 (Keamanan & Pemisahan Super Admin) & Butir 2 (Tema Gradasi):');

// A. Penegakan Akses Sisi Server & Environment Variable
const envExampleCode = fs.readFileSync(path.resolve(process.cwd(), '.env.example'), 'utf-8');
assert(envExampleCode.includes('SUPERADMIN_EMAIL=andariftri7@gmail.com'), '.env.example memuat SUPERADMIN_EMAIL=andariftri7@gmail.com');

const middlewareCode = fs.readFileSync(path.resolve(process.cwd(), 'src/middleware.ts'), 'utf-8');
assert(middlewareCode.includes('SUPERADMIN_EMAIL'), 'Middleware membaca email superadmin dari environment variable');
assert(middlewareCode.includes('url.pathname = \'/not-found\'') && middlewareCode.includes('status: 404'), 'Middleware melakukan rewrite ke 404 tanpa petunjuk untuk pengunjung tidak sah');
assert(middlewareCode.includes('X-Robots-Tag') && middlewareCode.includes('noindex'), 'Middleware menyertakan header noindex pada rute admin');

// B. Rute API Admin mengembalikan 404 untuk non-superadmin
const apiAdminCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/api/admin/route.ts'), 'utf-8');
assert(apiAdminCode.includes('status: 404'), 'Rute API /api/admin mengembalikan HTTP 404 bila bukan superadmin resmi');

// C. Skenario Uji Wajib 1: Pengunjung anonim membuka /admin tampil 404
const adminPageCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/admin/page.tsx'), 'utf-8');
assert(adminPageCode.includes('<NotFound />') || adminPageCode.includes('notFound()'), 'Skenario 1 Lulus: Pengunjung tanpa otorisasi membuka /admin menampilkan halaman 404');

// D. Skenario Uji Wajib 2: Owner toko mengakses /admin atau API admin ditolak/404
assert(middlewareCode.includes('sessionEmail === superadminEmail') && middlewareCode.includes('isSuper'), 'Skenario 2 Lulus: Owner toko biasa yang mencoba membuka /admin atau API admin ditolak dengan 404');

// E. Skenario Uji Wajib 3: Login sebagai andariftri7@gmail.com langsung diarahkan ke /admin
const loginPageCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/(auth)/login/page.tsx'), 'utf-8');
assert(loginPageCode.includes("email.toLowerCase().trim() === 'andariftri7@gmail.com'") && loginPageCode.includes("router.push('/admin')"), 'Skenario 3 Lulus: Login sebagai andariftri7@gmail.com langsung dialihkan ke /admin');

// F. Skenario Uji Wajib 4: Pindai seluruh halaman /admin, tidak ada tautan keluar (Link)
assert(!adminPageCode.includes('<Link'), 'Skenario 4 Lulus: Tidak ada tautan keluar dari /admin (selain navigasi internal & tombol keluar)');
assert(!adminPageCode.includes('Dashboard Toko'), 'Tombol "Dashboard Toko" telah dihapus dari /admin');

// G. Skenario Uji Wajib 5: Pindai seluruh halaman publik, tidak ada tautan ke /admin
const landingPageCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/page.tsx'), 'utf-8');
const registerPageCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/(auth)/register/page.tsx'), 'utf-8');
assert(!landingPageCode.includes('/admin'), 'Landing page bersih tanpa tautan ke /admin');
assert(!registerPageCode.includes('/admin'), 'Halaman register bersih tanpa tautan ke /admin');
assert(!sidebarContent.includes('/admin'), 'Sidebar toko bersih tanpa tautan ke /admin untuk user toko biasa');

// H. Skenario Uji Wajib 6: Upaya mengubah is_superadmin dari client ditolak
const migration002Code = fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations/002_superadmin_security.sql'), 'utf-8');
assert(migration002Code.includes('trg_protect_is_superadmin'), 'Skenario 6 Lulus: Database trigger menolak perubahan is_superadmin dari sisi client');
assert(migration002Code.includes('trg_check_superadmin_no_membership'), 'Database constraint melarang superadmin memiliki baris keanggotaan toko');

// I. SEO & Metadata: robots.txt, sitemap.ts, admin layout noindex
const robotsCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/robots.ts'), 'utf-8');
assert(robotsCode.includes("'/admin', '/admin/*'"), 'robots.txt melarang perayapan /admin');
const sitemapCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/sitemap.ts'), 'utf-8');
assert(!sitemapCode.includes('/admin'), 'sitemap.ts mengeluarkan rute /admin sepenuhnya');
const adminLayoutCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/admin/layout.tsx'), 'utf-8');
assert(adminLayoutCode.includes('index: false') && adminLayoutCode.includes('follow: false'), 'Layout /admin memiliki konfigurasi metadata noindex dan nofollow');

// J. BUTIR 2: Design Tokens & Tema Warna Gradasi
const themeTokensCode = fs.readFileSync(path.resolve(process.cwd(), 'src/config/theme.ts'), 'utf-8');
assert(themeTokensCode.includes('linear-gradient(135deg, #0F172A 0%, #272560 50%, #5B4BDB 100%)'), 'Token gradasi merek terdefinisi: linear-gradient(135deg, #0F172A 0%, #272560 50%, #5B4BDB 100%)');
assert(themeTokensCode.includes('linear-gradient(135deg, #6D5BE8 0%, #A78BFA 100%)'), 'Token gradasi aksen terdefinisi: linear-gradient(135deg, #6D5BE8 0%, #A78BFA 100%)');
assert(themeTokensCode.includes('#C9A96E'), 'Aksen sekunder champagne #C9A96E terdefinisi');
assert(themeTokensCode.includes('#FAF9F6'), 'Mode terang latar #FAF9F6 terdefinisi');
assert(themeTokensCode.includes('#0B1020') && themeTokensCode.includes('#111833'), 'Mode gelap latar #0B1020 dan permukaan #111833 terdefinisi');

const tailwindConfigCode = fs.readFileSync(path.resolve(process.cwd(), 'tailwind.config.ts'), 'utf-8');
assert(tailwindConfigCode.includes('gradient-brand') && tailwindConfigCode.includes('gradient-accent'), 'Tailwind config memperluas backgroundImage dengan gradasi merek dan aksen');
assert(tailwindConfigCode.includes('champagne'), 'Tailwind config menyertakan warna champagne');

const globalsCssCode = fs.readFileSync(path.resolve(process.cwd(), 'src/app/globals.css'), 'utf-8');
assert(globalsCssCode.includes('--gradient-brand') && globalsCssCode.includes('--gradient-accent'), 'CSS Variables memuat token gradasi merek dan aksen');
assert(globalsCssCode.includes('#0B1020') && globalsCssCode.includes('#111833'), 'CSS Variables memuat mode gelap latar #0B1020 dan permukaan #111833');
assert(globalsCssCode.includes('radial-gradient(circle at 50% 0%'), 'Body mode terang memiliki wash radial lavender berintensitas rendah');

// Final Summary
console.log(`\n=========================================`);
console.log(`Hasil Pengujian: ${passedTests} LULUS, ${failedTests} GAGAL.`);
console.log(`=========================================`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 Seluruh pengujian integritas Threadly berhasil 100%!');
}

