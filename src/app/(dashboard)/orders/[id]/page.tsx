'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store-context';
import { OrderStatus } from '@/types';
import { formatRupiah, formatDateWIB, normalizeWhatsAppNumber } from '@/lib/utils';
import { generateOrderInvoicePDF } from '@/lib/invoice-generator';
import { Card, Button, Badge, Input, Modal, useToast } from '@/components/ui';
import {
  ArrowLeft,
  Download,
  MessageCircle,
  Truck,
  CheckCircle,
  Ban,
  Receipt,
  User,
  MapPin,
  Save,
  Edit2,
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { orders, currentStore, updateOrderStatus, updateOrder } = useStore();
  const { showToast } = useToast();

  const order = orders.find(o => o.id === orderId);

  const [currentTracking, setCurrentTracking] = useState(order?.tracking_number || '');
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);

  // Edit order modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editShipping, setEditShipping] = useState(order?.shipping_cost || 0);
  const [editDiscount, setEditDiscount] = useState(order?.discount || 0);
  const [editPayment, setEditPayment] = useState(order?.payment_method || 'Transfer Bank BCA');
  const [editNotes, setEditNotes] = useState(order?.notes || '');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  if (!order || !currentStore) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-navy-900 dark:text-ivory-100">
          Pesanan Tidak Ditemukan
        </h3>
        <p className="text-sm text-slate-500">
          Pesanan ini mungkin telah dihapus atau berada pada toko lain.
        </p>
        <Link href="/orders">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />}>
            Kembali ke Daftar Pesanan
          </Button>
        </Link>
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    const doc = generateOrderInvoicePDF(order, currentStore);
    doc.save(`Invoice_${order.order_number}_Threadly.pdf`);
    showToast('Faktur PDF pesanan berhasil diunduh', 'success');
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setChangingStatus(newStatus);
    try {
      await updateOrderStatus(order.id, newStatus);
      showToast(`Status pesanan #${order.order_number} berhasil diubah ke ${newStatus}`, 'success');
    } catch (err: any) {
      showToast(`Gagal mengubah status: ${err.message}`, 'error');
    } finally {
      setChangingStatus(null);
    }
  };

  const handleSaveTracking = async () => {
    setIsUpdatingTracking(true);
    try {
      await updateOrder(order.id, { tracking_number: currentTracking });
      showToast('Nomor resi pengiriman berhasil disimpan', 'success');
    } catch (err: any) {
      showToast(`Gagal menyimpan resi: ${err.message}`, 'error');
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const handleSaveOrderEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEdit(true);
    try {
      const subtotal = order.subtotal;
      const shipping = Number(editShipping);
      const discount = Number(editDiscount);
      const total = Math.max(0, subtotal + shipping - discount);

      await updateOrder(order.id, {
        shipping_cost: shipping,
        discount,
        total_amount: total,
        payment_method: editPayment,
        notes: editNotes,
      });
      showToast('Perubahan pesanan berhasil disimpan', 'success');
      setIsEditModalOpen(false);
    } catch (err: any) {
      showToast(`Gagal memperbarui pesanan: ${err.message}`, 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <button className="p-2 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 transition">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" strokeWidth={1.5} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-navy-900 dark:text-ivory-100">
                Pesanan #{order.order_number}
              </h2>
              <Badge
                variant={
                  order.status === 'Selesai'
                    ? 'success'
                    : order.status === 'Lunas'
                    ? 'purple'
                    : order.status === 'Batal'
                    ? 'danger'
                    : 'warning'
                }
              >
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dibuat pada {formatDateWIB(order.created_at)} &bull; Sumber: {order.source}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="w-4 h-4" strokeWidth={1.5} />}
          >
            Ubah Pesanan
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadInvoice}
            leftIcon={<Download className="w-4 h-4" strokeWidth={1.5} />}
          >
            Unduh Faktur PDF
          </Button>

          <a
            href={`https://wa.me/${normalizeWhatsAppNumber(order.customer_phone)}?text=${encodeURIComponent(
              `Halo ${order.customer_name}, kami dari ${currentStore.name} mengonfirmasi pesanan #${order.order_number}. Total: ${formatRupiah(order.total_amount)}.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            <span>Kirim Info WA</span>
          </a>
        </div>
      </div>

      {/* Status Workflow Action Bar */}
      <Card className="p-4 bg-slate-50 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ubah Status Alur Transaksi
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Perubahan status otomatis memperbarui stok varian dan kalkulasi tahap pelanggan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                'Menunggu Pembayaran',
                'DP',
                'Lunas',
                'Dikemas',
                'Dikirim',
                'Selesai',
                'Batal',
              ] as OrderStatus[]
            ).map(st => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  order.status === st
                    ? 'bg-navy-900 text-white dark:bg-violet-600 shadow-sm'
                    : 'bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items & Pricing Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-navy-900 dark:text-ivory-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
              <span>Rincian Varian Busana</span>
            </h3>

            <div className="divide-y divide-slate-100 dark:divide-navy-800">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-sm text-navy-900 dark:text-ivory-100">
                      {item.product_name}
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      Varian: {item.variant_name} &bull; {formatRupiah(item.price)} &times; {item.quantity} pcs
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-navy-900 dark:text-ivory-100">
                      {formatRupiah(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-slate-100 dark:border-navy-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-semibold text-navy-900 dark:text-ivory-100">
                  {formatRupiah(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Ongkos Kirim:</span>
                <span className="font-semibold text-navy-900 dark:text-ivory-100">
                  {formatRupiah(order.shipping_cost)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-violet-600 dark:text-violet-400">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-navy-900 dark:text-ivory-100 pt-2 border-t border-slate-200 dark:border-navy-700">
                <span>TOTAL:</span>
                <span className="text-violet-600 dark:text-violet-400">
                  {formatRupiah(order.total_amount)}
                </span>
              </div>
            </div>
          </Card>

          {/* Delivery Tracking / Resi Card */}
          <Card className="space-y-3">
            <h3 className="text-base font-bold text-navy-900 dark:text-ivory-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-500" strokeWidth={1.5} />
              <span>Nomor Resi & Ekspedisi Pengiriman</span>
            </h3>

            <div className="flex gap-2">
              <Input
                placeholder="Contoh: JNE / J&T / SPXID123456789"
                value={currentTracking}
                onChange={e => setCurrentTracking(e.target.value)}
              />
              <Button
                variant="primary"
                onClick={handleSaveTracking}
                isLoading={isUpdatingTracking}
                leftIcon={<Save className="w-4 h-4" strokeWidth={1.5} />}
              >
                Simpan
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Col: Customer & Payment Details */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-navy-900 dark:text-ivory-100 flex items-center gap-2">
              <User className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
              <span>Tujuan Pengiriman</span>
            </h3>

            <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block">Nama Penerima:</span>
                <p className="font-bold text-sm text-navy-900 dark:text-ivory-100">
                  {order.customer_name}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block">WhatsApp:</span>
                <p className="font-mono">{order.customer_phone}</p>
              </div>

              <div>
                <span className="text-slate-400 block">Alamat Lengkap:</span>
                <p className="leading-relaxed">
                  {order.customer_address || 'Tidak ada catatan alamat (ambil di toko)'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-navy-800">
                <Link
                  href={`/customers/${order.customer_id}`}
                  className="text-xs text-violet-600 dark:text-violet-400 font-semibold hover:underline block"
                >
                  &rarr; Buka Profil CRM Lengkap
                </Link>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <h4 className="text-sm font-bold text-navy-900 dark:text-ivory-100">
              Metode Pembayaran
            </h4>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {order.payment_method}
            </p>
            {order.notes && (
              <div className="pt-2 border-t border-slate-100 dark:border-navy-800">
                <span className="text-slate-400 text-xs block mb-1">Catatan Pesanan:</span>
                <p className="text-xs bg-slate-50 dark:bg-navy-800 p-2.5 rounded-xl text-slate-600 dark:text-slate-300 italic">
                  &ldquo;{order.notes}&rdquo;
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Order Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Ubah Pesanan #${order.order_number}`}
      >
        <form onSubmit={handleSaveOrderEdit} className="space-y-4">
          <Input
            label="Ongkos Kirim (Rp)"
            type="number"
            value={editShipping}
            onChange={e => setEditShipping(Number(e.target.value))}
          />

          <Input
            label="Diskon (Rp)"
            type="number"
            value={editDiscount}
            onChange={e => setEditDiscount(Number(e.target.value))}
          />

          <div>
            <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1">
              Metode Pembayaran
            </label>
            <select
              value={editPayment}
              onChange={e => setEditPayment(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
            >
              <option value="Transfer Bank BCA">Transfer Bank BCA</option>
              <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
              <option value="Transfer Bank BRI">Transfer Bank BRI</option>
              <option value="QRIS / E-Wallet">QRIS / E-Wallet</option>
              <option value="COD / Tunai Langsung">COD / Tunai Langsung</option>
              <option value="Konfirmasi via WhatsApp">Konfirmasi via WhatsApp</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1">
              Catatan Khusus Pesanan
            </label>
            <textarea
              rows={2}
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              placeholder="Catatan pengiriman, request kado, dll..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isSavingEdit}
              leftIcon={<Save className="w-4 h-4" strokeWidth={1.5} />}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
