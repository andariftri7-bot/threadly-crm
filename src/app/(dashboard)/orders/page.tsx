'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store-context';
import { OrderStatus } from '@/types';
import { formatRupiah, formatDateWIB } from '@/lib/utils';
import { Card, Button, Badge, EmptyState } from '@/components/ui';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  Ban,
  PackageCheck,
} from 'lucide-react';

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = search.toLowerCase();
      const matchSearch =
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        (o.tracking_number && o.tracking_number.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      return true;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Selesai':
        return <Badge variant="success">Selesai</Badge>;
      case 'Lunas':
        return <Badge variant="purple">Lunas</Badge>;
      case 'Dikirim':
        return <Badge variant="info">Dikirim</Badge>;
      case 'Dikemas':
        return <Badge variant="default">Dikemas</Badge>;
      case 'DP':
        return <Badge variant="warning">DP</Badge>;
      case 'Menunggu Pembayaran':
        return <Badge variant="warning">Menunggu Pembayaran</Badge>;
      case 'Batal':
        return <Badge variant="danger">Batal</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">
            Daftar Pesanan Toko
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Konfirmasi pesanan otomatis memotong stok varian dan memperbarui tahap loyalitas pelanggan.
          </p>
        </div>

        <Link href="/orders/new">
          <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" strokeWidth={1.5} />}>
            Buat Pesanan Baru
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Cari no. pesanan, nama pelanggan, no. resi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border bg-card text-card-foreground"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card text-card-foreground"
          >
            <option value="all">Semua Status Pesanan</option>
            <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
            <option value="DP">DP</option>
            <option value="Lunas">Lunas</option>
            <option value="Dikemas">Dikemas</option>
            <option value="Dikirim">Dikirim</option>
            <option value="Selesai">Selesai</option>
            <option value="Batal">Batal</option>
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8" strokeWidth={1.5} />}
          title="Tidak ada pesanan ditemukan"
          description="Pesanan dari pelanggan atau etalase publik akan muncul di sini."
          actionText="Buat Pesanan Manual"
          onAction={() => {}}
        />
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-card-foreground">
              <thead className="bg-muted/60/60 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4">No. Pesanan</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Item Busana</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Ubah Status Cepat</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-card-foreground">
                        #{order.order_number}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatDateWIB(order.created_at)}
                      </div>
                      <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">
                        {order.source === 'public_storefront' ? 'Etalase Bio' : 'Manual'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-card-foreground">
                        {order.customer_name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {order.customer_phone}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs space-y-0.5 max-w-xs">
                        {order.items?.map(item => (
                          <p key={item.id} className="truncate">
                            &bull; {item.product_name} ({item.variant_name}) &times; {item.quantity}
                          </p>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-card-foreground">
                      {formatRupiah(order.total_amount)}
                      <div className="text-[10px] text-muted-foreground font-normal">
                        {order.payment_method}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                      {order.tracking_number && (
                        <span className="block text-[11px] text-muted-foreground font-mono mt-1">
                          Resi: {order.tracking_number}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card font-medium"
                      >
                        <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                        <option value="DP">DP</option>
                        <option value="Lunas">Lunas</option>
                        <option value="Dikemas">Dikemas</option>
                        <option value="Dikirim">Dikirim</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Batal">Batal</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex p-1.5 rounded-lg text-slate-600 hover:text-navy-900 dark:text-muted-foreground dark:hover:text-ivory-100 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
                        title="Lihat Detail & Invoice"
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
