'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store-context';
import { Customer, CustomerStage, CustomerSource } from '@/types';
import { formatRupiah, formatShortDate, normalizeWhatsAppNumber } from '@/lib/utils';
import { Card, Button, Input, Badge, Modal, EmptyState } from '@/components/ui';
import {
  Users,
  Search,
  Plus,
  Filter,
  AlertCircle,
  Eye,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

export default function CustomersPage() {
  const { customers, addCustomer, checkDuplicateCustomerPhone, currentStore } = useStore();

  // Filters & Search
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'spend-desc' | 'orders-desc' | 'recent'>('recent');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // Extract distinct colors and tags for dropdowns
  const distinctColors = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => {
      if (c.favorite_color) set.add(c.favorite_color.trim());
    });
    return Array.from(set);
  }, [customers]);

  const distinctTags = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => {
      (c.tags || []).forEach(t => set.add(t.trim()));
    });
    return Array.from(set);
  }, [customers]);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_wa: '',
    address: '',
    source: 'WhatsApp' as CustomerSource,
    birthdate: '',
    favorite_size: 'M',
    favorite_color: '',
    preferred_style: '',
    budget_range: '',
    notes: '',
    tagsString: '',
  });
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Check duplicate WA dynamically as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, phone_wa: val }));

    if (val.length >= 8) {
      const dup = checkDuplicateCustomerPhone(val);
      if (dup) {
        setDuplicateWarning(`Nomor WhatsApp ini sudah terdaftar atas nama "${dup.name}"!`);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone_wa) return;

    const tags = formData.tagsString
      ? formData.tagsString.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    await addCustomer({
      name: formData.name,
      phone_wa: formData.phone_wa,
      address: formData.address,
      source: formData.source,
      birthdate: formData.birthdate || undefined,
      favorite_size: formData.favorite_size || undefined,
      favorite_color: formData.favorite_color || undefined,
      preferred_style: formData.preferred_style || undefined,
      budget_range: formData.budget_range || undefined,
      notes: formData.notes,
      tags,
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      phone_wa: '',
      address: '',
      source: 'WhatsApp',
      birthdate: '',
      favorite_size: 'M',
      favorite_color: '',
      preferred_style: '',
      budget_range: '',
      notes: '',
      tagsString: '',
    });
    setDuplicateWarning(null);
  };

  // Filtered and Sorted List
  const filteredCustomers = useMemo(() => {
    const filtered = customers.filter(c => {
      // Search
      const q = search.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.phone_wa.includes(q) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        c.tags.some(t => t.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (stageFilter !== 'all' && c.stage !== stageFilter) return false;
      if (sourceFilter !== 'all' && c.source !== sourceFilter) return false;
      if (sizeFilter !== 'all' && c.favorite_size !== sizeFilter) return false;
      if (colorFilter !== 'all' && c.favorite_color?.toLowerCase() !== colorFilter.toLowerCase()) return false;
      if (tagFilter !== 'all' && !c.tags.includes(tagFilter)) return false;

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'spend-desc') return b.total_spend - a.total_spend;
      if (sortBy === 'orders-desc') return b.order_count - a.order_count;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [customers, search, stageFilter, sourceFilter, sizeFilter, colorFilter, tagFilter, sortBy]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const getStageBadgeVariant = (stage: CustomerStage) => {
    switch (stage) {
      case 'Setia':
        return 'purple';
      case 'Aktif':
        return 'success';
      case 'Tidur':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-ivory-100">
            Daftar Pelanggan CRM
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau preferensi ukuran, warna, dan tahap hubungan setiap pelanggan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/import-export">
            <Button variant="outline" size="sm">
              Impor / Ekspor CSV
            </Button>
          </Link>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
          >
            Tambah Pelanggan
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Cari nama, WhatsApp, label..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
          >
            <option value="all">Semua Tahap</option>
            <option value="Baru">Baru (Belum Beli)</option>
            <option value="Aktif">Aktif (&le; {currentStore?.active_threshold_days || 60} hari)</option>
            <option value="Setia">Setia (&ge; {currentStore?.loyal_threshold_orders || 3} pesanan)</option>
            <option value="Tidur">Tidur (&gt; {currentStore?.sleeping_threshold_days || 60} hari)</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
          >
            <option value="all">Semua Sumber</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="Shopee">Shopee</option>
            <option value="Tokopedia">Tokopedia</option>
            <option value="Toko Langsung">Toko Langsung</option>
            <option value="Lainnya">Lainnya</option>
          </select>

          {/* Size Filter */}
          <select
            value={sizeFilter}
            onChange={e => { setSizeFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
          >
            <option value="all">Semua Ukuran Favorit</option>
            <option value="S">Ukuran S</option>
            <option value="M">Ukuran M</option>
            <option value="L">Ukuran L</option>
            <option value="XL">Ukuran XL</option>
            <option value="All Size">All Size</option>
          </select>

          {/* Color Filter */}
          <select
            value={colorFilter}
            onChange={e => { setColorFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
          >
            <option value="all">Semua Warna Favorit</option>
            {distinctColors.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={tagFilter}
            onChange={e => { setTagFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
          >
            <option value="all">Semua Label / Tag</option>
            {distinctTags.map(t => (
              <option key={t} value={t}>#{t}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100 font-semibold"
          >
            <option value="recent">Urutkan: Paling Baru</option>
            <option value="name-asc">Urutkan: Nama (A - Z)</option>
            <option value="spend-desc">Urutkan: Total Belanja Tertinggi</option>
            <option value="orders-desc">Urutkan: Jumlah Pesanan Terbanyak</option>
          </select>
        </div>
      </Card>

      {/* Customer Table */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" strokeWidth={1.5} />}
          title="Belum ada pelanggan ditemukan"
          description="Coba ubah kata kunci pencarian atau tambah pelanggan baru ke tokomu."
          actionText="Tambah Pelanggan Pertama"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-navy-800/60 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200 dark:border-navy-800">
                <tr>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Tahap</th>
                  <th className="px-6 py-4">Preferensi Busana</th>
                  <th className="px-6 py-4 text-center">Pesanan</th>
                  <th className="px-6 py-4 text-right">Total Belanja</th>
                  <th className="px-6 py-4 text-center">Beli Terakhir</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {paginatedCustomers.map(customer => {
                  const normalizedWA = normalizeWhatsAppNumber(customer.phone_wa);

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-navy-900 dark:text-ivory-100">
                          {customer.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {customer.phone_wa}
                        </div>
                        {customer.tags && customer.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {customer.tags.map(t => (
                              <span
                                key={t}
                                className="text-[10px] bg-slate-100 dark:bg-navy-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant={getStageBadgeVariant(customer.stage)}>
                          {customer.stage}
                        </Badge>
                        <span className="block text-[11px] text-slate-400 mt-1">
                          via {customer.source}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs space-y-0.5">
                          <p>
                            <span className="text-slate-400">Ukuran:</span>{' '}
                            <span className="font-semibold">{customer.favorite_size || '-'}</span>
                          </p>
                          <p>
                            <span className="text-slate-400">Warna:</span>{' '}
                            <span>{customer.favorite_color || '-'}</span>
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center font-medium">
                        {customer.order_count} kali
                      </td>

                      <td className="px-6 py-4 text-right font-bold text-navy-900 dark:text-ivory-100">
                        {formatRupiah(customer.total_spend)}
                      </td>

                      <td className="px-6 py-4 text-center text-xs text-slate-500">
                        {formatShortDate(customer.last_purchase_date)}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <a
                          href={`https://wa.me/${normalizedWA}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                          title="Chat WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                        </a>
                        <Link
                          href={`/customers/${customer.id}`}
                          className="inline-flex p-1.5 rounded-lg text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-ivory-100 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
                          title="Lihat Detail Profil"
                        >
                          <Eye className="w-4 h-4" strokeWidth={1.5} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Menampilkan {Math.min((currentPage - 1) * pageSize + 1, filteredCustomers.length)} -{' '}
              {Math.min(currentPage * pageSize, filteredCustomers.length)} dari {filteredCustomers.length} pelanggan
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Sebelumnya
              </Button>
              <span className="font-semibold px-2">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal with Duplicate Detection */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Pelanggan Baru"
        description="Catat preferensi pelanggan agar mudah menawarkan produk yang cocok di kemudian hari."
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <Input
            label="Nama Lengkap Pelanggan"
            required
            placeholder="Contoh: Rania Putri"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />

          <div>
            <Input
              label="Nomor WhatsApp"
              required
              placeholder="Contoh: 081234567890"
              value={formData.phone_wa}
              onChange={handlePhoneChange}
            />
            {duplicateWarning && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-1.5 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900/60">
                <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                <span>{duplicateWarning}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                Sumber Pelanggan
              </label>
              <select
                value={formData.source}
                onChange={e => setFormData({ ...formData, source: e.target.value as CustomerSource })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Shopee">Shopee</option>
                <option value="Tokopedia">Tokopedia</option>
                <option value="Toko Langsung">Toko Langsung</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                Ukuran Favorit
              </label>
              <select
                value={formData.favorite_size}
                onChange={e => setFormData({ ...formData, favorite_size: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="All Size">All Size</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Warna Favorit"
              placeholder="Misal: Sage Green, Terracotta"
              value={formData.favorite_color}
              onChange={e => setFormData({ ...formData, favorite_color: e.target.value })}
            />
            <Input
              label="Tanggal Lahir"
              type="date"
              value={formData.birthdate}
              onChange={e => setFormData({ ...formData, birthdate: e.target.value })}
            />
          </div>

          <Input
            label="Alamat Pengiriman"
            placeholder="Jalan, nomor rumah, kecamatan, kota..."
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />

          <Input
            label="Label / Tag (Pisahkan dengan koma)"
            placeholder="VIP, Hijab, Office Look, Loyal"
            value={formData.tagsString}
            onChange={e => setFormData({ ...formData, tagsString: e.target.value })}
          />

          <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="secondary">
              Simpan Pelanggan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
