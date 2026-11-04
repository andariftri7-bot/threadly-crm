'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store-context';
import { OrderStatus, Product, ProductVariant } from '@/types';
import { formatRupiah } from '@/lib/utils';
import { Card, Button, Input, Badge, useToast } from '@/components/ui';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Receipt,
  UserCheck,
  UserPlus,
} from 'lucide-react';

interface OrderItemDraft {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  subtotal: number;
  availableStock: number;
}

export default function NewOrderPage() {
  const router = useRouter();
  const { customers, products, createOrder } = useStore();
  const { showToast } = useToast();

  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // New customer inline inputs
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Items in order
  const [items, setItems] = useState<OrderItemDraft[]>([]);

  // Item selector state
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [itemQty, setItemQty] = useState<number>(1);

  // Sync initial selection when products or customers load
  React.useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  React.useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // Financial inputs
  const [shippingCost, setShippingCost] = useState<number>(15000);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Transfer Bank BCA');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Menunggu Pembayaran');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active product variants
  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeVariants = activeProduct?.variants || [];

  const handleAddItem = () => {
    if (!activeProduct) {
      showToast('Pilih produk busana terlebih dahulu', 'warning');
      return;
    }
    const targetVariant =
      activeVariants.find(v => v.id === selectedVariantId) || activeVariants[0];
    if (!targetVariant) {
      showToast('Varian produk tidak ditemukan', 'warning');
      return;
    }

    if (targetVariant.stock <= 0) {
      showToast(`Stok varian ${targetVariant.size} (${targetVariant.color}) sedang kosong!`, 'warning');
    }

    const subtotal = activeProduct.price * itemQty;
    const newItem: OrderItemDraft = {
      productId: activeProduct.id,
      variantId: targetVariant.id,
      productName: activeProduct.name,
      variantName: `${targetVariant.size} / ${targetVariant.color}`,
      price: activeProduct.price,
      quantity: itemQty,
      subtotal,
      availableStock: targetVariant.stock,
    };

    setItems(prev => [...prev, newItem]);
    setItemQty(1);
    showToast(`Ditambahkan: ${activeProduct.name} (${newItem.variantName})`, 'info');
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const itemsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const grandTotal = Math.max(0, itemsSubtotal + Number(shippingCost) - Number(discount));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast('Pilih minimal satu varian busana untuk pesanan', 'error');
      return;
    }

    if (customerMode === 'new') {
      if (!newCustName.trim()) {
        showToast('Nama pelanggan baru wajib diisi', 'error');
        return;
      }
      if (!newCustPhone.trim()) {
        showToast('Nomor WhatsApp pelanggan baru wajib diisi', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let custId: string | undefined = undefined;
      let custName = newCustName;
      let custPhone = newCustPhone;
      let custAddress = newCustAddress;

      if (customerMode === 'existing') {
        const found = customers.find(c => c.id === selectedCustomerId);
        if (found) {
          custId = found.id;
          custName = found.name;
          custPhone = found.phone_wa;
          custAddress = found.address || '';
        }
      }

      const created = await createOrder(
        {
          customer_id: custId,
          customer_name: custName,
          customer_phone: custPhone,
          customer_address: custAddress,
          status: orderStatus,
          shipping_cost: Number(shippingCost),
          discount: Number(discount),
          payment_method: paymentMethod,
          notes,
          source: 'manual',
        },
        items.map(it => ({
          product_id: it.productId,
          variant_id: it.variantId,
          product_name: it.productName,
          variant_name: it.variantName,
          price: it.price,
          quantity: it.quantity,
          subtotal: it.subtotal,
        }))
      );

      showToast(`Pesanan #${created.order_number} berhasil dibuat!`, 'success');
      router.push(`/orders/${created.id}`);
    } catch (err: any) {
      showToast(`Gagal membuat pesanan: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link href="/orders">
          <button className="p-2 rounded-xl border border-slate-200 dark:border-navy-700 hover:bg-slate-100 dark:hover:bg-navy-800 transition">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" strokeWidth={1.5} />
          </button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-navy-900 dark:text-ivory-100">
            Buat Pesanan Baru
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Catat pesanan dari WhatsApp, Instagram DM, atau pembelian langsung.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection Card */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-navy-900 dark:text-ivory-100">
            1. Informasi Pelanggan
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCustomerMode('existing')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                customerMode === 'existing'
                  ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-500 text-violet-700 dark:text-violet-300'
                  : 'border-slate-200 dark:border-navy-700 text-slate-500'
              }`}
            >
              <UserCheck className="w-4 h-4" strokeWidth={1.5} />
              <span>Pilih Pelanggan Terdaftar</span>
            </button>
            <button
              type="button"
              onClick={() => setCustomerMode('new')}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                customerMode === 'new'
                  ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-500 text-violet-700 dark:text-violet-300'
                  : 'border-slate-200 dark:border-navy-700 text-slate-500'
              }`}
            >
              <UserPlus className="w-4 h-4" strokeWidth={1.5} />
              <span>Pelanggan Baru Cepat</span>
            </button>
          </div>

          {customerMode === 'existing' ? (
            <div>
              <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                Pilih Dari Data Pelanggan CRM
              </label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} &bull; {c.phone_wa} &bull; {c.stage} (Size: {c.favorite_size || '-'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nama Pelanggan"
                required
                placeholder="Misal: Gita Gutawa"
                value={newCustName}
                onChange={e => setNewCustName(e.target.value)}
              />
              <Input
                label="Nomor WhatsApp"
                required
                placeholder="Misal: 081299887766"
                value={newCustPhone}
                onChange={e => setNewCustPhone(e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Alamat Pengiriman"
                  placeholder="Jalan, nomor, RT/RW, kelurahan, kota..."
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Product Variant Picker Card */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-navy-900 dark:text-ivory-100">
            2. Tambah Varian Busana
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                Koleksi Produk
              </label>
              <select
                value={selectedProductId}
                onChange={e => {
                  setSelectedProductId(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p?.variants && p.variants.length > 0) {
                    setSelectedVariantId(p.variants[0].id);
                  }
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatRupiah(p.price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                Varian Ukuran & Warna
              </label>
              <select
                value={selectedVariantId}
                onChange={e => setSelectedVariantId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900"
              >
                {activeVariants.map(v => (
                  <option key={v.id} value={v.id}>
                    Size {v.size} / {v.color} (Stok: {v.stock} pcs)
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                Jumlah
              </label>
              <input
                type="number"
                min={1}
                value={itemQty}
                onChange={e => setItemQty(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900"
              />
            </div>

            <div className="sm:col-span-1">
              <Button type="button" variant="secondary" onClick={handleAddItem} className="w-full">
                <Plus className="w-4 h-4" strokeWidth={1.5} />
              </Button>
            </div>
          </div>

          {/* Added items list */}
          <div className="border border-slate-100 dark:border-navy-800 rounded-xl overflow-hidden mt-4">
            {items.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">
                Belum ada item ditambahkan ke keranjang pesanan.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-navy-900 dark:text-ivory-100">
                        {item.productName}
                      </p>
                      <p className="text-slate-500">
                        {item.variantName} &bull; {formatRupiah(item.price)} &times; {item.quantity} pcs
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-navy-900 dark:text-ivory-100">
                        {formatRupiah(item.subtotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Pricing, Shipping & Payment Card */}
        <Card className="space-y-4">
          <h3 className="text-base font-bold text-navy-900 dark:text-ivory-100">
            3. Pengiriman, Pembayaran & Total
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Ongkos Kirim (Rp)"
              type="number"
              value={shippingCost}
              onChange={e => setShippingCost(Number(e.target.value))}
            />
            <Input
              label="Potongan Diskon (Rp)"
              type="number"
              value={discount}
              onChange={e => setDiscount(Number(e.target.value))}
            />
            <div>
              <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900"
              >
                <option value="Transfer Bank BCA">Transfer Bank BCA</option>
                <option value="Transfer Bank Mandiri">Transfer Bank Mandiri</option>
                <option value="QRIS / GoPay / OVO">QRIS / E-Wallet</option>
                <option value="COD / Bayar di Tempat">COD (Bayar di Tempat)</option>
                <option value="Tunai Toko Langsung">Tunai Toko Langsung</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                Status Pesanan Awal
              </label>
              <select
                value={orderStatus}
                onChange={e => setOrderStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900"
              >
                <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                <option value="DP">DP (Uang Muka)</option>
                <option value="Lunas">Lunas</option>
                <option value="Dikemas">Dikemas</option>
                <option value="Dikirim">Dikirim</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <Input
              label="Catatan Pesanan (Opsional)"
              placeholder="Catatan packaging, request kartu ucapan..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Grand total calculation block */}
          <div className="bg-slate-50 dark:bg-navy-800/60 p-4 rounded-xl border border-slate-100 dark:border-navy-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal Produk:</span>
              <span className="font-semibold text-navy-900 dark:text-ivory-100">
                {formatRupiah(itemsSubtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Ongkos Kirim:</span>
              <span className="font-semibold text-navy-900 dark:text-ivory-100">
                {formatRupiah(shippingCost)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-violet-600 dark:text-violet-400">
                <span>Diskon:</span>
                <span>-{formatRupiah(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-navy-900 dark:text-ivory-100 pt-2 border-t border-slate-200 dark:border-navy-700">
              <span>TOTAL PEMBAYARAN:</span>
              <span className="text-violet-600 dark:text-violet-400">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/orders">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              variant="secondary"
              isLoading={isSubmitting}
              leftIcon={<Receipt className="w-4 h-4" strokeWidth={1.5} />}
            >
              Simpan Pesanan & Potong Stok
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
