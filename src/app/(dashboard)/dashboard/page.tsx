'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store-context';
import { formatRupiah, formatShortDate, buildWhatsAppLink } from '@/lib/utils';
import { Card, Button, Badge, Modal, Input } from '@/components/ui';
import {
  TrendingUp,
  Receipt,
  Users,
  Moon,
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Package,
  Heart,
  Activity,
  Search,
  ExternalLink,
} from 'lucide-react';
import { enforceChatEmojis } from '@/lib/llm/provider';
import { CustomerStage, Customer } from '@/types';

export default function DashboardPage() {
  const { currentStore, orders, customers, products, followupTasks } = useStore();
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | 'custom' | 'all'>('30d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Customer Stage Modal State
  const [selectedStageModal, setSelectedStageModal] = useState<CustomerStage | null>(null);
  const [modalSearch, setModalSearch] = useState('');

  // Filter orders by selected period
  const filteredOrders = useMemo(() => {
    const now = new Date().getTime();
    return orders.filter(o => {
      if (period === 'all') return true;
      const orderTime = new Date(o.created_at).getTime();
      const diffDays = (now - orderTime) / (1000 * 60 * 60 * 24);
      if (period === 'today') return diffDays <= 1;
      if (period === '7d') return diffDays <= 7;
      if (period === '30d') return diffDays <= 30;
      if (period === 'custom') {
        if (!customStart && !customEnd) return true;
        const oDate = new Date(o.created_at);
        if (customStart && oDate < new Date(customStart)) return false;
        if (customEnd) {
          const endObj = new Date(customEnd);
          endObj.setHours(23, 59, 59, 999);
          if (oDate > endObj) return false;
        }
        return true;
      }
      return true;
    });
  }, [orders, period, customStart, customEnd]);

  // Aggregate stats
  const totalOmzet = useMemo(() => {
    return filteredOrders
      .filter(o => o.status !== 'Batal')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  }, [filteredOrders]);

  const totalOrdersCount = useMemo(() => {
    return filteredOrders.filter(o => o.status !== 'Batal').length;
  }, [filteredOrders]);

  const stageCounts = useMemo(() => {
    return {
      Baru: customers.filter(c => c.stage === 'Baru').length,
      Aktif: customers.filter(c => c.stage === 'Aktif').length,
      Setia: customers.filter(c => c.stage === 'Setia').length,
      Tidur: customers.filter(c => c.stage === 'Tidur').length,
    };
  }, [customers]);

  const newCustomersCount = stageCounts.Baru;
  const sleepingCustomersCount = stageCounts.Tidur;

  const stageCustomers = useMemo(() => {
    if (!selectedStageModal) return [];
    return customers.filter(c => {
      if (c.stage !== selectedStageModal) return false;
      if (!modalSearch.trim()) return true;
      const q = modalSearch.toLowerCase().trim();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone_wa.toLowerCase().includes(q) ||
        (c.favorite_size && c.favorite_size.toLowerCase().includes(q)) ||
        (c.favorite_color && c.favorite_color.toLowerCase().includes(q))
      );
    });
  }, [customers, selectedStageModal, modalSearch]);

  const getSleepingWaLink = (customer: Customer) => {
    const defaultTemplate =
      currentStore?.msg_template_followup_sleeping ||
      'Halo Kak {nama}! Kami kangen nih di {toko}. Kebetulan koleksi baru ukuran {ukuran} warna {warna} baru saja restock lho. Yuk cek katalog kami ya!';
    const text = defaultTemplate
      .replace(/{nama}/g, customer.name || 'Kak')
      .replace(/{toko}/g, currentStore?.name || 'toko kami')
      .replace(/{toko_slug}/g, currentStore?.slug || '')
      .replace(/{ukuran}/g, customer.favorite_size || 'favorit')
      .replace(/{warna}/g, customer.favorite_color || 'favorit')
      .replace(/{stage}/g, customer.stage || 'Tidur');
    const finalMsg = enforceChatEmojis(text, currentStore?.message_emoji_style || 'bebas');
    return buildWhatsAppLink(customer.phone_wa || '', finalMsg);
  };

  // Low stock variants warning list (variants with stock <= min_stock_alert)
  const lowStockVariants = useMemo(() => {
    const list: Array<{
      productName: string;
      variantName: string;
      stock: number;
      minStock: number;
      productId: string;
    }> = [];

    for (const p of products) {
      if (p.variants) {
        for (const v of p.variants) {
          if (v.stock <= v.min_stock_alert) {
            list.push({
              productName: p.name,
              variantName: `${v.size} / ${v.color}`,
              stock: v.stock,
              minStock: v.min_stock_alert,
              productId: p.id,
            });
          }
        }
      }
    }
    return list;
  }, [products]);

  // Top selling products
  const topProducts = useMemo(() => {
    const countMap: Record<string, { name: string; count: number; omzet: number }> = {};
    for (const ord of orders) {
      if (ord.status !== 'Batal' && ord.items) {
        for (const it of ord.items) {
          if (!countMap[it.product_name]) {
            countMap[it.product_name] = { name: it.product_name, count: 0, omzet: 0 };
          }
          countMap[it.product_name].count += it.quantity;
          countMap[it.product_name].omzet += it.subtotal;
        }
      }
    }
    return Object.values(countMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [orders]);

  // Pending today followup tasks
  const pendingTasks = useMemo(() => {
    return followupTasks.filter(t => t.status === 'pending').slice(0, 4);
  }, [followupTasks]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">
            Halo, selamat datang kembali!
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Berikut ringkasan performa dan retensi pelanggan di {currentStore?.name}.
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="inline-flex p-1 rounded-xl bg-card border border-border shadow-sm">
            {(['today', '7d', '30d', 'custom', 'all'] as const).map(p => {
              const labels = {
                today: 'Hari Ini',
                '7d': '7 Hari',
                '30d': '30 Hari',
                custom: 'Rentang Kustom',
                all: 'Semua',
              };
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    period === p
                      ? 'bg-navy-900 text-white dark:bg-violet-600'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-navy-900 dark:hover:text-ivory-100'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {period === 'custom' && (
            <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-border text-xs">
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="px-2 py-1 rounded-lg border border-border bg-transparent text-card-foreground"
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="px-2 py-1 rounded-lg border border-border bg-transparent text-card-foreground"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Omzet
            </p>
            <h3 className="text-2xl font-extrabold text-card-foreground mt-1">
              {formatRupiah(totalOmzet)}
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Dari pesanan terkonfirmasi
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Jumlah Pesanan
            </p>
            <h3 className="text-2xl font-extrabold text-card-foreground mt-1">
              {totalOrdersCount}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Periode {period === 'today' ? 'hari ini' : period === '7d' ? '7 hari' : '30 hari'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </Card>

        <Card
          onClick={() => {
            setSelectedStageModal('Baru');
            setModalSearch('');
          }}
          className="p-5 flex items-center justify-between cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition group"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pelanggan Baru
              </p>
              <Badge variant="success">Buka List</Badge>
            </div>
            <h3 className="text-2xl font-extrabold text-card-foreground mt-1 group-hover:text-emerald-600 transition">
              {newCustomersCount}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Belum pernah membeli &bull; Klik untuk daftar
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
            <Users className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </Card>

        <Card
          onClick={() => {
            setSelectedStageModal('Tidur');
            setModalSearch('');
          }}
          className="p-5 flex items-center justify-between cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition group border-amber-200/80 dark:border-amber-900/50"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Pelanggan Tidur
              </p>
              <Badge variant="warning">Ajak WA</Badge>
            </div>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 group-hover:scale-105 transition origin-left">
              {sleepingCustomersCount}
            </h3>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
              Perlu diajak kembali &bull; Klik untuk kirim WA
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center group-hover:scale-105 transition">
            <Moon className="w-6 h-6" strokeWidth={1.5} />
          </div>
        </Card>
      </div>

      {/* Siklus Pelanggan Toko & Retensi Section */}
      <Card className="p-6 border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-card-foreground">
                Siklus Pelanggan Toko ({customers.length} Pelanggan)
              </h3>
              <Badge variant="purple">CRM Lifecycle</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kategorisasi otomatis perjalanan pembeli. Klik kartu siklus untuk melihat daftar dan menghubungi pelanggan tidur via WhatsApp.
            </p>
          </div>
          <Link href="/customers">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />}>
              Buka Manajemen Pelanggan
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Baru */}
          <div
            onClick={() => {
              setSelectedStageModal('Baru');
              setModalSearch('');
            }}
            className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/30 dark:bg-sky-950/20 hover:border-sky-400 transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
                  Pelanggan Baru
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-300">
                  {customers.length > 0 ? Math.round((stageCounts.Baru / customers.length) * 100) : 0}%
                </span>
              </div>
              <p className="text-2xl font-black text-card-foreground mt-2">
                {stageCounts.Baru} <span className="text-xs font-normal text-muted-foreground">orang</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Belum pernah bertransaksi di toko
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-sky-100 dark:border-sky-900/40 flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 font-semibold group-hover:translate-x-0.5 transition">
              <span>Buka List Pelanggan</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </div>

          {/* Card 2: Aktif */}
          <div
            onClick={() => {
              setSelectedStageModal('Aktif');
              setModalSearch('');
            }}
            className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-400 transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Pelanggan Aktif
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">
                  {customers.length > 0 ? Math.round((stageCounts.Aktif / customers.length) * 100) : 0}%
                </span>
              </div>
              <p className="text-2xl font-black text-card-foreground mt-2">
                {stageCounts.Aktif} <span className="text-xs font-normal text-muted-foreground">orang</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Beli dlm {currentStore?.active_threshold_days || 60} hari terakhir
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition">
              <span>Buka List Pelanggan</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </div>

          {/* Card 3: Setia */}
          <div
            onClick={() => {
              setSelectedStageModal('Setia');
              setModalSearch('');
            }}
            className="p-4 rounded-xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/30 dark:bg-violet-950/20 hover:border-violet-400 transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300">
                  Pelanggan Setia
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-300">
                  {customers.length > 0 ? Math.round((stageCounts.Setia / customers.length) * 100) : 0}%
                </span>
              </div>
              <p className="text-2xl font-black text-card-foreground mt-2">
                {stageCounts.Setia} <span className="text-xs font-normal text-muted-foreground">orang</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Min. {currentStore?.loyal_threshold_orders || 3} pesanan dlm {currentStore?.loyal_threshold_days || 90} hari
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-violet-100 dark:border-violet-900/40 flex items-center justify-between text-xs text-violet-600 dark:text-violet-400 font-semibold group-hover:translate-x-0.5 transition">
              <span>Buka List Pelanggan</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </div>

          {/* Card 4: Tidur (Highlighted with WhatsApp Re-engagement) */}
          <div
            onClick={() => {
              setSelectedStageModal('Tidur');
              setModalSearch('');
            }}
            className="p-4 rounded-xl border-2 border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/30 hover:border-amber-500 transition cursor-pointer flex flex-col justify-between group shadow-sm ring-1 ring-amber-400/30"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-800 dark:text-amber-300">
                  Pelanggan Tidur
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  Ajak WA ({stageCounts.Tidur})
                </span>
              </div>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-2">
                {stageCounts.Tidur} <span className="text-xs font-normal text-muted-foreground">orang</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                Tidak beli &gt; {currentStore?.sleeping_threshold_days || 60} hari (Perlu Retensi)
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-bold group-hover:translate-x-0.5 transition">
              <span className="inline-flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                Hubungi via WhatsApp
              </span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Left Column (Tasks & Products) + Right Column (Low Stock Alert) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Follow-up Tasks Today & Top Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Follow-up Tasks */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-card-foreground">
                  Tindak Lanjut Retensi Hari Ini
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ajak kembali pelangganmu sebelum mereka beralih ke toko lain.
                </p>
              </div>
              <Link href="/followup">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />}>
                  Lihat Semua
                </Button>
              </Link>
            </div>

            {pendingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Semua tugas retensi hari ini sudah selesai. Kerja bagus!
              </p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-border flex items-center justify-between gap-4 hover:border-violet-300 dark:hover:border-violet-700 transition bg-slate-50/50 dark:bg-navy-800/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            task.type === 'sleeping_customer'
                              ? 'warning'
                              : task.type === 'unpaid_order'
                              ? 'danger'
                              : 'purple'
                          }
                        >
                          {task.type === 'sleeping_customer'
                            ? 'Pelanggan Tidur'
                            : task.type === 'unpaid_order'
                            ? 'Pesanan Tertunda'
                            : 'Ulang Tahun'}
                        </Badge>
                        <span className="text-xs font-semibold text-card-foreground">
                          {task.customer_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    </div>

                    {task.whatsapp_url && (
                      <a
                        href={task.whatsapp_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition shadow-sm flex-shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Kirim WA</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Top Products */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-card-foreground">
                  Produk Fashion Terlaris
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Koleksi favorit pembeli berdasarkan jumlah terjual.
                </p>
              </div>
              <Link href="/products">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />}>
                  Kelola Stok
                </Button>
              </Link>
            </div>

            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada data penjualan tercatat.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {topProducts.map((p, idx) => (
                  <div key={p.name} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-sm text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.count} potong terjual
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                      {formatRupiah(p.omzet)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Col: Low Stock Warnings */}
        <div className="space-y-6">
          <Card className="border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
              <h3 className="text-base font-bold text-card-foreground">
                Peringatan Stok Varian
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-muted-foreground mb-4">
              Varian busana berikut telah menyentuh batas minimum stok. Segera produksi ulang atau restock agar repeat order tidak terhambat.
            </p>

            {lowStockVariants.length === 0 ? (
              <div className="text-center py-6 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Stok seluruh varian aman dan mencukupi.
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockVariants.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-card rounded-xl border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-card-foreground">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.variantName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          item.stock === 0
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {item.stock === 0 ? 'Habis (0)' : `Sisa ${item.stock}`}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Min. {item.minStock} pcs
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-amber-200/60 dark:border-amber-900/40">
              <Link href="/products">
                <Button variant="outline" size="sm" className="w-full" leftIcon={<Package className="w-3.5 h-3.5" strokeWidth={1.5} />}>
                  Tambah Stok Masuk
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal List Pelanggan Berdasarkan Siklus */}
      <Modal
        isOpen={Boolean(selectedStageModal)}
        onClose={() => {
          setSelectedStageModal(null);
          setModalSearch('');
        }}
        title={`Daftar Pelanggan: Siklus ${selectedStageModal || ''} (${stageCustomers.length})`}
        description={
          selectedStageModal === 'Tidur'
            ? `Pelanggan yang tidak bertransaksi > ${currentStore?.sleeping_threshold_days || 60} hari. Segera hubungi melalui tombol WhatsApp untuk reaktivasi.`
            : selectedStageModal === 'Aktif'
            ? `Pelanggan yang aktif bertransaksi dalam ${currentStore?.active_threshold_days || 60} hari terakhir.`
            : selectedStageModal === 'Setia'
            ? `Pelanggan prioritas dengan minimal ${currentStore?.loyal_threshold_orders || 3} pesanan dalam ${currentStore?.loyal_threshold_days || 90} hari.`
            : `Pelanggan baru terdaftar yang belum pernah melakukan transaksi pembelian.`
        }
        maxWidth="xl"
      >
        <div className="space-y-4 pt-1">
          {selectedStageModal === 'Tidur' && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
              <Moon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="text-xs space-y-1">
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  Peluang Retensi WhatsApp untuk Pelanggan Tidur
                </p>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  Menjangkau pelanggan tidur secara personal memiliki tingkat konversi 3x lebih tinggi. Klik tombol hijau <strong>&quot;Kirim WhatsApp&quot;</strong> di bawah untuk membuka template sapaan personal otomatis.
                </p>
              </div>
            </div>
          )}

          {/* Search within Modal */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Cari nama, nomor WhatsApp, ukuran, warna..."
              value={modalSearch}
              onChange={e => setModalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-muted/60 text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Table / List */}
          <div className="border border-border rounded-xl overflow-hidden max-h-[50vh] overflow-y-auto">
            {stageCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {modalSearch
                  ? `Tidak ada pelanggan yang cocok dengan pencarian "${modalSearch}".`
                  : `Belum ada pelanggan pada siklus ${selectedStageModal}.`}
              </div>
            ) : (
              <table className="w-full text-left text-xs text-muted-foreground">
                <thead className="bg-muted/60 uppercase font-bold text-muted-foreground border-b border-border sticky top-0">
                  <tr>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Preferensi</th>
                    <th className="p-3">Total Belanja</th>
                    <th className="p-3">Order Terakhir</th>
                    <th className="p-3 text-right">Tindakan Retensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stageCustomers.map(cust => (
                    <tr key={cust.id} className="hover:bg-slate-50/70 dark:hover:bg-navy-800/50 transition">
                      <td className="p-3">
                        <p className="font-bold text-card-foreground">{cust.name}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">{cust.phone_wa}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-xs">
                          {cust.favorite_size ? `Size: ${cust.favorite_size}` : '-'}
                          {cust.favorite_color ? ` / ${cust.favorite_color}` : ''}
                        </p>
                        {cust.preferred_style && (
                          <p className="text-[10px] text-muted-foreground">{cust.preferred_style}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-violet-600 dark:text-violet-400">
                          {formatRupiah(cust.total_spend)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{cust.order_count} transaksi</p>
                      </td>
                      <td className="p-3">
                        <p className="text-xs">
                          {cust.last_purchase_date ? formatShortDate(cust.last_purchase_date) : 'Belum pernah'}
                        </p>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {selectedStageModal === 'Tidur' ? (
                          <a
                            href={getSleepingWaLink(cust)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>Kirim WhatsApp</span>
                          </a>
                        ) : (
                          <a
                            href={buildWhatsAppLink(
                              cust.phone_wa,
                              `Halo Kak ${cust.name}! Salam hangat dari ${currentStore?.name || 'kami'}. Ada yang bisa kami bantu seputar koleksi fashion hari ini?`
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-medium transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                            <span>WA</span>
                          </a>
                        )}

                        <Link
                          href={`/customers/${cust.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-muted-foreground hover:text-navy-900 dark:hover:text-ivory-100 transition"
                          title="Buka Profil Lengkap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Total {stageCustomers.length} pelanggan tercantum
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStageModal(null);
                setModalSearch('');
              }}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
