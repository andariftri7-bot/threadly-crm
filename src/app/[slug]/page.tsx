'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useStore } from '@/lib/store-context';
import { formatRupiah, normalizeWhatsAppNumber } from '@/lib/utils';
import { Product, ProductVariant } from '@/types';
import { Card, Button, Input, Badge } from '@/components/ui';
import {
  ShoppingBag,
  Store,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export default function PublicStorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { allStores, getStoreProducts, createOrder } = useStore();

  const store = allStores.find(s => s.slug === slug);

  // Filter products for this specific store
  const storeProducts = useMemo(() => {
    if (!store) return [];
    return getStoreProducts(store.id);
  }, [store, getStoreProducts]);

  // Selected item for checkout
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [orderQty, setOrderQty] = useState<number>(1);

  // Buyer Form Inputs
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerNotes, setBuyerNotes] = useState('');

  // Anti-spam honeypot & Rate limiting
  const [honeypot, setHoneypot] = useState('');
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrderNumber, setSubmittedOrderNumber] = useState<string | null>(null);

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-ivory-100 text-center">
        <Card className="max-w-md w-full p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
            <Store className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-navy-900">Toko Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500">
            Alamat etalase toko <strong>/{slug}</strong> tidak terdaftar di Threadly.
          </p>
        </Card>
      </div>
    );
  }

  // Requirement: toko nonaktif tidak dapat masuk dan etalase publiknya tidak ditampilkan
  if (store.status === 'inactive') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-ivory-100 text-center">
        <Card className="max-w-md w-full p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-amber-600">
            <AlertCircle className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-navy-900">{store.name} Sedang Tutup</h2>
          <p className="text-sm text-slate-500">
            Etalase toko ini sedang tidak aktif sementara. Silakan hubungi penjual secara langsung.
          </p>
        </Card>
      </div>
    );
  }

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    if (product.variants && product.variants.length > 0) {
      // Find first variant with stock > 0
      const inStock = product.variants.find(v => v.stock > 0) || product.variants[0];
      setSelectedVariant(inStock);
    }
    setOrderQty(1);
    setErrorMessage(null);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Spam Honeypot Check
    if (honeypot.trim().length > 0) {
      console.warn('Bot detected by honeypot');
      return;
    }

    // 2. Rate Limiting Check (min 10 seconds between submissions)
    const now = Date.now();
    if (now - lastSubmitTime < 10000) {
      setErrorMessage('Mohon tunggu beberapa detik sebelum mengirim pesanan kembali.');
      return;
    }

    // 3. Validation
    if (!selectedProduct || !selectedVariant) {
      setErrorMessage('Pilih salah satu produk dan varian busana.');
      return;
    }
    if (selectedVariant.stock < orderQty) {
      setErrorMessage(`Stok untuk varian ${selectedVariant.size} (${selectedVariant.color}) tidak mencukupi.`);
      return;
    }
    if (buyerPhone.replace(/[^0-9]/g, '').length < 9) {
      setErrorMessage('Nomor WhatsApp tidak valid (minimal 9 digit).');
      return;
    }

    setIsSubmitting(true);
    setLastSubmitTime(now);

    try {
      const order = await createOrder(
        {
          customer_name: buyerName,
          customer_phone: buyerPhone,
          customer_address: buyerAddress,
          status: 'Menunggu Pembayaran',
          shipping_cost: 0,
          discount: 0,
          payment_method: 'Konfirmasi via WhatsApp',
          notes: buyerNotes,
          source: 'public_storefront',
        },
        [
          {
            product_id: selectedProduct.id,
            variant_id: selectedVariant.id,
            product_name: selectedProduct.name,
            variant_name: `${selectedVariant.size} / ${selectedVariant.color}`,
            price: selectedProduct.price,
            quantity: orderQty,
            subtotal: selectedProduct.price * orderQty,
          },
        ],
        store.id
      );

      setSubmittedOrderNumber(order.order_number);
    } catch (err: any) {
      setErrorMessage(`Gagal mengirim pesanan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 text-navy-900 pb-16">
      {/* Store Header Banner */}
      <header className="bg-navy-900 text-ivory-100 py-10 px-4 border-b border-navy-800">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-white text-navy-900 flex items-center justify-center font-extrabold text-2xl shadow-lg border border-slate-200">
            {store.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{store.name}</h1>
              <Badge variant="success">Katalog Resmi</Badge>
            </div>
            <p className="text-sm text-slate-300 max-w-xl">{store.description}</p>
            {store.address && (
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1 pt-1">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{store.address}</span>
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 mt-4">
        {submittedOrderNumber ? (
          /* Order Confirmation Screen */
          <Card className="max-w-lg mx-auto text-center p-8 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-navy-900">Pesanan Berhasil Dicatat!</h2>
            <p className="text-sm text-slate-600">
              Terima kasih <strong>{buyerName}</strong>, pesananmu nomor{' '}
              <strong className="text-violet-600">#{submittedOrderNumber}</strong> telah kami terima.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl text-xs text-left space-y-1.5 text-slate-600 border border-slate-200">
              <p>
                <strong>Produk:</strong> {selectedProduct?.name} ({selectedVariant?.size} /{' '}
                {selectedVariant?.color}) &times; {orderQty} pcs
              </p>
              <p>
                <strong>Total:</strong> {formatRupiah((selectedProduct?.price || 0) * orderQty)}
              </p>
              <p>
                <strong>Alamat:</strong> {buyerAddress}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Klik tombol di bawah untuk konfirmasi otomatis ke WhatsApp pemilik toko:
            </p>
            <a
              href={`https://wa.me/${normalizeWhatsAppNumber(store.phone_wa)}?text=${encodeURIComponent(
                `Halo ${store.name}, saya ${buyerName} sudah mengisi pesanan #${submittedOrderNumber} untuk ${selectedProduct?.name} (${selectedVariant?.size} / ${selectedVariant?.color}) seharga ${formatRupiah(
                  (selectedProduct?.price || 0) * orderQty
                )}. Mohon info no rekening pembayarannya ya kak.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
            >
              <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
              <span>Konfirmasi via WhatsApp Penjual</span>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSubmittedOrderNumber(null);
                setSelectedProduct(null);
                setSelectedVariant(null);
              }}
              className="text-xs"
            >
              Pesan Produk Lainnya
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Products Grid (7 Cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-navy-900">Pilih Koleksi Busana</h3>
                <span className="text-xs text-slate-500">{storeProducts.length} produk tersedia</span>
              </div>

              {storeProducts.length === 0 ? (
                <Card className="text-center py-12 text-slate-500 text-sm">
                  Belum ada koleksi produk yang aktif di etalase ini.
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {storeProducts.map(product => {
                    const isSelected = selectedProduct?.id === product.id;
                    const inStockTotal =
                      product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className={`cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200 bg-white ${
                          isSelected
                            ? 'border-violet-500 ring-2 ring-violet-500/20 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="relative h-44 w-full bg-slate-100">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-300">
                              <ShoppingBag className="w-10 h-10" strokeWidth={1.5} />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                inStockTotal > 0
                                  ? 'bg-white/90 text-navy-900 shadow-sm'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {inStockTotal > 0 ? `Ready (${inStockTotal})` : 'Habis'}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 space-y-1">
                          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                            {product.category}
                          </p>
                          <h4 className="font-bold text-sm text-navy-900 truncate">
                            {product.name}
                          </h4>
                          <p className="text-sm font-extrabold text-violet-600">
                            {formatRupiah(product.price)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Form Card (5 Cols) */}
            <div className="md:col-span-5">
              <Card className="sticky top-6 p-6 space-y-5 border-slate-200 shadow-md">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-base text-navy-900">Form Pemesanan Cepat</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Langsung terhubung dengan sistem kasir & penjual toko.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {!selectedProduct ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    &larr; Klik salah satu pakaian di katalog sebelah kiri untuk memilih ukuran dan warna.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOrder} className="space-y-4">
                    {/* Selected item summary */}
                    <div className="p-3 rounded-xl bg-violet-50/60 border border-violet-100 text-xs space-y-1">
                      <p className="font-bold text-navy-900">{selectedProduct.name}</p>
                      <p className="text-violet-600 font-extrabold">
                        {formatRupiah(selectedProduct.price)}
                      </p>
                    </div>

                    {/* Variant picker */}
                    <div>
                      <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wide mb-1.5">
                        Pilih Ukuran & Warna
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.variants?.map(v => {
                          const isPicked = selectedVariant?.id === v.id;
                          const isOutOfStock = v.stock <= 0;

                          return (
                            <button
                              key={v.id}
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => setSelectedVariant(v)}
                              className={`p-2 rounded-xl text-xs text-left border transition ${
                                isPicked
                                  ? 'border-violet-500 bg-violet-50 text-violet-700 font-bold'
                                  : isOutOfStock
                                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                                  : 'border-slate-200 hover:border-slate-300 text-navy-900'
                              }`}
                            >
                              <div className="font-bold">Size {v.size}</div>
                              <div className="text-[11px] text-slate-500">{v.color}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {isOutOfStock ? 'Habis' : `Stok: ${v.stock}`}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wide mb-1.5">
                        Jumlah Pembelian
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={selectedVariant?.stock || 1}
                        value={orderQty}
                        onChange={e => setOrderQty(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                      />
                    </div>

                    {/* Anti-spam hidden honeypot */}
                    <div className="hidden" aria-hidden="true">
                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={e => setHoneypot(e.target.value)}
                        placeholder="Leave blank"
                      />
                    </div>

                    {/* Buyer Information */}
                    <Input
                      label="Nama Kamu"
                      required
                      placeholder="Nama lengkap penerima paket"
                      value={buyerName}
                      onChange={e => setBuyerName(e.target.value)}
                    />

                    <Input
                      label="Nomor WhatsApp"
                      required
                      placeholder="Contoh: 081234567890"
                      value={buyerPhone}
                      onChange={e => setBuyerPhone(e.target.value)}
                    />

                    <div>
                      <label className="block text-xs font-semibold text-navy-800 uppercase tracking-wide mb-1.5">
                        Alamat Pengiriman
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Alamat lengkap, nomor rumah, RT/RW, kecamatan, kota..."
                        value={buyerAddress}
                        onChange={e => setBuyerAddress(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 text-navy-900"
                      />
                    </div>

                    <Input
                      label="Catatan Pembelian (Opsional)"
                      placeholder="Catatan untuk penjual..."
                      value={buyerNotes}
                      onChange={e => setBuyerNotes(e.target.value)}
                    />

                    <div className="pt-2">
                      <div className="flex justify-between items-center text-sm font-bold text-navy-900 mb-3">
                        <span>Total Pembayaran:</span>
                        <span className="text-violet-600 text-base">
                          {formatRupiah((selectedProduct.price || 0) * orderQty)}
                        </span>
                      </div>

                      <Button
                        type="submit"
                        variant="secondary"
                        size="lg"
                        className="w-full"
                        isLoading={isSubmitting}
                      >
                        Kirim Pesanan Sekarang
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
