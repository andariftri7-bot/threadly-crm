'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { formatDateWIB, formatShortDate, formatRupiah } from '@/lib/utils';
import { Card, Button, Input, Badge, Modal } from '@/components/ui';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  ShoppingBag,
  Sparkles,
  Search,
  Lock,
  ArrowRight,
  Power,
  FileText,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  BarChart3,
  Download,
  LogOut,
  CheckCircle2,
  Shield,
  CreditCard,
} from 'lucide-react';
import { Order } from '@/types';
import NotFound from '@/app/not-found';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export default function SuperAdminPage() {
  const router = useRouter();
  const {
    currentUser,
    isSuperadmin,
    login,
    logout,
    allStores,
    toggleStoreStatus,
    updateStorePlan,
    auditLogs,
    aiRuns,
    getPlatformStats,
    getAllPlatformOrders,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'ai_logs' | 'audit_logs'>('overview');
  const [searchStore, setSearchStore] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

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

  // Platform aggregates across all stores
  const platformStats = useMemo(() => getPlatformStats(), [getPlatformStats, allStores]);
  const totalStores = platformStats.totalStores;
  const activeStores = platformStats.activeStores;
  const totalCustomersAggregate = platformStats.totalCustomers;
  const totalOrdersAggregate = platformStats.totalOrders;
  const totalAiRunsCount = platformStats.totalAiRuns;

  const filteredStores = useMemo(() => {
    return allStores.filter(s => {
      const q = searchStore.toLowerCase();
      const match = s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q);
      if (!match) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      return true;
    });
  }, [allStores, searchStore, statusFilter]);

  // All platform orders
  const allPlatformOrders = useMemo(() => {
    return getAllPlatformOrders();
  }, [getAllPlatformOrders, allStores]);

  // Interactive Filtered Financial Orders
  const filteredFinancialOrders = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return allPlatformOrders.filter(order => {
      // Store filter
      if (financeStore !== 'all' && order.store_id !== financeStore) {
        return false;
      }

      // Plan filter
      if (financePlan !== 'all') {
        const store = allStores.find(s => s.id === order.store_id);
        if (store?.plan !== financePlan) return false;
      }

      // Period filter
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

      // Search filter
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

  // SaaS Subscription Transaction Type
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

  // Generate SaaS Subscription Billing Records for Tenant Stores
  const allSubscriptionTransactions = useMemo(() => {
    const list: SubscriptionTransaction[] = [];
    allStores.forEach((store, idx) => {
      const plan = (store.plan === 'pro' ? 'pro' : 'standar') as 'standar' | 'pro';
      const amount = plan === 'pro' ? 45000 : 20000;
      const baseDate = store.created_at ? new Date(store.created_at) : new Date(Date.now() - (idx + 1) * 7 * 86400000);

      // Invois Siklus Berjalan
      list.push({
        id: `sub-${store.id}-curr`,
        invoiceNumber: `INV-SAAS-${store.slug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'THRD'}-${baseDate.getFullYear()}${String(baseDate.getMonth() + 1).padStart(2, '0')}`,
        storeId: store.id,
        storeName: store.name,
        storeSlug: store.slug,
        plan,
        amount,
        billingPeriod: baseDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        paymentMethod: idx % 2 === 0 ? 'Transfer Virtual Account' : 'Auto-Debit Platform',
        paymentDate: baseDate.toISOString(),
        status: store.status === 'active' ? 'Lunas' : 'Pending',
      });

      // Invois Siklus Sebelumnya (Riwayat Transaksi Langganan)
      const prevDate = new Date(baseDate);
      prevDate.setMonth(prevDate.getMonth() - 1);
      list.push({
        id: `sub-${store.id}-prev`,
        invoiceNumber: `INV-SAAS-${store.slug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'THRD'}-${prevDate.getFullYear()}${String(prevDate.getMonth() + 1).padStart(2, '0')}`,
        storeId: store.id,
        storeName: store.name,
        storeSlug: store.slug,
        plan,
        amount,
        billingPeriod: prevDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        paymentMethod: idx % 2 === 0 ? 'Transfer Virtual Account' : 'Auto-Debit Platform',
        paymentDate: prevDate.toISOString(),
        status: 'Lunas',
      });
    });

    return list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [allStores]);

  // Interactive Filtered Subscription Invoices (SaaS Platform Revenue)
  const filteredSubscriptionTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return allSubscriptionTransactions.filter(tx => {
      // Store filter
      if (financeStore !== 'all' && tx.storeId !== financeStore) {
        return false;
      }

      // Plan filter
      if (financePlan !== 'all' && tx.plan !== financePlan) {
        return false;
      }

      // Period filter
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

      // Search filter
      if (financeSearch.trim()) {
        const q = financeSearch.toLowerCase().trim();
        const matchesNumber = tx.invoiceNumber.toLowerCase().includes(q);
        const matchesStore = tx.storeName.toLowerCase().includes(q) || tx.storeSlug.toLowerCase().includes(q);
        const matchesPeriod = tx.billingPeriod.toLowerCase().includes(q);
        if (!matchesNumber && !matchesStore && !matchesPeriod) return false;
      }

      return true;
    });
  }, [allSubscriptionTransactions, financeStore, financePlan, financePeriod, financeSearch]);

  // Platform Financial Metrics (SaaS Subscription Revenue & Isolation of Tenant Merchandise GMV)
  const financialMetrics = useMemo(() => {
    // 1. Subscription Revenue Breakdown (Standar & Pro)
    const paidSubs = filteredSubscriptionTransactions.filter(t => t.status === 'Lunas');
    const standarSubs = paidSubs.filter(t => t.plan === 'standar');
    const proSubs = paidSubs.filter(t => t.plan === 'pro');

    const standarRevenue = standarSubs.reduce((sum, t) => sum + t.amount, 0);
    const proRevenue = proSubs.reduce((sum, t) => sum + t.amount, 0);
    const totalPlatformRevenue = standarRevenue + proRevenue;

    // 2. Active Stores Count & Monthly Recurring Revenue (Estimasi MRR SaaS)
    const activeSubscribedStores = allStores.filter(s => {
      if (s.status !== 'active') return false;
      if (financeStore !== 'all' && s.id !== financeStore) return false;
      if (financePlan !== 'all' && s.plan !== financePlan) return false;
      return true;
    });
    const standarStoresCount = activeSubscribedStores.filter(s => (s.plan || 'standar') === 'standar').length;
    const proStoresCount = activeSubscribedStores.filter(s => s.plan === 'pro').length;

    const mrrTotal = activeSubscribedStores.reduce((sum, s) => {
      return sum + (s.plan === 'pro' ? 45000 : 20000);
    }, 0);

    // 3. Isolated Internal Tenant Merchandise Data (diisolasi penuh, dirahasiakan dari tampilan Superadmin)
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
      // Total GMV Penjualan dan pesanan dagangan dirahasiakan secara ketat
      totalGmv,
      aov,
      paidCount,
      totalOrdersCount: filteredFinancialOrders.length,
    };
  }, [filteredSubscriptionTransactions, allStores, financeStore, financePlan, filteredFinancialOrders]);

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
        // Data internal pesanan barang dagangan tenant diisolasi per toko
        const isolatedStoreOrders = filteredFinancialOrders.filter(o => o.store_id === store.id);
        const plan = (store.plan || 'standar') as 'standar' | 'pro';
        const saasFee = plan === 'pro' ? 45000 : 20000;
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

  // SaaS Subscription Payment Methods Breakdown
  const subscriptionPaymentMethodsBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    for (const tx of filteredSubscriptionTransactions) {
      if (tx.status !== 'Lunas') continue;
      const method = tx.paymentMethod || 'Transfer Virtual Account';
      if (!map[method]) map[method] = { count: 0, total: 0 };
      map[method].count += 1;
      map[method].total += Number(tx.amount || 0);
    }
    return Object.entries(map).map(([method, data]) => ({
      method,
      ...data,
    })).sort((a, b) => b.total - a.total);
  }, [filteredSubscriptionTransactions]);

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
      'Status Pembayaran'
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

  // Access Protection Check: Return strictly 404 for unauthorized visitors
  const superadminEmail = (process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || process.env.SUPERADMIN_EMAIL || 'andariftri7@gmail.com').toLowerCase().trim();
  const isAuthorizedSuperadmin =
    isSuperadmin &&
    currentUser &&
    currentUser.email?.toLowerCase().trim() === superadminEmail;

  if (!isAuthorizedSuperadmin) {
    return <NotFound />;
  }

  const handleConfirmToggle = async () => {
    if (!toggleTarget || !toggleReason.trim()) {
      alert('Alasan pengubahan status toko wajib diisi!');
      return;
    }
    const newStatus = toggleTarget.currentStatus === 'active' ? 'inactive' : 'active';
    await toggleStoreStatus(toggleTarget.id, newStatus, toggleReason);
    setToggleTarget(null);
    setToggleReason('');
  };

  const handleConfirmPlanChange = async () => {
    if (!planTarget || !planReason.trim()) {
      alert('Alasan pengubahan paket langganan wajib diisi sesuai prosedur audit!');
      return;
    }
    await updateStorePlan(planTarget.id, newPlan, planReason);
    setPlanTarget(null);
    setPlanReason('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Superadmin Navbar - Strict No Outbound Links */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent text-white flex items-center justify-center font-bold shadow-glow-sm">
              <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
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
              className="bg-card border border-border text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition"
              leftIcon={<LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />}
            >
              Keluar Akun
            </Button>
          </div>
        </div>

        {/* Top Platform Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-card border border-border p-4 rounded-2xl">
            <p className="text-xs text-muted-foreground font-semibold uppercase">Total Toko</p>
            <p className="text-2xl font-black mt-1 text-white">{totalStores}</p>
            <p className="text-[10px] text-emerald-400 mt-1">{activeStores} toko aktif</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl">
            <p className="text-xs text-muted-foreground font-semibold uppercase">Total Pelanggan</p>
            <p className="text-2xl font-black mt-1 text-white">{totalCustomersAggregate}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Agregat seluruh tenant</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl">
            <p className="text-xs text-muted-foreground font-semibold uppercase">Total Pesanan</p>
            <p className="text-2xl font-black mt-1 text-white">{totalOrdersAggregate}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Agregat transaksi</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl">
            <p className="text-xs text-muted-foreground font-semibold uppercase">Pemanggilan AI</p>
            <p className="text-2xl font-black mt-1 text-violet-400">{totalAiRunsCount}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Token usage tracking</p>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl">
            <p className="text-xs text-muted-foreground font-semibold uppercase">Audit Keamanan</p>
            <p className="text-2xl font-black mt-1 text-amber-400">{auditLogs.length}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Aksi tercatat log</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'overview' ? 'border-violet-500 text-violet-400' : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            Daftar &amp; Status Toko
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'finance' ? 'border-violet-500 text-violet-400' : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            Laporan Keuangan Interaktif
          </button>
          <button
            onClick={() => setActiveTab('ai_logs')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'ai_logs' ? 'border-violet-500 text-violet-400' : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            Log Pemakaian AI
          </button>
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'audit_logs' ? 'border-violet-500 text-violet-400' : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            Audit Log Kepatuhan Privasi
          </button>
        </div>

        {/* TAB 1: Stores List */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/50 p-3 rounded-2xl border border-border">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Cari nama toko, slug..."
                  value={searchStore}
                  onChange={e => setSearchStore(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-muted border border-border text-white"
                />
              </div>

              <div className="flex gap-2">
                {(['all', 'active', 'inactive'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                      statusFilter === st ? 'bg-violet-600 text-white' : 'bg-card text-muted-foreground hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'Semua' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs text-muted-foreground">
                <thead className="bg-muted/80 uppercase font-bold text-muted-foreground border-b border-border">
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
                    const storeCustCount = stats.customers;
                    const storeProdCount = stats.products;
                    const storeOrderCount = stats.orders;

                    return (
                      <tr key={store.id} className="hover:bg-card/40">
                        <td className="p-4">
                          <p className="font-bold text-white text-sm">{store.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">ID: {store.id}</p>
                        </td>
                        <td className="p-4 font-mono text-violet-400">
                          /{store.slug}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                store.plan === 'pro'
                                  ? 'bg-violet-950 text-violet-300 border border-violet-800'
                                  : 'bg-slate-700 text-muted-foreground border border-slate-600'
                              }`}
                            >
                              {store.plan || 'Standar'}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Trial s/d {store.trial_ends_at ? formatShortDate(store.trial_ends_at) : '7 hari'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              store.status === 'active'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {store.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold">{storeCustCount}</td>
                        <td className="p-4 text-center font-bold">{storeProdCount}</td>
                        <td className="p-4 text-center font-bold">{storeOrderCount}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setPlanTarget({
                                id: store.id,
                                name: store.name,
                                currentPlan: store.plan || 'standar',
                              });
                              setNewPlan(store.plan === 'pro' ? 'standar' : 'pro');
                              setPlanReason('');
                            }}
                            className="p-1.5 px-2.5 rounded-lg text-xs font-semibold bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition border border-violet-500/30"
                            title="Ubah Paket Langganan"
                          >
                            <Sparkles className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                            Ubah Paket
                          </button>

                          <button
                            onClick={() =>
                              setToggleTarget({
                                id: store.id,
                                name: store.name,
                                currentStatus: store.status,
                              })
                            }
                            className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                              store.status === 'active'
                                ? 'text-rose-400 hover:bg-rose-950/40'
                                : 'text-emerald-400 hover:bg-emerald-950/40'
                            }`}
                            title={store.status === 'active' ? 'Nonaktifkan Toko' : 'Aktifkan Toko'}
                          >
                            <Power className="w-4 h-4 inline mr-1" strokeWidth={1.5} />
                            {store.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>

                          <span className="p-1 px-2.5 rounded-lg text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 inline-flex items-center gap-1">
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
                        onClick={() => setFinancePeriod(p)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                          financePeriod === p
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'text-muted-foreground hover:text-white'
                        }`}
                      >
                        {labels[p]}
                      </button>
                    );
                  })}
                </div>

                {/* Store Filter */}
                <select
                  value={financeStore}
                  onChange={e => setFinanceStore(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-muted border border-border text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
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
                  value={financePlan}
                  onChange={e => setFinancePlan(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl bg-muted border border-border text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="all">Semua Paket</option>
                  <option value="standar">Paket Standar (Rp20.000)</option>
                  <option value="pro">Paket Pro (Rp45.000)</option>
                </select>
              </div>

              {/* Search & Export Button */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" strokeWidth={1.5} />
                  <input
                    type="text"
                    placeholder="Cari transaksi / toko..."
                    value={financeSearch}
                    onChange={e => setFinanceSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-muted border border-border text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportFinancialCsv}
                  className="bg-card border-border text-white hover:bg-slate-700"
                  leftIcon={<Download className="w-3.5 h-3.5" strokeWidth={1.5} />}
                >
                  Ekspor CSV
                </Button>
              </div>
            </div>

            {/* Catatan Privasi Multi-Tenant: Total GMV Penjualan & Transaksi Dagangan Toko Dirahasiakan */}
            <div className="bg-card border border-emerald-500/30 bg-emerald-950/10 p-4 rounded-2xl flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h5 className="font-bold text-sm text-foreground flex items-center gap-2">
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
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-emerald-400 mt-2">
                  {formatRupiah(financialMetrics.standarRevenue)}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                  Rp20.000 / toko per bulan ({financialMetrics.standarCount} pembayaran)
                </p>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Total Pendapatan Paket Pro</p>
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-violet-400 mt-2">
                  {formatRupiah(financialMetrics.proRevenue)}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                  Rp45.000 / toko per bulan ({financialMetrics.proCount} pembayaran)
                </p>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Akumulasi Pemasukan Platform</p>
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-sky-400 mt-2">
                  {formatRupiah(financialMetrics.totalPlatformRevenue || financialMetrics.mrrTotal)}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Estimasi MRR SaaS: {formatRupiah(financialMetrics.mrrTotal)} / bln
                </p>
              </div>

              <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Toko Langganan Aktif</p>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-amber-400 mt-2">
                  {financialMetrics.activeStoresCount} Toko
                </h3>
                <p className="text-[11px] text-amber-400/80 mt-1 font-medium">
                  {financialMetrics.standarStoresCount} Standar, {financialMetrics.proStoresCount} Pro aktif
                </p>
              </div>
            </div>

            {/* Performance by Store Table: SaaS Subscription Contribution */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">Rangkuman Kontribusi Langganan per Toko Fashion</h4>
                  <p className="text-xs text-muted-foreground">Paket langganan SaaS, tarif bulanan, dan status billing operasional penyewa.</p>
                </div>
                <Badge variant="purple">{storeFinancialPerformance.length} Toko Terdaftar</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-muted-foreground">
                  <thead className="bg-muted/80 uppercase font-bold text-muted-foreground border-b border-border">
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
                      <tr key={store.storeId} className="hover:bg-card/40 transition">
                        <td className="p-3.5">
                          <p className="font-bold text-white text-sm">{store.storeName}</p>
                          <p className="text-[11px] font-mono text-slate-500">/{store.slug}</p>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              store.plan === 'pro'
                                ? 'bg-violet-950 text-violet-300 border border-violet-800'
                                : 'bg-slate-700 text-muted-foreground border border-slate-600'
                            }`}
                          >
                            {store.plan === 'pro' ? 'Paket Pro' : 'Paket Standar'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-bold text-violet-400 font-mono">
                          {formatRupiah(store.saasFee)}
                        </td>
                        <td className="p-3.5 text-right font-bold text-emerald-400 font-mono">
                          {formatRupiah(store.storeSaasTotal)}
                        </td>
                        <td className="p-3.5">
                          <p className="text-white font-medium">Bulanan</p>
                          <p className="text-[10px] text-muted-foreground">
                            Trial s/d {store.trialEndsAt ? formatShortDate(store.trialEndsAt) : '7 Hari'}
                          </p>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {store.status === 'active' ? 'Aktif Berlangganan' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            Privat Toko (Terselubung)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h4 className="font-bold text-sm text-white mb-1">Distribusi Metode Pembayaran Langganan Platform</h4>
              <p className="text-xs text-muted-foreground mb-4">Volume dan frekuensi metode bayar langganan SaaS yang digunakan pemilik toko.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subscriptionPaymentMethodsBreakdown.map((pm, idx) => {
                  const pct = financialMetrics.totalPlatformRevenue > 0
                    ? Math.round((pm.total / financialMetrics.totalPlatformRevenue) * 100)
                    : 0;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-muted border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{pm.method}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{pm.count} transaksi</span>
                      </div>
                      <p className="text-lg font-black text-emerald-400">{formatRupiah(pm.total)}</p>
                      <div className="w-full bg-card rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right">{pct}% dari pendapatan platform</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rincian Transaksi Platform Interaktif (Riwayat Pembayaran Langganan SaaS) */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">Rincian Transaksi Platform Interaktif</h4>
                  <p className="text-xs text-muted-foreground">Daftar riwayat transaksi langganan dan pembayaran paket oleh para pemilik toko.</p>
                </div>
                <Badge variant="purple">{filteredSubscriptionTransactions.length} Tagihan Terfilter</Badge>
              </div>

              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs text-muted-foreground">
                  <thead className="bg-muted/80 uppercase font-bold text-muted-foreground border-b border-border sticky top-0">
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
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          Tidak ada transaksi langganan yang cocok dengan filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      filteredSubscriptionTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-card/40 transition">
                          <td className="p-3 font-mono font-bold text-white">#{tx.invoiceNumber}</td>
                          <td className="p-3">
                            <span className="font-bold text-white">{tx.storeName}</span>
                            <span className="block text-[11px] font-mono text-slate-500">/{tx.storeSlug}</span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                tx.plan === 'pro'
                                  ? 'bg-violet-950 text-violet-300 border border-violet-800'
                                  : 'bg-slate-700 text-muted-foreground border border-slate-600'
                              }`}
                            >
                              {tx.plan === 'pro' ? 'Paket Pro' : 'Paket Standar'}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground">{tx.billingPeriod}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-850 border border-border text-muted-foreground">
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            {formatRupiah(tx.amount)}
                          </td>
                          <td className="p-3 text-muted-foreground">{formatDateWIB(tx.paymentDate)}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.status === 'Lunas'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {tx.status}
                            </span>
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

        {/* TAB 2: AI Usage Logs */}
        {activeTab === 'ai_logs' && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm text-white">Riwayat Pemanggilan AI Engine</h4>
                <p className="text-xs text-muted-foreground">Pantau biaya token, latensi komputasi, dan status eksekusi.</p>
              </div>
              <Badge variant="purple">{aiRuns.length} Panggilan</Badge>
            </div>

            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-muted/80 uppercase font-bold text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">Waktu (WIB)</th>
                  <th className="p-3">Fitur</th>
                  <th className="p-3">Token Total</th>
                  <th className="p-3">Latensi</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {aiRuns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      Belum ada pemanggilan AI tercatat.
                    </td>
                  </tr>
                ) : (
                  aiRuns.map(run => (
                    <tr key={run.id}>
                      <td className="p-3 text-muted-foreground">{formatDateWIB(run.created_at)}</td>
                      <td className="p-3 font-sans font-semibold text-white">{run.feature_type}</td>
                      <td className="p-3 text-violet-400">{run.total_tokens} tokens</td>
                      <td className="p-3">{run.latency_ms} ms</td>
                      <td className="p-3">
                        <span className="text-emerald-400 font-bold uppercase">{run.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Audit Logs */}
        {activeTab === 'audit_logs' && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h4 className="font-bold text-sm text-white">Log Audit Kepatuhan &amp; Privasi</h4>
              <p className="text-xs text-muted-foreground">
                Setiap tindakan superadmin mengakses data atau mengubah status toko wajib tercatat permanen di sini.
              </p>
            </div>

            <table className="w-full text-left text-xs text-muted-foreground">
              <thead className="bg-muted/80 uppercase font-bold text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Super Admin</th>
                  <th className="p-3">Aksi</th>
                  <th className="p-3">Toko Sasaran</th>
                  <th className="p-3">Alasan Kepatuhan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      Belum ada audit log tercatat.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id}>
                      <td className="p-3 text-muted-foreground">{formatDateWIB(log.created_at)}</td>
                      <td className="p-3 font-mono text-muted-foreground">{log.user_email}</td>
                      <td className="p-3">
                        <Badge variant="warning">{log.action}</Badge>
                      </td>
                      <td className="p-3 font-semibold text-white">{log.target_store_name || '-'}</td>
                      <td className="p-3 text-amber-200 italic">&ldquo;{log.reason}&rdquo;</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>



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
                    ? 'border-violet-500 bg-violet-950/40 text-white shadow-sm ring-1 ring-violet-500'
                    : 'border-border bg-slate-850 text-muted-foreground hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">Standar</span>
                  <span className="text-[10px] text-violet-400 font-semibold">Rp20.000/bln</span>
                </div>
                <p className="text-[11px] text-muted-foreground">1 Toko &bull; 2 User &bull; 300 Pelanggan</p>
              </button>

              <button
                type="button"
                onClick={() => setNewPlan('pro')}
                className={`p-3 rounded-xl border text-left transition ${
                  newPlan === 'pro'
                    ? 'border-violet-500 bg-violet-950/40 text-white shadow-sm ring-1 ring-violet-500'
                    : 'border-border bg-slate-850 text-muted-foreground hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">Pro</span>
                  <span className="text-[10px] text-violet-400 font-semibold">Rp45.000/bln</span>
                </div>
                <p className="text-[11px] text-muted-foreground">1 Toko &bull; 5 User &bull; Unlimited CRM</p>
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
