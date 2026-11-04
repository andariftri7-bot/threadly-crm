'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store-context';
import { formatRupiah, formatDateWIB, formatShortDate, normalizeWhatsAppNumber } from '@/lib/utils';
import { defaultLLMProvider } from '@/lib/llm/provider';
import { Card, Button, Badge, Modal } from '@/components/ui';
import {
  ArrowLeft,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  Trash2,
  Download,
  Calendar,
  Tag,
  CreditCard,
  Heart,
} from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const { customers, orders, updateCustomer, deleteCustomer, logAiRun } = useStore();

  const customer = customers.find(c => c.id === customerId);
  const customerOrders = orders.filter(o => o.customer_id === customerId);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(customer?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  if (!customer) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-card-foreground">
          Pelanggan Tidak Ditemukan
        </h3>
        <p className="text-sm text-muted-foreground">
          Data pelanggan mungkin telah dihapus atau berada pada toko lain.
        </p>
        <Link href="/customers">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />}>
            Kembali ke Daftar Pelanggan
          </Button>
        </Link>
      </div>
    );
  }

  const handleGenerateAiSummary = async () => {
    setIsGeneratingAi(true);
    const res = await defaultLLMProvider.summarizeCustomer(customer.name, {
      totalSpend: customer.total_spend,
      orderCount: customer.order_count,
      stage: customer.stage,
      favoriteSize: customer.favorite_size,
      favoriteColor: customer.favorite_color,
      preferredStyle: customer.preferred_style,
    });
    setAiSummary(res.data || '');
    setIsGeneratingAi(false);

    logAiRun({
      feature_type: 'customer_summary',
      prompt_tokens: 45,
      completion_tokens: 30,
      total_tokens: 75,
      latency_ms: res.latencyMs || 25,
      status: 'success',
    });
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await updateCustomer(customer.id, { notes: editingNotes });
    setIsSavingNotes(false);
  };

  const handleDelete = async () => {
    await deleteCustomer(customer.id);
    router.push('/customers');
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(customer, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `customer_${customer.name.replace(/\s+/g, '_')}_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header with Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/customers">
            <button className="p-2 rounded-xl border border-border hover:bg-slate-100 dark:hover:bg-navy-800 transition">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-card-foreground">
                {customer.name}
              </h2>
              <Badge
                variant={
                  customer.stage === 'Setia'
                    ? 'purple'
                    : customer.stage === 'Aktif'
                    ? 'success'
                    : customer.stage === 'Tidur'
                    ? 'warning'
                    : 'info'
                }
              >
                {customer.stage}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bergabung sejak {formatShortDate(customer.created_at)} &bull; Sumber: {customer.source}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${normalizeWhatsAppNumber(customer.phone_wa)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            <span>Chat WhatsApp</span>
          </a>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            title="Ekspor Data Pribadi Pelanggan"
            leftIcon={<Download className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Ekspor Data
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            title="Hapus Data Pelanggan"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* 4 Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Total Belanja</p>
          <p className="text-xl font-bold text-card-foreground mt-1">
            {formatRupiah(customer.total_spend)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Jumlah Transaksi</p>
          <p className="text-xl font-bold text-card-foreground mt-1">
            {customer.order_count} pesanan
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Rata-rata Nilai Pesanan</p>
          <p className="text-xl font-bold text-card-foreground mt-1">
            {formatRupiah(customer.average_order_value)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase">Pembelian Terakhir</p>
          <p className="text-sm font-semibold text-card-foreground mt-1.5">
            {customer.last_purchase_date ? formatDateWIB(customer.last_purchase_date) : 'Belum pernah beli'}
          </p>
        </Card>
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Fashion Profile & Notes */}
        <div className="space-y-6">
          {/* Fashion Preferences */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-card-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" strokeWidth={1.5} />
              <span>Preferensi Busana & Gaya</span>
            </h3>

            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Ukuran Favorit:</span>
                <span className="font-bold text-card-foreground">{customer.favorite_size || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Warna Favorit:</span>
                <span className="font-semibold text-card-foreground">{customer.favorite_color || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Gaya Berpakaian:</span>
                <span className="font-semibold text-card-foreground">{customer.preferred_style || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Kisaran Budget:</span>
                <span>{customer.budget_range || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Tanggal Lahir:</span>
                <span>{customer.birthdate ? formatShortDate(customer.birthdate) : '-'}</span>
              </div>
              <div className="py-1">
                <span className="text-muted-foreground block mb-1">Alamat Pengiriman:</span>
                <p className="font-medium text-card-foreground">
                  {customer.address || 'Belum ada alamat tersimpan'}
                </p>
              </div>
            </div>
          </Card>

          {/* AI Customer Summary Card */}
          <Card className="bg-gradient-to-br from-violet-500/5 to-navy-900/5 border-violet-200 dark:border-violet-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
                <h4 className="text-sm font-bold text-card-foreground">
                  Ringkasan AI Pelanggan
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateAiSummary}
                isLoading={isGeneratingAi}
                className="text-xs text-violet-600 dark:text-violet-400 p-1 h-auto"
              >
                {aiSummary ? 'Segarkan AI' : 'Buat Ringkasan'}
              </Button>
            </div>

            {aiSummary ? (
              <p className="text-xs text-card-foreground bg-white/60 dark:bg-navy-900/60 p-3 rounded-xl border border-violet-100 dark:border-violet-900/30 leading-relaxed">
                {aiSummary}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Klik tombol di atas untuk menganalisis kebiasaan belanja dan profil busana pelanggan dengan AI.
              </p>
            )}
          </Card>

          {/* Internal CRM Notes */}
          <Card className="space-y-3">
            <h4 className="text-sm font-bold text-card-foreground">
              Catatan Khusus Pelanggan
            </h4>
            <textarea
              rows={4}
              value={editingNotes}
              onChange={e => setEditingNotes(e.target.value)}
              placeholder="Tuliskan catatan preferensi khusus, riwayat komplain, atau kebiasaan pelanggan..."
              className="w-full p-3 text-xs rounded-xl border border-border bg-muted/60 text-card-foreground focus:bg-white"
            />
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveNotes}
                isLoading={isSavingNotes}
              >
                Simpan Catatan
              </Button>
            </div>
          </Card>
        </div>

        {/* Right 2 Columns: Order History */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-card-foreground flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
              <span>Riwayat Transaksi Pesanan ({customerOrders.length})</span>
            </h3>
            <Link href="/orders/new">
              <Button variant="secondary" size="sm">
                Buat Pesanan Baru
              </Button>
            </Link>
          </div>

          {customerOrders.length === 0 ? (
            <Card className="text-center py-12 text-muted-foreground text-sm">
              Pelanggan ini belum pernah melakukan pemesanan.
            </Card>
          ) : (
            <div className="space-y-3">
              {customerOrders.map(order => (
                <Card key={order.id} className="p-4 hover:border-violet-200 dark:hover:border-violet-800 transition">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-card-foreground">
                          #{order.order_number}
                        </span>
                        <Badge
                          variant={
                            order.status === 'Selesai'
                              ? 'success'
                              : order.status === 'Batal'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatDateWIB(order.created_at)} &bull; {order.payment_method}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-card-foreground">
                        {formatRupiah(order.total_amount)}
                      </p>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
                      >
                        Detail & Invoice
                      </Link>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="text-xs text-slate-600 dark:text-muted-foreground space-y-1">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.product_name} ({item.variant_name}) &times; {item.quantity}
                        </span>
                        <span>{formatRupiah(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Data Pelanggan"
        description="Pelanggan ini meminta penghapusan data pribadi (sesuai Kebijakan Privasi). Tindakan ini tidak dapat dibatalkan."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600 dark:text-muted-foreground">
            Seluruh data profil, preferensi busana, dan label untuk <strong>{customer.name}</strong> akan dihapus permanen. Riwayat transaksi pembukuan tetap disimpan tanpa identitas pribadi.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Ya, Hapus Permanen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
