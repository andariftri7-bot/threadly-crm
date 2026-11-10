'use client';

import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useStore } from '@/lib/store-context';
import { PLANS_CONFIG } from '@/config/plans.config';
import {
  formatDateWIB,
  formatShortDate,
  formatRupiah,
  buildWhatsAppLink,
  normalizeWhatsAppNumber,
} from '@/lib/utils';
import { Button, Input, Badge, Modal, useToast } from '@/components/ui';
import {
  ShieldCheck,
  Building2,
  Sparkles,
  Search,
  Power,
  TrendingUp,
  Download,
  LogOut,
  CheckCircle2,
  Shield,
  Cpu,
  MessageCircle,
  Mail,
  FileSpreadsheet,
  SlidersHorizontal,
  Phone,
  PieChart as PieChartIcon,
  BarChart3,
  Database,
} from 'lucide-react';
import NotFound from '@/app/not-found';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useTheme } from '@/components/theme/ThemeProvider';

const PAYMENT_ALLOCATION_STORAGE_KEY = 'threadly_platform_payment_allocations';

const PAYMENT_METHOD_CATEGORIES = [
  'Virtual Account',
  'E-Wallet (QRIS/GoPay/OVO/ShopeePay)',
  'Auto-Debit',
  'Transfer Bank',
] as const;

const PAYMENT_BAR_COLORS = ['#6D5BE8', '#22C55E', '#C9A96E', '#38BDF8'];

interface PaymentAllocation {
  method: string;
  amount: number;
  count: number;
}

interface SubscriptionTransaction {
  id: string;
  invoiceNumber: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  plan: 'standar' | 'pro';
  amount: number;
  billingPeriod: string;
  paymentMethod: string;
  paymentDate: string;
  status: 'Lunas' | 'Pending';
}

export default function SuperAdminPage() {
  const {
    currentUser,
    isSuperadmin,
    logout,
    allStores,
    storeMembers,
    toggleStoreStatus,
    updateStorePlan,
    aiRuns,
    getPlatformStats,
    getAllPlatformOrders,
  } = useStore();
  const { showToast } = useToast();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'ai_logs'>('overview');
  const [searchStore, setSearchStore] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // AI Quota search & status filter
  const [aiSearch, setAiSearch] = useState('');
  const [aiStatusFilter, setAiStatusFilter] = useState<'all' | 'Aman' | 'Hampir Habis' | 'Token Habis'>('all');

  // Interactive Financial Report Filters & State
  const [financePeriod, setFinancePeriod] = useState<'all' | 'this_month' | 'last_30d' | 'this_year'>('all');
  const [financeStore, setFinanceStore] = useState<string>('all');
  const [financePlan, setFinancePlan] = useState<'all' | 'standar' | 'pro'>('all');
  const [financeSearch, setFinanceSearch] = useState<string>('');

  // Status Toggle Modal State
  const [toggleTarget, setToggleTarget] = useState<{ id: string; name: string; currentStatus: 'active' | 'inactive' } | null>(null);
  const [toggleReason, setToggleReason] = useState('');

  // Plan Change Modal State
  const [planTarget, setPlanTarget] = useState<{ id: string; name: string; currentPlan: 'standar' | 'pro' } | null>(null);
  const [newPlan, setNewPlan] = useState<'standar' | 'pro'>('standar');
  const [planReason, setPlanReason] = useState('');

  // Editable Manual Payment Method Allocations (persisted to Supabase / platform metadata)
  const [manualAllocations, setManualAllocations] = useState<PaymentAllocation[] | null>(null);
  const [allocationsSyncSource, setAllocationsSyncSource] = useState<'supabase' | 'local' | 'computed'>('computed');
  const [allocationsUpdatedAt, setAllocationsUpdatedAt] = useState<string | null>(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [draftAllocations, setDraftAllocations] = useState<PaymentAllocation[]>([]);
  const [isSavingAllocations, setIsSavingAllocations] = useState(false);

  // Access Protection Check flag (evaluated after all hooks)
  const superadminEmail = (process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || process.env.SUPERADMIN_EMAIL || 'andariftri7@gmail.com').toLowerCase().trim();
  const isAuthorizedSuperadmin =
    isSuperadmin &&
    currentUser &&
    currentUser.email?.toLowerCase().trim() === superadminEmail;

  // Platform aggregates across all stores
  const platformStats = useMemo(() => getPlatformStats(), [getPlatformStats, allStores, aiRuns]);
  const totalStores = platformStats.totalStores;
  const activeStores = platformStats.activeStores;
  const totalAiRunsCount = platformStats.totalAiRuns;
  const totalPlatformAiTokens = useMemo(
    () => aiRuns.reduce((sum, r) => sum + Number(r.total_tokens || 0), 0),
    [aiRuns]
  );

  const filteredStores = useMemo(() => {
    return allStores.filter(s => {
      const q = searchStore.toLowerCase();
      const match = s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q);
      if (!match) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      return true;
    });
  }, [allStores, searchStore, statusFilter]);

  // All platform orders (strictly isolated, never displayed raw to superadmin)
  const allPlatformOrders = useMemo(() => {
    return getAllPlatformOrders();
  }, [getAllPlatformOrders, allStores]);

  // Interactive Filtered Financial Orders (isolated internal tenant metrics)
  const filteredFinancialOrders = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return allPlatformOrders.filter(order => {
      if (financeStore !== 'all' && order.store_id !== financeStore) {
        return false;
      }

      if (financePlan !== 'all') {
        const store = allStores.find(s => s.id === order.store_id);
        if (store?.plan !== financePlan) return false;
      }

      if (financePeriod !== 'all') {
        const orderDate = new Date(order.created_at);
        if (financePeriod === 'this_month') {
          if (orderDate.getFullYear() !== currentYear || orderDate.getMonth() !== currentMonth) {
            return false;
          }
        } else if (financePeriod === 'last_30d') {
          const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) return false;
        } else if (financePeriod === 'this_year') {
          if (orderDate.getFullYear() !== currentYear) return false;
        }
      }

      if (financeSearch.trim()) {
        const q = financeSearch.toLowerCase().trim();
        const matchesNumber = order.order_number.toLowerCase().includes(q);
        const matchesCustomer = order.customer_name.toLowerCase().includes(q);
        const store = allStores.find(s => s.id === order.store_id);
        const matchesStore = store?.name.toLowerCase().includes(q);
        if (!matchesNumber && !matchesCustomer && !matchesStore) return false;
      }

      return true;
    });
  }, [allPlatformOrders, financeStore, financePlan, financePeriod, financeSearch, allStores]);

  // Generate SaaS Subscription Billing Records from store creation month up to current month
  const allSubscriptionTransactions = useMemo(() => {
    const list: SubscriptionTransaction[] = [];
    const now = new Date();
    const endYear = now.getFullYear();
    const endMonth = now.getMonth();

    allStores.forEach((store, idx) => {
      const plan = (store.plan === 'pro' ? 'pro' : 'standar') as 'standar' | 'pro';
      const amount = plan === 'pro' ? PLANS_CONFIG.pro.priceMonthly : PLANS_CONFIG.standar.priceMonthly;
      const startDate = store.created_at ? new Date(store.created_at) : new Date(endYear, endMonth - 1, 10);

      let iterYear = startDate.getFullYear();
      let iterMonth = startDate.getMonth();
      const dayOfMonth = Math.min(28, Math.max(1, startDate.getDate()));
      let cycles = 0;

      while ((iterYear < endYear || (iterYear === endYear && iterMonth <= endMonth)) && cycles < 12) {
        const cycleDate = new Date(iterYear, iterMonth, dayOfMonth, 10, 30, 0);
        const isCurrentCycle = iterYear === endYear && iterMonth === endMonth;
        const methodIdx = (idx + cycles) % PAYMENT_METHOD_CATEGORIES.length;
        const slugCode = store.slug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'THRD';

        list.push({
          id: `sub-${store.id}-${iterYear}-${iterMonth + 1}`,
          invoiceNumber: `INV-SAAS-${slugCode}-${iterYear}${String(iterMonth + 1).padStart(2, '0')}`,
          storeId: store.id,
          storeName: store.name,
          storeSlug: store.slug,
          plan,
          amount,
          billingPeriod: cycleDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
          paymentMethod: PAYMENT_METHOD_CATEGORIES[methodIdx],
          paymentDate: cycleDate.toISOString(),
          status: isCurrentCycle && store.status !== 'active' ? 'Pending' : 'Lunas',
        });

        iterMonth += 1;
        if (iterMonth > 11) {
          iterMonth = 0;
          iterYear += 1;
        }
        cycles += 1;
      }
    });

    return list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [allStores]);

  // Interactive Filtered Subscription Invoices (SaaS Platform Revenue)
  const filteredSubscriptionTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return allSubscriptionTransactions.filter(tx => {
      if (financeStore !== 'all' && tx.storeId !== financeStore) {
        return false;
      }

      if (financePlan !== 'all' && tx.plan !== financePlan) {
        return false;
      }

      if (financePeriod !== 'all') {
        const txDate = new Date(tx.paymentDate);
        if (financePeriod === 'this_month') {
          if (txDate.getFullYear() !== currentYear || txDate.getMonth() !== currentMonth) {
            return false;
          }
        } else if (financePeriod === 'last_30d') {
          const diffDays = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) return false;
        } else if (financePeriod === 'this_year') {
          if (txDate.getFullYear() !== currentYear) return false;
        }
      }

      if (financeSearch.trim()) {
        const q = financeSearch.toLowerCase().trim();
        const matchesNumber = tx.invoiceNumber.toLowerCase().includes(q);
        const matchesStore = tx.storeName.toLowerCase().includes(q) || tx.storeSlug.toLowerCase().includes(q);
        const matchesPeriod = tx.billingPeriod.toLowerCase().includes(q);
        const matchesMethod = tx.paymentMethod.toLowerCase().includes(q);
        if (!matchesNumber && !matchesStore && !matchesPeriod && !matchesMethod) return false;
      }

      return true;
    });
  }, [allSubscriptionTransactions, financeStore, financePlan, financePeriod, financeSearch]);

  // Platform Financial Metrics (SaaS Subscription Revenue & Isolation of Tenant Merchandise GMV)
  const financialMetrics = useMemo(() => {
    const paidSubs = filteredSubscriptionTransactions.filter(t => t.status === 'Lunas');
    const standarSubs = paidSubs.filter(t => t.plan === 'standar');
    const proSubs = paidSubs.filter(t => t.plan === 'pro');

    const standarRevenue = standarSubs.reduce((sum, t) => sum + t.amount, 0);
    const proRevenue = proSubs.reduce((sum, t) => sum + t.amount, 0);
    const totalPlatformRevenue = standarRevenue + proRevenue;

    const activeSubscribedStores = allStores.filter(s => {
      if (s.status !== 'active') return false;
      if (financeStore !== 'all' && s.id !== financeStore) return false;
      if (financePlan !== 'all' && s.plan !== financePlan) return false;
      return true;
    });
    const standarStoresCount = activeSubscribedStores.filter(s => (s.plan || 'standar') === 'standar').length;
    const proStoresCount = activeSubscribedStores.filter(s => s.plan === 'pro').length;

    const mrrTotal = activeSubscribedStores.reduce((sum, s) => {
      return sum + (s.plan === 'pro' ? PLANS_CONFIG.pro.priceMonthly : PLANS_CONFIG.standar.priceMonthly);
    }, 0);

    // Isolated Internal Tenant Merchandise Data (diisolasi penuh, dirahasiakan dari tampilan Superadmin)
    const validOrders = filteredFinancialOrders.filter(o => o.status !== 'Batal');
    const totalGmv = validOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const paidOrders = validOrders.filter(o => o.status === 'Lunas' || o.status === 'Selesai');
    const totalPaidAmount = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const paidCount = paidOrders.length;
    const aov = paidCount > 0 ? Math.round(totalPaidAmount / paidCount) : 0;

    return {
      standarRevenue,
      proRevenue,
      totalPlatformRevenue,
      standarCount: standarSubs.length,
      proCount: proSubs.length,
      standarStoresCount,
      proStoresCount,
      activeStoresCount: activeSubscribedStores.length,
      mrrTotal,
      totalGmv,
      aov,
      paidCount,
      totalOrdersCount: filteredFinancialOrders.length,
    };
  }, [filteredSubscriptionTransactions, allStores, financeStore, financePlan, filteredFinancialOrders]);

  // BAGIAN 3A: Area Chart Data - Cumulative Platform Revenue Growth Trend
  const cumulativeRevenueSeries = useMemo(() => {
    const monthlyMap = new Map<string, { sortKey: string; label: string; bulanan: number }>();

    for (const tx of filteredSubscriptionTransactions) {
      if (tx.status !== 'Lunas') continue;
      const d = new Date(tx.paymentDate);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
      const prev = monthlyMap.get(sortKey);
      if (prev) {
        prev.bulanan += tx.amount;
      } else {
        monthlyMap.set(sortKey, { sortKey, label, bulanan: tx.amount });
      }
    }

    const sorted = Array.from(monthlyMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    let runningTotal = 0;
    return sorted.map(item => {
      runningTotal += item.bulanan;
      return {
        label: item.label,
        bulanan: item.bulanan,
        akumulasi: runningTotal,
      };
    });
  }, [filteredSubscriptionTransactions]);

  // BAGIAN 3B: Donut Chart Data - Standar vs Pro Revenue Share
  const planRevenueShareData = useMemo(() => {
    return [
      {
        name: 'Paket Standar',
        value: financialMetrics.standarRevenue,
        count: financialMetrics.standarCount,
        color: '#22C55E',
      },
      {
        name: 'Paket Pro',
        value: financialMetrics.proRevenue,
        count: financialMetrics.proCount,
        color: '#6D5BE8',
      },
    ];
  }, [financialMetrics]);

  // Store-by-Store SaaS Performance Breakdown (Interactive with Filters)
  const storeFinancialPerformance = useMemo(() => {
    return allStores
      .filter(store => {
        if (financeStore !== 'all' && store.id !== financeStore) return false;
        if (financePlan !== 'all' && store.plan !== financePlan) return false;
        if (financeSearch.trim()) {
          const q = financeSearch.toLowerCase().trim();
          const matchStore = store.name.toLowerCase().includes(q) || store.slug.toLowerCase().includes(q);
          if (!matchStore) return false;
        }
        return true;
      })
      .map(store => {
        const isolatedStoreOrders = filteredFinancialOrders.filter(o => o.store_id === store.id);
        const plan = (store.plan || 'standar') as 'standar' | 'pro';
        const saasFee = plan === 'pro' ? PLANS_CONFIG.pro.priceMonthly : PLANS_CONFIG.standar.priceMonthly;
        const storePaidSubs = filteredSubscriptionTransactions.filter(t => t.storeId === store.id && t.status === 'Lunas');
        const storeSaasTotal = storePaidSubs.reduce((sum, t) => sum + t.amount, 0) || saasFee;

        return {
          storeId: store.id,
          storeName: store.name,
          slug: store.slug,
          plan,
          status: store.status,
          trialEndsAt: store.trial_ends_at,
          saasFee,
          storeSaasTotal,
          orderCount: isolatedStoreOrders.length,
        };
      });
  }, [allStores, filteredFinancialOrders, filteredSubscriptionTransactions, financeStore, financePlan, financeSearch]);

  // Default computed breakdown from filtered SaaS transactions across the 4 payment methods
  const computedPaymentAllocations = useMemo<PaymentAllocation[]>(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    for (const m of PAYMENT_METHOD_CATEGORIES) {
      map[m] = { amount: 0, count: 0 };
    }
    for (const tx of filteredSubscriptionTransactions) {
      if (tx.status !== 'Lunas') continue;
      const method = PAYMENT_METHOD_CATEGORIES.includes(tx.paymentMethod as typeof PAYMENT_METHOD_CATEGORIES[number])
        ? tx.paymentMethod
        : 'Transfer Bank';
      map[method].count += 1;
      map[method].amount += Number(tx.amount || 0);
    }
    return PAYMENT_METHOD_CATEGORIES.map(method => ({
      method,
      amount: map[method].amount,
      count: map[method].count,
    }));
  }, [filteredSubscriptionTransactions]);

  // Load saved payment allocations from localStorage and Supabase API
  useEffect(() => {
    if (!isAuthorizedSuperadmin) return;

    try {
      const cached = localStorage.getItem(PAYMENT_ALLOCATION_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setManualAllocations(parsed);
          setAllocationsSyncSource('local');
        }
      }
    } catch {
      // ignore local storage parse error
    }

    fetch('/api/admin/payment-allocations')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data && Array.isArray(data.allocations) && data.allocations.length > 0) {
          setManualAllocations(data.allocations);
          setAllocationsSyncSource(data.source === 'supabase' ? 'supabase' : 'local');
          if (data.updatedAt) setAllocationsUpdatedAt(data.updatedAt);
          try {
            localStorage.setItem(PAYMENT_ALLOCATION_STORAGE_KEY, JSON.stringify(data.allocations));
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {});
  }, [isAuthorizedSuperadmin]);

  // Effective payment method distribution (saved manual data or computed fallback) with dynamic percentages
  const paymentMethodChartData = useMemo(() => {
    const activeList = manualAllocations && manualAllocations.length > 0 ? manualAllocations : computedPaymentAllocations;
    const totalAmount = activeList.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return activeList.map((item, idx) => {
      const pct = totalAmount > 0 ? Number(((item.amount / totalAmount) * 100).toFixed(1)) : 0;
      const shortLabel =
        item.method.startsWith('E-Wallet') ? 'E-Wallet' : item.method;
      return {
        ...item,
        shortLabel,
        pct,
        color: PAYMENT_BAR_COLORS[idx % PAYMENT_BAR_COLORS.length],
        totalAmount,
      };
    });
  }, [manualAllocations, computedPaymentAllocations]);

  // BAGIAN 2: Store AI Token Quota Monitoring Data
  const storeAiQuotaRows = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const appOrigin =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'https://threadly.id');

    return allStores.map(store => {
      const plan = (store.plan === 'pro' ? 'pro' : 'standar') as 'standar' | 'pro';
      const planCfg = PLANS_CONFIG[plan];
      const monthlyTokenLimit = planCfg.aiTokenLimitPerMonth;

      const ownerMember =
        storeMembers.find(m => m.store_id === store.id && m.role === 'owner') ||
        storeMembers.find(m => m.store_id === store.id);
      const ownerEmail =
        ownerMember?.user_email ||
        ownerMember?.invited_email ||
        `owner.${store.slug}@threadly.id`;

      const storeMonthRuns = aiRuns.filter(run => {
        if (run.store_id !== store.id) return false;
        const d = new Date(run.created_at);
        return d.getFullYear() === curYear && d.getMonth() === curMonth;
      });

      const usedTokens = storeMonthRuns.reduce((sum, r) => sum + Number(r.total_tokens || 0), 0);
      const rawPct = monthlyTokenLimit > 0 ? Math.round((usedTokens / monthlyTokenLimit) * 100) : 0;
      const progressPct = Math.min(100, rawPct);

      let quotaStatus: 'Aman' | 'Hampir Habis' | 'Token Habis' = 'Aman';
      if (usedTokens >= monthlyTokenLimit || rawPct >= 100) {
        quotaStatus = 'Token Habis';
      } else if (rawPct >= 80) {
        quotaStatus = 'Hampir Habis';
      }

      const paymentLink = `${appOrigin}/settings?tab=billing&upgrade=${plan === 'standar' ? 'pro' : 'renew'}&toko=${encodeURIComponent(store.slug)}`;
      const notifyText = `Halo ${store.name}, kuota AI asisten Threadly CRM kamu untuk periode ini telah habis / mencapai batas. Yuk segera perbarui atau upgrade paket langgananmu agar layanan balasan otomatis tetap berjalan lancar! ${paymentLink}`;

      const cleanPhone = normalizeWhatsAppNumber(store.phone_wa || '');
      const waHref = buildWhatsAppLink(store.phone_wa || '', notifyText);
      const mailtoHref = `mailto:${encodeURIComponent(ownerEmail)}?subject=${encodeURIComponent(
        'Pemberitahuan Kuota AI Threadly CRM'
      )}&body=${encodeURIComponent(notifyText)}`;

      return {
        storeId: store.id,
        storeName: store.name,
        storeSlug: store.slug,
        phoneWa: store.phone_wa || '-',
        normalizedWa: cleanPhone,
        ownerEmail,
        plan,
        planLabel: plan === 'pro' ? 'Pro' : 'Standar',
        monthlyTokenLimit,
        usedTokens,
        runsCount: storeMonthRuns.length,
        rawPct,
        progressPct,
        quotaStatus,
        waHref,
        mailtoHref,
        notifyText,
      };
    });
  }, [allStores, storeMembers, aiRuns]);

  const filteredAiQuotaRows = useMemo(() => {
    return storeAiQuotaRows.filter(row => {
      if (aiStatusFilter !== 'all' && row.quotaStatus !== aiStatusFilter) return false;
      if (aiSearch.trim()) {
        const q = aiSearch.toLowerCase().trim();
        const matches =
          row.storeName.toLowerCase().includes(q) ||
          row.ownerEmail.toLowerCase().includes(q) ||
          row.phoneWa.toLowerCase().includes(q) ||
          row.storeSlug.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [storeAiQuotaRows, aiStatusFilter, aiSearch]);

  const aiQuotaSummary = useMemo(() => {
    return {
      aman: storeAiQuotaRows.filter(r => r.quotaStatus === 'Aman').length,
      hampirHabis: storeAiQuotaRows.filter(r => r.quotaStatus === 'Hampir Habis').length,
      tokenHabis: storeAiQuotaRows.filter(r => r.quotaStatus === 'Token Habis').length,
    };
  }, [storeAiQuotaRows]);

  // CSV Export Function (SaaS Platform Subscription Transactions)
  const handleExportFinancialCsv = () => {
    const headers = [
      'No. Tagihan SaaS',
      'ID Toko',
      'Nama Toko',
      'Paket Langganan',
      'Nominal Pembayaran (Rp)',
      'Periode Billing',
      'Metode Bayar',
      'Tanggal Transaksi',
      'Status Pembayaran',
    ];
    const rows = filteredSubscriptionTransactions.map(tx => [
      `"${tx.invoiceNumber}"`,
      `"${tx.storeId}"`,
      `"${tx.storeName.replace(/"/g, '""')}"`,
      `"${tx.plan.toUpperCase()}"`,
      tx.amount,
      `"${tx.billingPeriod}"`,
      `"${tx.paymentMethod}"`,
      `"${formatDateWIB(tx.paymentDate)}"`,
      `"${tx.status.toUpperCase()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-pendapatan-saas-threadly-${financePeriod}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // BAGIAN 5: SheetJS Excel (.xlsx) Export Function
  const handleExportExcel = () => {
    const headers = [
      'No Tagihan',
      'Nama Toko',
      'Paket',
      'Periode',
      'Metode Bayar',
      'Nominal',
      'Tanggal',
      'Status',
    ];

    const rows = filteredSubscriptionTransactions.map(tx => [
      tx.invoiceNumber,
      tx.storeName,
      tx.plan === 'pro' ? 'Paket Pro' : 'Paket Standar',
      tx.billingPeriod,
      tx.paymentMethod,
      tx.amount,
      formatDateWIB(tx.paymentDate),
      tx.status,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [
      { wch: 24 },
      { wch: 26 },
      { wch: 16 },
      { wch: 18 },
      { wch: 32 },
      { wch: 15 },
      { wch: 24 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi Platform');

    const wibDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
    const fileName = `Laporan_Transaksi_Threadly_${wibDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    showToast(
      `File ${fileName} berhasil diunduh (${filteredSubscriptionTransactions.length} transaksi).`,
      'success'
    );
  };

  // BAGIAN 4: Open & Save Payment Allocation Modal
  const handleOpenAllocationModal = () => {
    const currentData =
      manualAllocations && manualAllocations.length > 0
        ? manualAllocations
        : computedPaymentAllocations;

    setDraftAllocations(
      PAYMENT_METHOD_CATEGORIES.map(method => {
        const found = currentData.find(item => item.method === method);
        return {
          method,
          amount: found ? Number(found.amount || 0) : 0,
          count: found ? Number(found.count || 0) : 0,
        };
      })
    );
    setIsAllocationModalOpen(true);
  };

  const handleSaveAllocations = async () => {
    setIsSavingAllocations(true);
    const normalized = draftAllocations.map(item => ({
      method: item.method,
      amount: Math.max(0, Math.round(Number(item.amount) || 0)),
      count: Math.max(0, Math.round(Number(item.count) || 0)),
    }));

    try {
      localStorage.setItem(PAYMENT_ALLOCATION_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // ignore
    }
    setManualAllocations(normalized);

    try {
      const res = await fetch('/api/admin/payment-allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations: normalized }),
      });

      if (res.ok) {
        const payload = await res.json();
        setAllocationsSyncSource(payload.persistedToSupabase ? 'supabase' : 'local');
        setAllocationsUpdatedAt(payload.updatedAt || new Date().toISOString());
        showToast(
          payload.persistedToSupabase
            ? 'Alokasi pembayaran disimpan ke database Supabase.'
            : 'Alokasi pembayaran disimpan ke metadata platform.',
          'success'
        );
      } else {
        setAllocationsSyncSource('local');
        setAllocationsUpdatedAt(new Date().toISOString());
        showToast('Alokasi pembayaran disimpan ke metadata lokal platform.', 'success');
      }
    } catch {
      setAllocationsSyncSource('local');
      setAllocationsUpdatedAt(new Date().toISOString());
      showToast('Alokasi pembayaran disimpan ke metadata lokal platform.', 'success');
    } finally {
      setIsSavingAllocations(false);
      setIsAllocationModalOpen(false);
    }
  };

  // Early 404 return for unauthorized visitors (placed after all hooks)
  if (!isAuthorizedSuperadmin) {
    return <NotFound />;
  }

  const handleConfirmToggle = async () => {
    if (!toggleTarget || !toggleReason.trim()) {
      showToast('Alasan pengubahan status toko wajib diisi.', 'warning');
      return;
    }
    const newStatus = toggleTarget.currentStatus === 'active' ? 'inactive' : 'active';
    await toggleStoreStatus(toggleTarget.id, newStatus, toggleReason);
    showToast(`Status toko ${toggleTarget.name} diperbarui menjadi ${newStatus}.`, 'success');
    setToggleTarget(null);
    setToggleReason('');
  };

  const handleConfirmPlanChange = async () => {
    if (!planTarget || !planReason.trim()) {
      showToast('Alasan pengubahan paket langganan wajib diisi.', 'warning');
      return;
    }
    await updateStorePlan(planTarget.id, newPlan, planReason);
    showToast(`Paket toko ${planTarget.name} diubah ke ${newPlan.toUpperCase()}.`, 'success');
    setPlanTarget(null);
    setPlanReason('');
  };

  const chartGridStroke = isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(100, 116, 139, 0.18)';
  const chartTickColor = isDark ? '#CBD5E1' : '#334155';

  const draftTotalAmount = draftAllocations.reduce((s, i) => s + Number(i.amount || 0), 0);
  const draftTotalCount = draftAllocations.reduce((s, i) => s + Number(i.count || 0), 0);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Superadmin Navbar - Strict No Outbound Links */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent text-white flex items-center justify-center font-bold shadow-glow-sm flex-shrink-0">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                  Threadly Platform Super Admin
                </h1>
                <Badge variant="champagne">Platform Root</Badge>
                <Badge variant="success">Privasi Tenant Terjaga</Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {currentUser?.email || 'andariftri7@gmail.com'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="border-rose-500/40 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              leftIcon={<LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />}
            >
              Keluar Akun
            </Button>
          </div>
        </div>

        {/* BAGIAN 1: Top Platform Metrics (Cleaned: ONLY TOTAL TOKO & TOTAL KONSUMSI TOKEN AI PLATFORM) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                TOTAL TOKO
              </p>
              <p className="text-3xl font-black mt-1.5 text-card-foreground">
                {totalStores}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                {activeStores} toko aktif beroperasional
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                TOTAL KONSUMSI TOKEN AI PLATFORM
              </p>
              <p className="text-3xl font-black mt-1.5 text-violet-700 dark:text-violet-400">
                {totalPlatformAiTokens.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Token AI terpakai dari {totalAiRunsCount} eksekusi seluruh tenant
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-700 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Tab Navigation (Audit Log tab removed per BAGIAN 1) */}
        <div className="flex flex-wrap border-b border-border gap-x-5 gap-y-2 text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Daftar &amp; Status Toko
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`pb-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'finance'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Laporan Keuangan Interaktif
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai_logs')}
            className={`pb-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'ai_logs'
                ? 'border-secondary text-secondary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Log Pemakaian AI
          </button>
        </div>

        {/* TAB 1: Stores List */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Cari nama toko, slug..."
                  value={searchStore}
                  onChange={e => setSearchStore(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex gap-2">
                {(['all', 'active', 'inactive'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                      statusFilter === st
                        ? 'bg-secondary text-white'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st === 'all' ? 'Semua' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Mobile Card List (< md) */}
              <div className="md:hidden divide-y divide-border">
                {filteredStores.map(store => {
                  const stats = platformStats.storeStats[store.id] || { customers: 0, products: 0, orders: 0 };
                  return (
                    <div key={store.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-card-foreground text-sm">{store.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">/{store.slug}</p>
                        </div>
                        <Badge variant={store.status === 'active' ? 'success' : 'danger'}>
                          {store.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-xl bg-muted/60 border border-border text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Pelanggan</span>
                          <span className="font-bold text-card-foreground">{stats.customers}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Produk</span>
                          <span className="font-bold text-card-foreground">{stats.products}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Pesanan</span>
                          <span className="font-bold text-card-foreground">{stats.orders}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1 items-center justify-between">
                        <div className="text-[10px] text-muted-foreground">
                          Paket: <strong className="uppercase text-card-foreground">{store.plan || 'Standar'}</strong>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPlanTarget({
                                id: store.id,
                                name: store.name,
                                currentPlan: store.plan || 'standar',
                              });
                              setNewPlan(store.plan === 'pro' ? 'standar' : 'pro');
                              setPlanReason('');
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-100 dark:bg-violet-500/15 text-violet-900 dark:text-violet-300 hover:opacity-90 transition border border-violet-300 dark:border-violet-500/30 touch-target"
                          >
                            <Sparkles className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                            Ubah Paket
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setToggleTarget({
                                id: store.id,
                                name: store.name,
                                currentStatus: store.status,
                              })
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition border touch-target ${
                              store.status === 'active'
                                ? 'text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800/40 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                : 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            <Power className="w-4 h-4 inline mr-1" strokeWidth={1.5} />
                            {store.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-muted-foreground">
                  <thead className="bg-muted uppercase font-bold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-4">Toko Fashion</th>
                      <th className="p-4">Alamat Etalase</th>
                      <th className="p-4">Paket &amp; Masa Coba</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Pelanggan</th>
                      <th className="p-4 text-center">Produk</th>
                      <th className="p-4 text-center">Pesanan</th>
                      <th className="p-4 text-right">Aksi Super Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredStores.map(store => {
                      const stats = platformStats.storeStats[store.id] || { customers: 0, products: 0, orders: 0 };

                      return (
                        <tr key={store.id} className="hover:bg-muted/40 transition">
                          <td className="p-4">
                            <p className="font-bold text-card-foreground text-sm">{store.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">ID: {store.id}</p>
                          </td>
                          <td className="p-4 font-mono text-violet-700 dark:text-violet-400 font-semibold">
                            /{store.slug}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <Badge variant={store.plan === 'pro' ? 'purple' : 'default'} className="w-fit uppercase text-[10px]">
                                {store.plan || 'Standar'}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                Trial s/d {store.trial_ends_at ? formatShortDate(store.trial_ends_at) : '7 hari'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={store.status === 'active' ? 'success' : 'danger'} className="text-[10px]">
                              {store.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 text-center font-bold text-card-foreground">{stats.customers}</td>
                          <td className="p-4 text-center font-bold text-card-foreground">{stats.products}</td>
                          <td className="p-4 text-center font-bold text-card-foreground">{stats.orders}</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPlanTarget({
                                  id: store.id,
                                  name: store.name,
                                  currentPlan: store.plan || 'standar',
                                });
                                setNewPlan(store.plan === 'pro' ? 'standar' : 'pro');
                                setPlanReason('');
                              }}
                              className="p-1.5 px-2.5 rounded-lg text-xs font-semibold bg-violet-100 dark:bg-violet-500/15 text-violet-900 dark:text-violet-300 hover:opacity-90 transition border border-violet-300 dark:border-violet-500/30"
                              title="Ubah Paket Langganan"
                            >
                              <Sparkles className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                              Ubah Paket
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setToggleTarget({
                                  id: store.id,
                                  name: store.name,
                                  currentStatus: store.status,
                                })
                              }
                              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                                store.status === 'active'
                                  ? 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              }`}
                              title={store.status === 'active' ? 'Nonaktifkan Toko' : 'Aktifkan Toko'}
                            >
                              <Power className="w-4 h-4 inline mr-1" strokeWidth={1.5} />
                              {store.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>

                            <span className="p-1 px-2.5 rounded-lg text-[11px] font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1">
                              <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                              Privasi Terlindungi
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Interactive Financial Report */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            {/* Top Interactive Filter Bar */}
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Period Filter */}
                <div className="flex items-center gap-1.5 bg-muted border border-border p-1 rounded-xl">
                  {(['all', 'this_month', 'last_30d', 'this_year'] as const).map(p => {
                    const labels = {
                      all: 'Semua Waktu',
                      this_month: 'Bulan Ini',
                      last_30d: '30 Hari',
                      this_year: 'Tahun Ini',
                    };
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFinancePeriod(p)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                          financePeriod === p
                            ? 'bg-secondary text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {labels[p]}
                      </button>
                    );
                  })}
                </div>

                {/* Store Filter */}
                <select
                  aria-label="Filter Toko Platform"
                  value={financeStore}
                  onChange={e => setFinanceStore(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  <option value="all">Semua Toko Platform</option>
                  {allStores.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.plan.toUpperCase()})
                    </option>
                  ))}
                </select>

                {/* Plan Filter */}
                <select
                  aria-label="Filter Paket Langganan"
                  value={financePlan}
                  onChange={e => setFinancePlan(e.target.value as 'all' | 'standar' | 'pro')}
                  className="px-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  <option value="all">Semua Paket</option>
                  <option value="standar">Paket Standar (Rp20.000)</option>
                  <option value="pro">Paket Pro (Rp45.000)</option>
                </select>
              </div>

              {/* Search & CSV Export Button */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" strokeWidth={1.5} />
                  <input
                    type="text"
                    placeholder="Cari transaksi / toko..."
                    value={financeSearch}
                    onChange={e => setFinanceSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportFinancialCsv}
                  leftIcon={<Download className="w-3.5 h-3.5" strokeWidth={1.5} />}
                >
                  Ekspor CSV
                </Button>
              </div>
            </div>

            {/* Multi-Tenant Privacy Isolation Notice */}
            <div className="bg-card border border-emerald-500/40 p-4 rounded-2xl flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h5 className="font-bold text-sm text-foreground flex flex-wrap items-center gap-2">
                  Isolasi Privasi Multi-Tenant Aktif
                  <Badge variant="success">Data Dagangan Tenant Dirahasiakan</Badge>
                </h5>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Sesuai arsitektur isolasi multi-tenant, seluruh rincian transaksi belanja, produk dagangan, dan data omzet internal (termasuk <strong>Total GMV Penjualan</strong> toko penyewa) dienkripsi &amp; dirahasiakan penuh. Superadmin hanya memantau ringkasan <strong>Pendapatan Platform (SaaS Subscription Revenue)</strong>. Seluruh data transaksi pesanan belanja tetap hanya bisa diakses oleh masing-masing pemilik toko di dashboard privat mereka.
                </p>
              </div>
            </div>

            {/* 4 Financial KPI Cards (SaaS Subscription Revenue) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Total Pendapatan Paket Standar</p>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">
                  {formatRupiah(financialMetrics.standarRevenue)}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                  Rp20.000 / toko per bulan ({financialMetrics.standarCount} pembayaran)
                </p>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Total Pendapatan Paket Pro</p>
                  <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-violet-700 dark:text-violet-400 mt-2">
                  {formatRupiah(financialMetrics.proRevenue)}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                  Rp45.000 / toko per bulan ({financialMetrics.proCount} pembayaran)
                </p>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Akumulasi Pemasukan Platform</p>
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-sky-700 dark:text-sky-400 mt-2">
                  {formatRupiah(financialMetrics.totalPlatformRevenue || financialMetrics.mrrTotal)}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Estimasi MRR SaaS: {formatRupiah(financialMetrics.mrrTotal)} / bln
                </p>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Toko Langganan Aktif</p>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-2">
                  {financialMetrics.activeStoresCount} Toko
                </h3>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium">
                  {financialMetrics.standarStoresCount} Standar, {financialMetrics.proStoresCount} Pro aktif
                </p>
              </div>
            </div>

            {/* BAGIAN 3: Aesthetic Revenue Visualization Charts (Recharts) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Area Chart: Cumulative Platform Revenue Growth Trend */}
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="font-bold text-sm text-card-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                      Tren Pertumbuhan Akumulasi Pemasukan Platform
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Akumulasi pendapatan langganan SaaS terfilter dari seluruh siklus penagihan.
                    </p>
                  </div>
                  <Badge variant="purple">{cumulativeRevenueSeries.length} Periode</Badge>
                </div>

                {cumulativeRevenueSeries.length === 0 ? (
                  <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    Tidak ada data pertumbuhan pendapatan untuk filter yang dipilih.
                  </div>
                ) : (
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cumulativeRevenueSeries} margin={{ top: 10, right: 16, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="threadlyAccumulatedGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6D5BE8" stopOpacity={0.55} />
                            <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="threadlyMonthlyGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#C9A96E" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fill: chartTickColor, fontSize: 11 }}
                          axisLine={{ stroke: chartGridStroke }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: chartTickColor, fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          width={68}
                          tickFormatter={(val: number) =>
                            val >= 1000 ? `Rp${Math.round(val / 1000)}rb` : `Rp${val}`
                          }
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload || payload.length === 0) return null;
                            const row = payload[0].payload as { label: string; bulanan: number; akumulasi: number };
                            return (
                              <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
                                <p className="font-bold text-foreground">{label}</p>
                                <p className="text-violet-700 dark:text-violet-300 font-semibold">
                                  Akumulasi: {formatRupiah(row.akumulasi)}
                                </p>
                                <p className="text-amber-700 dark:text-amber-300 font-medium">
                                  Bulan Ini: {formatRupiah(row.bulanan)}
                                </p>
                              </div>
                            );
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="akumulasi"
                          name="Akumulasi Platform"
                          stroke="#6D5BE8"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#threadlyAccumulatedGrad)"
                          activeDot={{ r: 5, fill: '#C9A96E', stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="bulanan"
                          name="Pendapatan Bulanan"
                          stroke="#C9A96E"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#threadlyMonthlyGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Donut Chart: Standar vs Pro Revenue Portion */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-card-foreground flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                    Porsi Pendapatan Paket
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Perbandingan kontribusi Paket Standar vs Paket Pro.
                  </p>
                </div>

                {financialMetrics.totalPlatformRevenue === 0 ? (
                  <div className="h-[190px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-xl my-3">
                    Belum ada transaksi lunas pada filter ini.
                  </div>
                ) : (
                  <div className="relative h-[195px] w-full my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={planRevenueShareData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={56}
                          outerRadius={82}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {planRevenueShareData.map((entry, idx) => (
                            <Cell key={`plan-slice-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || payload.length === 0) return null;
                            const d = payload[0].payload as { name: string; value: number; count: number };
                            const share =
                              financialMetrics.totalPlatformRevenue > 0
                                ? Math.round((d.value / financialMetrics.totalPlatformRevenue) * 100)
                                : 0;
                            return (
                              <div className="bg-popover border border-border rounded-xl p-2.5 shadow-xl text-xs">
                                <p className="font-bold text-foreground">{d.name}</p>
                                <p className="text-muted-foreground font-semibold">
                                  {formatRupiah(d.value)} ({share}%)
                                </p>
                                <p className="text-[11px] text-muted-foreground">{d.count} tagihan lunas</p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Total</span>
                      <span className="text-sm font-black text-card-foreground">
                        {formatRupiah(financialMetrics.totalPlatformRevenue)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border">
                  {planRevenueShareData.map(item => {
                    const pct =
                      financialMetrics.totalPlatformRevenue > 0
                        ? Math.round((item.value / financialMetrics.totalPlatformRevenue) * 100)
                        : 0;
                    return (
                      <div key={item.name} className="p-2.5 rounded-xl bg-muted/60 border border-border">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-[11px] font-bold text-card-foreground truncate">{item.name}</span>
                        </div>
                        <p className="text-xs font-black text-card-foreground mt-1">{formatRupiah(item.value)}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">
                          {pct}% &bull; {item.count} trx
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Performance by Store Table: SaaS Subscription Contribution */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-card-foreground">Rangkuman Kontribusi Langganan per Toko Fashion</h4>
                  <p className="text-xs text-muted-foreground">Paket langganan SaaS, tarif bulanan, dan status billing operasional penyewa.</p>
                </div>
                <Badge variant="purple">{storeFinancialPerformance.length} Toko Terdaftar</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-muted-foreground">
                  <thead className="bg-muted uppercase font-bold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3.5">Nama Toko</th>
                      <th className="p-3.5">Paket Langganan</th>
                      <th className="p-3.5 text-right">Biaya Langganan/Bln</th>
                      <th className="p-3.5 text-right">Akumulasi Kontribusi SaaS</th>
                      <th className="p-3.5">Masa Coba / Siklus</th>
                      <th className="p-3.5 text-center">Status Billing</th>
                      <th className="p-3.5 text-center">Isolasi Omzet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {storeFinancialPerformance.map(store => (
                      <tr key={store.storeId} className="hover:bg-muted/40 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-card-foreground text-sm">{store.storeName}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">/{store.slug}</p>
                        </td>
                        <td className="p-3.5">
                          <Badge variant={store.plan === 'pro' ? 'purple' : 'default'} className="uppercase text-[10px]">
                            {store.plan === 'pro' ? 'Paket Pro' : 'Paket Standar'}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right font-bold text-violet-700 dark:text-violet-400 font-mono">
                          {formatRupiah(store.saasFee)}
                        </td>
                        <td className="p-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                          {formatRupiah(store.storeSaasTotal)}
                        </td>
                        <td className="p-3.5">
                          <p className="text-card-foreground font-medium">Bulanan</p>
                          <p className="text-[10px] text-muted-foreground">
                            Trial s/d {store.trialEndsAt ? formatShortDate(store.trialEndsAt) : '7 Hari'}
                          </p>
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge variant={store.status === 'active' ? 'success' : 'danger'} className="text-[10px]">
                            {store.status === 'active' ? 'Aktif Berlangganan' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge variant="default" className="text-[10px]">
                            Privat Toko (Terselubung)
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BAGIAN 4: Editable Payment Method Distribution + Interactive Horizontal Bar Chart */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-sm text-card-foreground flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-secondary" strokeWidth={1.5} />
                      Distribusi Metode Pembayaran Langganan Platform
                    </h4>
                    <Badge variant={allocationsSyncSource === 'supabase' ? 'success' : 'champagne'} className="text-[10px]">
                      <Database className="w-3 h-3 mr-1" strokeWidth={1.5} />
                      {allocationsSyncSource === 'supabase'
                        ? 'Tersinkron Supabase'
                        : allocationsSyncSource === 'local'
                        ? 'Metadata Tersimpan'
                        : 'Hitungan Otomatis'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Proporsi volume &amp; frekuensi transaksi metode pembayaran (dapat dikelola manual oleh Super Admin).
                    {allocationsUpdatedAt && ` Diperbarui: ${formatDateWIB(allocationsUpdatedAt)}`}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleOpenAllocationModal}
                  leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />}
                >
                  Kelola Alokasi Pembayaran
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* Interactive Horizontal Bar Chart */}
                <div className="lg:col-span-6 h-[240px] w-full bg-muted/30 border border-border rounded-xl p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={paymentMethodChartData}
                      layout="vertical"
                      margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} horizontal={false} />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fill: chartTickColor, fontSize: 11 }}
                        tickFormatter={(v: number) => `${v}%`}
                        axisLine={{ stroke: chartGridStroke }}
                      />
                      <YAxis
                        type="category"
                        dataKey="shortLabel"
                        width={108}
                        tick={{ fill: chartTickColor, fontSize: 11, fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const item = payload[0].payload as PaymentAllocation & { pct: number };
                          return (
                            <div className="bg-popover border border-border rounded-xl p-3 shadow-xl text-xs space-y-1">
                              <p className="font-bold text-foreground">{item.method}</p>
                              <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                                {formatRupiah(item.amount)} ({item.pct}%)
                              </p>
                              <p className="text-muted-foreground">{item.count} transaksi</p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="pct" name="Proporsi (%)" radius={[0, 8, 8, 0]} barSize={22}>
                        {paymentMethodChartData.map((entry, idx) => (
                          <Cell key={`pm-bar-${idx}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Dynamic Cards Breakdown */}
                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethodChartData.map((pm, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-card-foreground truncate" title={pm.method}>
                          {pm.method}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">
                          {pm.count} trx
                        </span>
                      </div>
                      <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                        {formatRupiah(pm.amount)}
                      </p>
                      <div className="w-full bg-card border border-border/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${pm.pct}%`, backgroundColor: pm.color }}
                        />
                      </div>
                      <p className="text-[11px] font-semibold text-muted-foreground text-right">
                        {pm.pct}% dari total alokasi
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BAGIAN 5: Rincian Transaksi Platform Interaktif + SheetJS Excel (.xlsx) Export */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-card-foreground">Rincian Transaksi Platform Interaktif</h4>
                  <p className="text-xs text-muted-foreground">Daftar riwayat transaksi langganan dan pembayaran paket oleh para pemilik toko.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="purple">{filteredSubscriptionTransactions.length} Tagihan Terfilter</Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportExcel}
                    leftIcon={<FileSpreadsheet className="w-4 h-4" strokeWidth={1.5} />}
                  >
                    Unduh File Excel
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs text-muted-foreground">
                  <thead className="bg-muted uppercase font-bold text-muted-foreground border-b border-border sticky top-0 z-10">
                    <tr>
                      <th className="p-3">No. Tagihan</th>
                      <th className="p-3">Nama Toko</th>
                      <th className="p-3">Paket Langganan</th>
                      <th className="p-3">Periode Billing</th>
                      <th className="p-3">Metode Bayar</th>
                      <th className="p-3 text-right">Nominal Langganan</th>
                      <th className="p-3">Tanggal Transaksi</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSubscriptionTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
                          Tidak ada transaksi langganan yang cocok dengan filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      filteredSubscriptionTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-muted/40 transition">
                          <td className="p-3 font-mono font-bold text-card-foreground">#{tx.invoiceNumber}</td>
                          <td className="p-3">
                            <span className="font-bold text-card-foreground">{tx.storeName}</span>
                            <span className="block text-[11px] font-mono text-muted-foreground">/{tx.storeSlug}</span>
                          </td>
                          <td className="p-3">
                            <Badge variant={tx.plan === 'pro' ? 'purple' : 'default'} className="uppercase text-[10px]">
                              {tx.plan === 'pro' ? 'Paket Pro' : 'Paket Standar'}
                            </Badge>
                          </td>
                          <td className="p-3 text-card-foreground">{tx.billingPeriod}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted border border-border text-card-foreground font-medium">
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {formatRupiah(tx.amount)}
                          </td>
                          <td className="p-3 text-muted-foreground">{formatDateWIB(tx.paymentDate)}</td>
                          <td className="p-3 text-center">
                            <Badge variant={tx.status === 'Lunas' ? 'success' : 'warning'} className="text-[10px]">
                              {tx.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BAGIAN 2: TAB 3 — Monitoring Kuota Token AI per Toko & Notifikasi WA/Email */}
        {activeTab === 'ai_logs' && (
          <div className="space-y-4">
            {/* Summary & Filter Controls */}
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-card-foreground mr-1">Status Kuota:</span>
                {(['all', 'Aman', 'Hampir Habis', 'Token Habis'] as const).map(st => {
                  const countMap = {
                    all: storeAiQuotaRows.length,
                    Aman: aiQuotaSummary.aman,
                    'Hampir Habis': aiQuotaSummary.hampirHabis,
                    'Token Habis': aiQuotaSummary.tokenHabis,
                  };
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAiStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        aiStatusFilter === st
                          ? 'bg-secondary text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {st === 'all' ? 'Semua' : st} ({countMap[st]})
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Cari toko, email pemilik, atau nomor WA..."
                  value={aiSearch}
                  onChange={e => setAiSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-card-foreground">
                    Monitoring Kuota Token AI per Toko
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Pantau batas kuota token bulanan per tenant dan kirim notifikasi WhatsApp atau Email otomatis saat kuota menipis/habis.
                  </p>
                </div>
                <Badge variant="purple">
                  Total Platform: {totalPlatformAiTokens.toLocaleString('id-ID')} Token
                </Badge>
              </div>

              {/* Mobile View (< md) */}
              <div className="md:hidden divide-y divide-border">
                {filteredAiQuotaRows.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    Tidak ada toko yang cocok dengan filter kuota AI.
                  </div>
                ) : (
                  filteredAiQuotaRows.map(row => (
                    <div key={row.storeId} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-card-foreground">{row.storeName}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" strokeWidth={1.5} /> {row.phoneWa}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" strokeWidth={1.5} /> {row.ownerEmail}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={row.plan === 'pro' ? 'purple' : 'default'} className="text-[10px]">
                            Paket {row.planLabel}
                          </Badge>
                          <Badge
                            variant={
                              row.quotaStatus === 'Token Habis'
                                ? 'danger'
                                : row.quotaStatus === 'Hampir Habis'
                                ? 'warning'
                                : 'success'
                            }
                            className="text-[10px]"
                          >
                            {row.quotaStatus}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">
                            {row.usedTokens.toLocaleString('id-ID')} / {row.monthlyTokenLimit.toLocaleString('id-ID')} token
                          </span>
                          <span className="font-bold text-card-foreground">{row.rawPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden border border-border/50">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              row.quotaStatus === 'Token Habis'
                                ? 'bg-rose-600'
                                : row.quotaStatus === 'Hampir Habis'
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${row.progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <a
                          href={row.waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition touch-target"
                        >
                          <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                          Notifikasi WhatsApp
                        </a>
                        <a
                          href={row.mailtoHref}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-muted text-foreground hover:bg-muted/80 transition touch-target"
                        >
                          <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                          Kirim Email
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-muted-foreground">
                  <thead className="bg-muted uppercase font-bold text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-4">Nama Toko &amp; Kontak</th>
                      <th className="p-4">Paket Aktif</th>
                      <th className="p-4 w-72">Batas Kuota Token Bulanan vs Terpakai</th>
                      <th className="p-4 text-center">Status Kuota</th>
                      <th className="p-4 text-right">Notifikasi Pemilik Toko</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAiQuotaRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          Tidak ada toko yang cocok dengan filter kuota AI.
                        </td>
                      </tr>
                    ) : (
                      filteredAiQuotaRows.map(row => (
                        <tr key={row.storeId} className="hover:bg-muted/40 transition">
                          <td className="p-4">
                            <p className="font-bold text-sm text-card-foreground">{row.storeName}</p>
                            <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                              <p className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-emerald-700 dark:text-emerald-400" strokeWidth={1.5} />
                                <span className="font-mono">{row.phoneWa}</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-secondary" strokeWidth={1.5} />
                                <span className="font-mono">{row.ownerEmail}</span>
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={row.plan === 'pro' ? 'purple' : 'default'} className="uppercase text-[10px]">
                              {row.planLabel}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono font-bold text-card-foreground">
                                  {row.usedTokens.toLocaleString('id-ID')} / {row.monthlyTokenLimit.toLocaleString('id-ID')}
                                </span>
                                <span className="font-bold text-card-foreground">{row.rawPct}%</span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden border border-border/60">
                                <div
                                  className={`h-2.5 rounded-full transition-all duration-500 ${
                                    row.quotaStatus === 'Token Habis'
                                      ? 'bg-rose-600'
                                      : row.quotaStatus === 'Hampir Habis'
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-600'
                                  }`}
                                  style={{ width: `${row.progressPct}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {row.runsCount} pemanggilan bulan ini
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <Badge
                              variant={
                                row.quotaStatus === 'Token Habis'
                                  ? 'danger'
                                  : row.quotaStatus === 'Hampir Habis'
                                  ? 'warning'
                                  : 'success'
                              }
                            >
                              {row.quotaStatus}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex flex-wrap items-center justify-end gap-2">
                              <a
                                href={row.waHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-sm"
                                title={`Kirim WhatsApp ke ${row.phoneWa}`}
                              >
                                <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                                Notifikasi WhatsApp
                              </a>
                              <a
                                href={row.mailtoHref}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition shadow-sm"
                                title={`Kirim Email ke ${row.ownerEmail}`}
                              >
                                <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                                Kirim Email
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BAGIAN 4: Modal Kelola Alokasi Pembayaran Manual */}
      <Modal
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        title="Kelola Alokasi Metode Pembayaran"
        description="Edit nominal dan frekuensi transaksi tiap metode pembayaran platform. Persentase grafik akan dihitung ulang secara dinamis."
        maxWidth="lg"
      >
        <div className="space-y-4 pt-1">
          <div className="space-y-3">
            {draftAllocations.map((item, idx) => {
              const pct = draftTotalAmount > 0 ? ((item.amount / draftTotalAmount) * 100).toFixed(1) : '0.0';
              return (
                <div
                  key={item.method}
                  className="p-3.5 rounded-xl bg-muted/50 border border-border grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                >
                  <div className="sm:col-span-5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: PAYMENT_BAR_COLORS[idx % PAYMENT_BAR_COLORS.length] }}
                      />
                      <span className="font-bold text-xs text-card-foreground">{item.method}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Proporsi saat ini: <strong className="text-card-foreground">{pct}%</strong>
                    </p>
                  </div>

                  <div className="sm:col-span-4">
                    <Input
                      label="Nominal (Rp)"
                      type="number"
                      min={0}
                      step={1000}
                      value={item.amount}
                      onChange={e => {
                        const val = Math.max(0, Number(e.target.value) || 0);
                        setDraftAllocations(prev =>
                          prev.map((p, i) => (i === idx ? { ...p, amount: val } : p))
                        );
                      }}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <Input
                      label="Frekuensi (Trx)"
                      type="number"
                      min={0}
                      step={1}
                      value={item.count}
                      onChange={e => {
                        const val = Math.max(0, Math.round(Number(e.target.value) || 0));
                        setDraftAllocations(prev =>
                          prev.map((p, i) => (i === idx ? { ...p, count: val } : p))
                        );
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/10 border border-secondary/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-card-foreground">
              Total Alokasi Tersimpan: <strong className="text-secondary">{formatRupiah(draftTotalAmount)}</strong>
            </span>
            <span className="text-muted-foreground font-mono">
              {draftTotalCount} total transaksi
            </span>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDraftAllocations(computedPaymentAllocations)}
            >
              Sinkronkan dari Tagihan Aktif
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAllocationModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="secondary"
                isLoading={isSavingAllocations}
                onClick={handleSaveAllocations}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Toggle Store Status Modal */}
      <Modal
        isOpen={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        title="Ubah Status Operasional Toko"
        description={`Toko: ${toggleTarget?.name} (Status saat ini: ${toggleTarget?.currentStatus})`}
      >
        <div className="space-y-4 pt-1">
          <Input
            label="Alasan Penonaktifan / Pengaktifan Toko"
            required
            placeholder="Contoh: Permintaan pemilik toko / penangguhan sementara"
            value={toggleReason}
            onChange={e => setToggleReason(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setToggleTarget(null)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleConfirmToggle}>
              Konfirmasi Perubahan Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Plan Change Modal */}
      <Modal
        isOpen={Boolean(planTarget)}
        onClose={() => setPlanTarget(null)}
        title="Ubah Paket Langganan Toko"
        description={`Toko: ${planTarget?.name} (Paket saat ini: ${planTarget?.currentPlan?.toUpperCase()})`}
      >
        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Pilih Paket Langganan Baru
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewPlan('standar')}
                className={`p-3 rounded-xl border text-left transition ${
                  newPlan === 'standar'
                    ? 'border-secondary bg-secondary/10 text-card-foreground shadow-sm ring-1 ring-secondary'
                    : 'border-border bg-muted/50 text-muted-foreground hover:border-foreground/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-card-foreground">Standar</span>
                  <span className="text-[10px] text-secondary font-semibold">Rp20.000/bln</span>
                </div>
                <p className="text-[11px] text-muted-foreground">1 Toko &bull; 2 User &bull; 15.000 Token AI</p>
              </button>

              <button
                type="button"
                onClick={() => setNewPlan('pro')}
                className={`p-3 rounded-xl border text-left transition ${
                  newPlan === 'pro'
                    ? 'border-secondary bg-secondary/10 text-card-foreground shadow-sm ring-1 ring-secondary'
                    : 'border-border bg-muted/50 text-muted-foreground hover:border-foreground/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-card-foreground">Pro</span>
                  <span className="text-[10px] text-secondary font-semibold">Rp45.000/bln</span>
                </div>
                <p className="text-[11px] text-muted-foreground">1 Toko &bull; 5 User &bull; 150.000 Token AI</p>
              </button>
            </div>
          </div>

          <Input
            label="Alasan Perubahan Paket (Wajib Tercatat di Audit Log)"
            required
            placeholder="Contoh: Upgrade paket pro atas konfirmasi WhatsApp tiket #1024"
            value={planReason}
            onChange={e => setPlanReason(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setPlanTarget(null)}>
              Batal
            </Button>
            <Button
              variant="secondary"
              onClick={handleConfirmPlanChange}
              disabled={!planReason.trim()}
            >
              Simpan Paket &amp; Catat Audit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
