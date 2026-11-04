// ==============================================================================
// THREADLY - Plans & Pricing Configuration (plans.config.ts)
// ==============================================================================
// Berkas konfigurasi terpusat untuk batasan fitur dan harga paket langganan.
// Pembatasan teknis dapat diberlakukan kemudian dengan mengacu pada nilai di sini.

export type PlanType = 'standar' | 'pro';

export interface PlanFeatureLimits {
  id: PlanType;
  name: string;
  tagline: string;
  priceMonthly: number;
  formattedPrice: string;
  maxStores: number;
  maxUsers: number;
  maxCustomers: number | null; // null = unlimited
  maxProducts: number | null; // null = unlimited
  aiUsagePerMonth: number;
  hasCustomAiPersona: boolean;
  hasAdvancedDashboard: boolean;
  hasBirthdayRetention: boolean;
  hasRestockRetention: boolean;
  hasCustomTemplates: boolean;
  hasCsvImport: boolean;
  hasCsvExport: boolean;
  hasPrioritySupport: boolean;
  trialDays: number;
  featuresList: string[];
}

export const PLANS_CONFIG: Record<PlanType, PlanFeatureLimits> = {
  standar: {
    id: 'standar',
    name: 'Paket Standar',
    tagline: 'Solusi esensial untuk butik & toko fashion yang mulai merapikan CRM.',
    priceMonthly: 20000,
    formattedPrice: 'Rp20.000',
    maxStores: 1,
    maxUsers: 2, // 1 Owner dan 1 Staff
    maxCustomers: 300,
    maxProducts: 100,
    aiUsagePerMonth: 30,
    hasCustomAiPersona: false,
    hasAdvancedDashboard: false,
    hasBirthdayRetention: false,
    hasRestockRetention: false,
    hasCustomTemplates: false,
    hasCsvImport: false,
    hasCsvExport: true,
    hasPrioritySupport: false,
    trialDays: 7,
    featuresList: [
      '1 Toko Fashion Aktif',
      '2 Pengguna (1 Owner & 1 Staff)',
      'Hingga 300 Pelanggan CRM',
      'Hingga 100 Produk Busana',
      'Pesanan, Stok Varian & Invoice PDF',
      'Etalase Publik & Form Pesan Cepat',
      'Tindak Lanjut Dasar (Pelanggan Tidur & Unpaid)',
      'Ekspor Data CSV',
      'Asisten AI: 30 Pemakaian / Bulan',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Paket Pro',
    tagline: 'Solusi retensi komprehensif tanpa batas untuk brand fashion lokal bertumbuh.',
    priceMonthly: 45000,
    formattedPrice: 'Rp45.000',
    maxStores: 1,
    maxUsers: 5,
    maxCustomers: null, // Unlimited
    maxProducts: null, // Unlimited
    aiUsagePerMonth: 300,
    hasCustomAiPersona: true,
    hasAdvancedDashboard: true,
    hasBirthdayRetention: true,
    hasRestockRetention: true,
    hasCustomTemplates: true,
    hasCsvImport: true,
    hasCsvExport: true,
    hasPrioritySupport: true,
    trialDays: 7,
    featuresList: [
      '1 Toko Fashion Aktif',
      'Hingga 5 Pengguna Tim',
      'Pelanggan CRM Tanpa Batas',
      'Produk & Stok Varian Tanpa Batas',
      'Semua Fitur Paket Standar',
      'Tindak Lanjut Lengkap (Ulang Tahun & Restock)',
      'Template Pesan WhatsApp Kustom',
      'Impor & Ekspor Data CSV Lengkap',
      'Dashboard Analitik Lanjutan & Top Produk',
      'Asisten AI: 300 Pemakaian / Bulan',
      'Persona & Gaya Bahasa AI Kustom',
      'Dukungan Teknis Prioritas',
    ],
  },
};
