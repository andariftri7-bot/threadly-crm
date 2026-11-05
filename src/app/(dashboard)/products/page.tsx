'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store-context';
import { Product, ProductVariant } from '@/types';
import { formatRupiah, formatDateWIB } from '@/lib/utils';
import { Card, Button, Input, Badge, Modal, EmptyState, useToast } from '@/components/ui';
import {
  Package,
  Plus,
  AlertTriangle,
  History,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react';

export default function ProductsPage() {
  const {
    products,
    addProduct,
    updateProduct,
    adjustVariantStock,
    deleteProduct,
    stockMovements,
  } = useStore();
  const { showToast } = useToast();

  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Delete confirmation modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdSku, setEditProdSku] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('Atasan');
  const [editProdPrice, setEditProdPrice] = useState<number>(0);
  const [editProdCostPrice, setEditProdCostPrice] = useState<number>(0);
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdImg, setEditProdImg] = useState('');
  const [editVariantsRows, setEditVariantsRows] = useState<
    Array<{ id?: string; size: string; color: string; stock: number; minStock: number; sku?: string }>
  >([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setEditProdName(p.name);
    setEditProdSku(p.sku || '');
    setEditProdCategory(p.category || 'Atasan');
    setEditProdPrice(p.price || 0);
    setEditProdCostPrice(p.cost_price || 0);
    setEditProdDesc(p.description || '');
    setEditProdImg(p.image_url || '');
    setEditVariantsRows(
      p.variants && p.variants.length > 0
        ? p.variants.map(v => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock: v.stock,
            minStock: v.min_stock_alert,
            sku: v.sku,
          }))
        : [{ size: 'All Size', color: 'Standar', stock: 10, minStock: 3 }]
    );
  };

  const handleEditAddVariantRow = () => {
    setEditVariantsRows(prev => [
      ...prev,
      { size: 'All Size', color: 'Warna Lain', stock: 5, minStock: 3 },
    ]);
  };

  const handleEditRemoveVariantRow = (index: number) => {
    if (editVariantsRows.length <= 1) {
      showToast('Produk harus memiliki minimal 1 varian', 'warning');
      return;
    }
    setEditVariantsRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editProdName.trim()) {
      showToast('Nama produk wajib diisi', 'error');
      return;
    }
    if (!editProdPrice || editProdPrice <= 0) {
      showToast('Harga jual harus lebih dari 0', 'error');
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateProduct(
        editingProduct.id,
        {
          name: editProdName.trim(),
          sku: editProdSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
          category: editProdCategory,
          price: Number(editProdPrice),
          cost_price: editProdCostPrice ? Number(editProdCostPrice) : undefined,
          description: editProdDesc.trim(),
          image_url: editProdImg || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
        },
        editVariantsRows.map(vr => ({
          id: vr.id,
          size: vr.size.trim() || 'All Size',
          color: vr.color.trim() || 'Standar',
          stock: Number(vr.stock || 0),
          min_stock_alert: Number(vr.minStock || 3),
          sku: vr.sku || `${editProdSku || 'SKU'}-${vr.size}-${vr.color}`,
        }))
      );

      showToast('Produk berhasil diperbarui', 'success');
      setEditingProduct(null);
    } catch (err: any) {
      showToast(`Gagal memperbarui produk: ${err.message}`, 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Stock Adjustment Modal
  const [adjustingVariant, setAdjustingVariant] = useState<{
    variant: ProductVariant;
    productName: string;
  } | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(5);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustReason, setAdjustReason] = useState<string>('Restock konveksi lokal');
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);

  // Add Product Form
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Atasan');
  const [newProdPrice, setNewProdPrice] = useState<number>(150000);
  const [newProdCostPrice, setNewProdCostPrice] = useState<number>(75000);
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImg, setNewProdImg] = useState(
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80'
  );
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // New product variants rows
  const [variantsRows, setVariantsRows] = useState<
    Array<{ size: string; color: string; stock: number; minStock: number }>
  >([
    { size: 'S', color: 'Hitam', stock: 10, minStock: 3 },
    { size: 'M', color: 'Hitam', stock: 10, minStock: 3 },
    { size: 'L', color: 'Hitam', stock: 10, minStock: 3 },
  ]);

  const handleAddVariantRow = () => {
    setVariantsRows(prev => [
      ...prev,
      { size: 'All Size', color: 'Warna Lain', stock: 5, minStock: 3 },
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    if (variantsRows.length <= 1) {
      showToast('Produk harus memiliki minimal 1 varian', 'warning');
      return;
    }
    setVariantsRows(prev => prev.filter((_, idx) => idx !== index));
  };

  // Handle Photo File Upload with Canvas Optimization & Graceful Fallback
  const handlePhotoFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Format file harus berupa gambar (JPG, PNG, WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 5 MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result === 'string') {
          const img = document.createElement('img');
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const maxDim = 480;
              let width = img.width;
              let height = img.height;
              if (width > height && width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const compressed = canvas.toDataURL('image/jpeg', 0.7);
                setter(compressed);
                showToast('Foto produk berhasil diunggah dan dioptimalkan', 'info');
              } else {
                setter(reader.result as string);
                showToast('Foto produk berhasil dipilih', 'info');
              }
            } catch {
              setter(reader.result as string);
              showToast('Foto produk berhasil dipilih', 'info');
            }
          };
          img.onerror = () => {
            showToast('Foto gagal dibaca, produk tetap dapat disimpan tanpa foto', 'warning');
          };
          img.src = reader.result;
        }
      } catch {
        showToast('Foto gagal diproses, produk tetap dapat disimpan tanpa foto', 'warning');
      }
    };
    reader.onerror = () => {
      showToast('Foto gagal dibaca, produk tetap dapat disimpan tanpa foto baru', 'warning');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      showToast('Nama produk wajib diisi', 'error');
      return;
    }
    if (!newProdPrice || newProdPrice <= 0) {
      showToast('Harga jual harus lebih dari 0', 'error');
      return;
    }
    if (variantsRows.length === 0) {
      showToast('Minimal cantumkan 1 varian busana', 'error');
      return;
    }

    setIsSavingProduct(true);
    try {
      await addProduct(
        {
          name: newProdName.trim(),
          sku: newProdSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
          category: newProdCategory,
          price: Number(newProdPrice),
          cost_price: newProdCostPrice ? Number(newProdCostPrice) : undefined,
          description: newProdDesc.trim(),
          image_url: newProdImg || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
        },
        variantsRows.map(vr => ({
          size: vr.size.trim() || 'All Size',
          color: vr.color.trim() || 'Standar',
          stock: Number(vr.stock || 0),
          min_stock_alert: Number(vr.minStock || 3),
        }))
      );

      showToast('Produk berhasil ditambahkan ke katalog', 'success');
      setIsAddModalOpen(false);
      setNewProdName('');
      setNewProdSku('');
      setNewProdDesc('');
      setVariantsRows([
        { size: 'S', color: 'Hitam', stock: 10, minStock: 3 },
        { size: 'M', color: 'Hitam', stock: 10, minStock: 3 },
      ]);
    } catch (err: any) {
      // If saving fails due to image data (e.g. storage quota), retry without photo with warning
      if (newProdImg && newProdImg.startsWith('data:')) {
        try {
          await addProduct(
            {
              name: newProdName.trim(),
              sku: newProdSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
              category: newProdCategory,
              price: Number(newProdPrice),
              cost_price: newProdCostPrice ? Number(newProdCostPrice) : undefined,
              description: newProdDesc.trim(),
              image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
            },
            variantsRows.map(vr => ({
              size: vr.size.trim() || 'All Size',
              color: vr.color.trim() || 'Standar',
              stock: Number(vr.stock || 0),
              min_stock_alert: Number(vr.minStock || 3),
            }))
          );
          showToast('Foto gagal disimpan ke penyimpanan lokal. Produk berhasil disimpan tanpa foto.', 'warning');
          setIsAddModalOpen(false);
          setNewProdName('');
          setNewProdSku('');
          setNewProdDesc('');
          setVariantsRows([
            { size: 'S', color: 'Hitam', stock: 10, minStock: 3 },
            { size: 'M', color: 'Hitam', stock: 10, minStock: 3 },
          ]);
          return;
        } catch (innerErr: any) {
          showToast(`Gagal menambahkan produk: ${innerErr.message}`, 'error');
        }
      } else {
        showToast(`Gagal menambahkan produk: ${err.message}`, 'error');
      }
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handlePerformStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingVariant) return;

    setIsAdjustingStock(true);
    try {
      const delta = adjustType === 'in' ? Math.abs(adjustQty) : -Math.abs(adjustQty);
      await adjustVariantStock(adjustingVariant.variant.id, delta, adjustReason);
      showToast('Mutasi stok varian berhasil disimpan', 'success');
      setAdjustingVariant(null);
    } catch (err: any) {
      showToast(`Gagal menyesuaikan stok: ${err.message}`, 'error');
    } finally {
      setIsAdjustingStock(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      showToast(`Produk "${productToDelete.name}" berhasil dihapus`, 'success');
      setProductToDelete(null);
    } catch (err: any) {
      showToast(`Gagal menghapus produk: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">
            Katalog Produk &amp; Stok Varian
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola varian ukuran dan warna dengan akurasi stok otomatis per pergerakan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsHistoryModalOpen(true)}
            variant="outline"
            size="sm"
            leftIcon={<History className="w-4 h-4" strokeWidth={1.5} />}
          >
            Riwayat Mutasi Stok
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
          >
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* Products Catalog List */}
      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" strokeWidth={1.5} />}
          title="Belum ada produk di katalog"
          description="Tambahkan koleksi pakaian atau busana pertamamu lengkap dengan varian ukuran dan warna."
          actionText="Tambah Produk Sekarang"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {products.map(product => {
            const isExpanded = expandedProductId === product.id;
            const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
            const lowStockCount =
              product.variants?.filter(v => v.stock <= v.min_stock_alert).length || 0;

            return (
              <Card
                key={product.id}
                className="p-0 overflow-hidden border border-border transition shadow-sm hover:shadow"
              >
                {/* Main Product Row Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-navy-800 flex-shrink-0 border border-border">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Package className="w-8 h-8 m-auto text-muted-foreground" strokeWidth={1.5} />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-card-foreground">
                          {product.name}
                        </h3>
                        <Badge variant="default">{product.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        SKU: {product.sku || '-'} &bull; {product.variants?.length || 0} Varian
                      </p>
                      <p className="text-sm font-extrabold text-violet-600 dark:text-violet-400 mt-1">
                        {formatRupiah(product.price)}
                        {product.cost_price && (
                          <span className="text-xs text-muted-foreground font-normal ml-2">
                            (Modal: {formatRupiah(product.cost_price)})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-muted-foreground">Total Stok</p>
                      <p className="text-base font-bold text-card-foreground">
                        {totalStock} pcs
                      </p>
                      {lowStockCount > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span>{lowStockCount} varian menipis</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                        rightIcon={
                          isExpanded ? (
                            <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                          ) : (
                            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                          )
                        }
                      >
                        {isExpanded ? 'Tutup Varian' : 'Lihat Varian'}
                      </Button>

                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition"
                        title="Ubah Rincian Produk"
                      >
                        <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>

                      <button
                        onClick={() => setProductToDelete(product)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Variants Expansion Table */}
                {isExpanded && (
                  <div className="border-t border-border bg-slate-50/60 dark:bg-navy-950/40 p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Rincian Varian Ukuran &amp; Warna</span>
                      <span>Aksi Stok</span>
                    </div>

                    <div className="divide-y divide-slate-200/60 dark:divide-navy-800">
                      {product.variants?.map(variant => {
                        const isLow = variant.stock <= variant.min_stock_alert;

                        return (
                          <div
                            key={variant.id}
                            className="py-2.5 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-card-foreground min-w-16">
                                Size {variant.size}
                              </span>
                              <span className="text-slate-600 dark:text-muted-foreground">
                                Warna: {variant.color}
                              </span>
                              <span className="text-muted-foreground font-mono text-[11px]">
                                {variant.sku}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span
                                  className={`font-bold px-2 py-0.5 rounded-full ${
                                    variant.stock === 0
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                                      : isLow
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                                      : 'bg-slate-200 dark:bg-navy-800 text-card-foreground'
                                  }`}
                                >
                                  {variant.stock} pcs
                                </span>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">
                                  Min. {variant.min_stock_alert}
                                </span>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setAdjustingVariant({
                                    variant,
                                    productName: product.name,
                                  })
                                }
                                leftIcon={<ArrowUpDown className="w-3 h-3" strokeWidth={1.5} />}
                              >
                                Sesuaikan
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Adjust Variant Stock Modal */}
      <Modal
        isOpen={Boolean(adjustingVariant)}
        onClose={() => setAdjustingVariant(null)}
        title="Sesuaikan Stok Varian"
        description={`${adjustingVariant?.productName} - Size ${adjustingVariant?.variant.size} (${adjustingVariant?.variant.color})`}
      >
        <form onSubmit={handlePerformStockAdjustment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAdjustType('in')}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition ${
                adjustType === 'in'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                  : 'border-border text-muted-foreground'
              }`}
            >
              Stok Masuk (Restock / Retur)
            </button>
            <button
              type="button"
              onClick={() => setAdjustType('out')}
              className={`p-3 rounded-xl border text-xs font-bold text-center transition ${
                adjustType === 'out'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-400'
                  : 'border-border text-muted-foreground'
              }`}
            >
              Stok Keluar (Rusak / Sample)
            </button>
          </div>

          <Input
            label="Jumlah (pcs)"
            type="number"
            min={1}
            required
            value={adjustQty}
            onChange={e => setAdjustQty(parseInt(e.target.value) || 1)}
          />

          <Input
            label="Alasan Perubahan Stok"
            required
            placeholder="Contoh: Tambahan jahit konveksi kloter 2"
            value={adjustReason}
            onChange={e => setAdjustReason(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setAdjustingVariant(null)}>
              Batal
            </Button>
            <Button type="submit" variant="secondary" isLoading={isAdjustingStock}>
              Simpan Mutasi Stok
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Koleksi Produk Busana"
        description="Lengkapi informasi busana dan varian ukuran/warna."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <Input
            label="Nama Produk Busana"
            required
            placeholder="Contoh: Kemeja Linen Kerah Sanghai"
            value={newProdName}
            onChange={e => setNewProdName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Produk (Opsional)"
              placeholder="Contoh: LNN-SNG-01"
              value={newProdSku}
              onChange={e => setNewProdSku(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-card-foreground uppercase tracking-wide mb-1.5">
                Kategori Busana
              </label>
              <select
                value={newProdCategory}
                onChange={e => setNewProdCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-card text-card-foreground"
              >
                <option value="Atasan">Atasan (Kemeja, Blouse, Kaos)</option>
                <option value="Bawahan">Bawahan (Kulot, Celana, Rok)</option>
                <option value="Dress">Dress &amp; Gamis</option>
                <option value="Outer">Outer &amp; Jaket</option>
                <option value="Aksesoris">Aksesoris Fashion</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Harga Jual (Rp)"
              type="number"
              required
              value={newProdPrice}
              onChange={e => setNewProdPrice(Number(e.target.value))}
            />
            <Input
              label="Harga Modal (Rp - Opsional)"
              type="number"
              value={newProdCostPrice}
              onChange={e => setNewProdCostPrice(Number(e.target.value))}
            />
          </div>

          {/* Photo Upload with Local File Picker & Fallback */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-card-foreground uppercase tracking-wide">
              Foto Produk (Unggah atau URL)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/60 hover:bg-slate-100 text-xs font-semibold transition">
                <Upload className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
                <span>Pilih Foto dari Perangkat</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handlePhotoFileUpload(e, setNewProdImg)}
                />
              </label>
              {newProdImg && (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg overflow-hidden relative border border-border">
                    <Image src={newProdImg} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewProdImg('')}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
            <Input
              placeholder="Atau tempel URL gambar: https://images.unsplash.com/..."
              value={newProdImg}
              onChange={e => setNewProdImg(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-card-foreground uppercase tracking-wide mb-1.5">
              Deskripsi Produk
            </label>
            <textarea
              rows={2}
              value={newProdDesc}
              onChange={e => setNewProdDesc(e.target.value)}
              placeholder="Bahan, fitting, instruksi cuci..."
              className="w-full p-2.5 text-xs rounded-xl border border-border bg-card"
            />
          </div>

          {/* Dynamic Variant Rows */}
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-card-foreground">
                Kombinasi Varian (Ukuran &amp; Warna)
              </span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddVariantRow}>
                + Tambah Varian
              </Button>
            </div>

            <div className="space-y-2">
              {variantsRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Size (S/M/L)"
                      value={row.size}
                      onChange={e => {
                        const copy = [...variantsRows];
                        copy[idx].size = e.target.value;
                        setVariantsRows(copy);
                      }}
                      className="w-full p-2 rounded-lg border border-border bg-card"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Warna"
                      value={row.color}
                      onChange={e => {
                        const copy = [...variantsRows];
                        copy[idx].color = e.target.value;
                        setVariantsRows(copy);
                      }}
                      className="w-full p-2 rounded-lg border border-border bg-card"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Stok"
                      value={row.stock}
                      onChange={e => {
                        const copy = [...variantsRows];
                        copy[idx].stock = Number(e.target.value);
                        setVariantsRows(copy);
                      }}
                      className="w-full p-2 rounded-lg border border-border bg-card"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Min. Alert"
                      value={row.minStock}
                      onChange={e => {
                        const copy = [...variantsRows];
                        copy[idx].minStock = Number(e.target.value);
                        setVariantsRows(copy);
                      }}
                      className="w-full p-2 rounded-lg border border-border bg-card"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariantRow(idx)}
                      className="text-muted-foreground hover:text-rose-500 p-1"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="secondary" isLoading={isSavingProduct}>
              Simpan Koleksi Produk
            </Button>
          </div>
        </form>
      </Modal>

      {/* Stock Movement History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Riwayat Mutasi Stok Busana"
        description="Semua catatan pergerakan masuk dan keluar stok tersimpan transparan."
        maxWidth="lg"
      >
        <div className="max-h-[60vh] overflow-y-auto space-y-2 text-xs">
          {stockMovements.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Belum ada mutasi stok tercatat.</p>
          ) : (
            stockMovements.map(sm => (
              <div
                key={sm.id}
                className="p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-navy-800/40 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        sm.type === 'in' || sm.type === 'order_cancellation'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      }`}
                    >
                      {sm.type === 'in'
                        ? '+ Masuk'
                        : sm.type === 'order_cancellation'
                        ? '+ Batal Pesanan'
                        : sm.type === 'order_deduction'
                        ? '- Terjual'
                        : '- Keluar'}
                    </span>
                    <span className="font-semibold text-card-foreground">
                      {sm.variant_info || 'Varian Busana'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {sm.notes || '-'} &bull; {formatDateWIB(sm.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-card-foreground">
                    {sm.quantity} pcs
                  </span>
                  <p className="text-[10px] text-muted-foreground">Sisa: {sm.balance_after} pcs</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title={`Ubah Produk: ${editingProduct?.name}`}
        description="Perbarui informasi nama, kategori, harga, foto, atau varian produk busana."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEditProduct} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <Input
            label="Nama Produk"
            required
            value={editProdName}
            onChange={e => setEditProdName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU Produk"
              value={editProdSku}
              onChange={e => setEditProdSku(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-card-foreground uppercase tracking-wide mb-1.5">
                Kategori
              </label>
              <select
                value={editProdCategory}
                onChange={e => setEditProdCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-card-foreground"
              >
                <option value="Atasan">Atasan</option>
                <option value="Bawahan">Bawahan</option>
                <option value="Dress">Dress</option>
                <option value="Outer">Outer</option>
                <option value="Aksesoris">Aksesoris</option>
                <option value="Pakaian">Pakaian</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Harga Jual (Rp)"
              type="number"
              required
              value={editProdPrice}
              onChange={e => setEditProdPrice(Number(e.target.value))}
            />

            <Input
              label="Harga Modal (Rp - Opsional)"
              type="number"
              value={editProdCostPrice}
              onChange={e => setEditProdCostPrice(Number(e.target.value))}
            />
          </div>

          {/* Photo in Edit Modal */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-card-foreground uppercase tracking-wide">
              Foto Produk
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/60 hover:bg-slate-100 text-xs font-semibold transition">
                <Upload className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
                <span>Unggah Foto Baru</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handlePhotoFileUpload(e, setEditProdImg)}
                />
              </label>
              {editProdImg && (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg overflow-hidden relative border border-border">
                    <Image src={editProdImg} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditProdImg('')}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
            <Input
              placeholder="Atau tempel URL gambar..."
              value={editProdImg}
              onChange={e => setEditProdImg(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-card-foreground uppercase tracking-wide mb-1.5">
              Deskripsi Produk
            </label>
            <textarea
              rows={2}
              value={editProdDesc}
              onChange={e => setEditProdDesc(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-border bg-card text-card-foreground"
            />
          </div>

          {/* Variant Rows in Edit */}
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-card-foreground">
                Varian Ukuran &amp; Warna ({editVariantsRows.length})
              </span>
              <Button type="button" variant="outline" size="sm" onClick={handleEditAddVariantRow}>
                + Tambah Varian
              </Button>
            </div>

            <div className="space-y-2">
              {editVariantsRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Size"
                      value={row.size}
                      onChange={e => {
                        const copy = [...editVariantsRows];
                        copy[idx].size = e.target.value;
                        setEditVariantsRows(copy);
                      }}
                      className="w-full p-2 rounded-lg border border-border bg-card"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Warna"
                      value={row.color}
                      onChange={e => {
                        const copy = [...editVariantsRows];
                        copy[idx].color = e.target.value;
                        setEditVariantsRows(copy);
                      }}
                      className="w-full p-2 rounded-lg border border-border bg-card"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Stok"
                      value={row.stock}
                      onChange={e => {
                        const copy = [...editVariantsRows];
                        copy[idx].stock = Number(e.target.value);
                        setEditVariantsRows(copy);
                      }}
                      className="w-full p-2 rounded-lg border border-border bg-card"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="Min. Alert"
                      value={row.minStock}
                      onChange={e => {
                        const copy = [...editVariantsRows];
                        copy[idx].minStock = Number(e.target.value);
                        setEditVariantsRows(copy);
                      }}
                      className="w-full p-2 rounded-lg border border-border bg-card"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleEditRemoveVariantRow(idx)}
                      className="text-muted-foreground hover:text-rose-500 p-1"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingProduct(null)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={isSavingEdit}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        title="Hapus Produk dari Katalog"
        description={`Apakah Anda yakin ingin menghapus produk "${productToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      >
        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={() => setProductToDelete(null)}>
            Batal
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmDelete}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="w-4 h-4" strokeWidth={1.5} />}
          >
            Hapus Produk
          </Button>
        </div>
      </Modal>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="sm:hidden fixed bottom-20 right-4 z-30">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-secondary bg-gradient-accent text-white font-bold text-xs shadow-lg shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all touch-target"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Tambah Produk</span>
        </button>
      </div>
    </div>
  );
}
