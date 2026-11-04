'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { useStore } from '@/lib/store-context';
import { Card, Button, Badge } from '@/components/ui';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Users,
  Package,
} from 'lucide-react';

export default function ImportExportPage() {
  const { customers, products, addCustomer, addProduct } = useStore();

  const [activeTab, setActiveTab] = useState<'customers' | 'products'>('customers');

  // Customer Import Preview
  const [customerCsvPreview, setCustomerCsvPreview] = useState<any[]>([]);
  const [customerImportSuccess, setCustomerImportSuccess] = useState<number | null>(null);

  // Product Import Preview
  const [productCsvPreview, setProductCsvPreview] = useState<any[]>([]);
  const [productImportSuccess, setProductImportSuccess] = useState<number | null>(null);

  // 1. Export Customers to CSV
  const handleExportCustomers = () => {
    const csvData = customers.map(c => ({
      Nama: c.name,
      WhatsApp: c.phone_wa,
      Alamat: c.address || '',
      Sumber: c.source,
      Tahap: c.stage,
      'Ukuran Favorit': c.favorite_size || '',
      'Warna Favorit': c.favorite_color || '',
      'Total Belanja': c.total_spend,
      'Jumlah Pesanan': c.order_count,
      'Rata-rata Order': c.average_order_value,
      'Tanggal Beli Terakhir': c.last_purchase_date || '',
      Label: c.tags.join('; '),
    }));

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Threadly_Pelanggan_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 2. Export Products to CSV
  const handleExportProducts = () => {
    const csvData: any[] = [];
    for (const p of products) {
      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          csvData.push({
            'Nama Produk': p.name,
            SKU: p.sku || '',
            Kategori: p.category,
            'Harga Jual': p.price,
            'Harga Modal': p.cost_price || '',
            Ukuran: v.size,
            Warna: v.color,
            Stok: v.stock,
            'Batas Minimum Alert': v.min_stock_alert,
          });
        }
      } else {
        csvData.push({
          'Nama Produk': p.name,
          SKU: p.sku || '',
          Kategori: p.category,
          'Harga Jual': p.price,
          'Harga Modal': p.cost_price || '',
          Ukuran: 'All Size',
          Warna: 'Standar',
          Stok: 0,
          'Batas Minimum Alert': 3,
        });
      }
    }

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Threadly_Produk_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // 3. Handle File Uploads
  const handleCustomerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        setCustomerCsvPreview(results.data);
        setCustomerImportSuccess(null);
      },
    });
  };

  const handleProductFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        setProductCsvPreview(results.data);
        setProductImportSuccess(null);
      },
    });
  };

  // 4. Execute Imports
  const handleExecuteCustomerImport = async () => {
    let count = 0;
    for (const row of customerCsvPreview) {
      const name = row['Nama'] || row['name'];
      const phone = row['WhatsApp'] || row['phone_wa'] || row['phone'];
      if (name && phone) {
        await addCustomer({
          name,
          phone_wa: phone,
          address: row['Alamat'] || row['address'] || '',
          source: 'WhatsApp',
          favorite_size: row['Ukuran Favorit'] || 'M',
          favorite_color: row['Warna Favorit'] || '',
        });
        count++;
      }
    }
    setCustomerImportSuccess(count);
    setCustomerCsvPreview([]);
  };

  const handleExecuteProductImport = async () => {
    let count = 0;
    for (const row of productCsvPreview) {
      const name = row['Nama Produk'] || row['name'];
      const price = Number(row['Harga Jual'] || row['price'] || 100000);
      const size = row['Ukuran'] || row['size'] || 'All Size';
      const color = row['Warna'] || row['color'] || 'Hitam';
      const stock = Number(row['Stok'] || row['stock'] || 10);

      if (name) {
        await addProduct(
          {
            name,
            category: row['Kategori'] || 'Pakaian',
            price,
            cost_price: Number(row['Harga Modal'] || 0),
          },
          [{ size, color, stock, min_stock_alert: 3 }]
        );
        count++;
      }
    }
    setProductImportSuccess(count);
    setProductCsvPreview([]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-navy-900 dark:text-ivory-100">
          Impor &amp; Ekspor Data Toko
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pindahkan data pelanggan dan katalog produk dari Excel/CSV dengan mudah tanpa perlu input manual satu per satu.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-navy-800 gap-6">
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'customers'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Users className="w-4 h-4" strokeWidth={1.5} />
          <span>Data Pelanggan CRM</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Package className="w-4 h-4" strokeWidth={1.5} />
          <span>Katalog Produk &amp; Stok</span>
        </button>
      </div>

      {/* TAB 1: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export Card */}
            <Card className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Download className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                  Ekspor Data Pelanggan ({customers.length})
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Unduh seluruh daftar pelanggan lengkap dengan preferensi ukuran, tahap loyalitas, dan total belanja ke format CSV.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCustomers}
                leftIcon={<FileSpreadsheet className="w-4 h-4" strokeWidth={1.5} />}
              >
                Unduh CSV Pelanggan
              </Button>
            </Card>

            {/* Import Card */}
            <Card className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Upload className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                  Impor Data Pelanggan Baru
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Unggah file CSV dengan kolom Nama, WhatsApp, Alamat, Ukuran Favorit, dan Warna Favorit.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCustomerFileUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-800"
                />
              </div>
            </Card>
          </div>

          {/* Import Success Message */}
          {customerImportSuccess !== null && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
              <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
              <span>Berhasil mengimpor {customerImportSuccess} pelanggan baru ke Threadly CRM!</span>
            </div>
          )}

          {/* Customer CSV Preview Table */}
          {customerCsvPreview.length > 0 && (
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-navy-900 dark:text-ivory-100">
                    Pratinjau Data CSV ({customerCsvPreview.length} baris)
                  </h4>
                  <p className="text-xs text-slate-500">Periksa data sebelum dimasukkan ke database.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleExecuteCustomerImport}>
                  Konfirmasi Impor
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-navy-800 rounded-xl text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-navy-800 text-[11px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="p-2.5">Nama</th>
                      <th className="p-2.5">WhatsApp</th>
                      <th className="p-2.5">Alamat</th>
                      <th className="p-2.5">Ukuran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {customerCsvPreview.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-semibold">{row['Nama'] || row['name']}</td>
                        <td className="p-2.5">{row['WhatsApp'] || row['phone_wa']}</td>
                        <td className="p-2.5 truncate max-w-xs">{row['Alamat'] || row['address']}</td>
                        <td className="p-2.5">{row['Ukuran Favorit'] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export Card */}
            <Card className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Download className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                  Ekspor Katalog Produk ({products.length})
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Unduh seluruh daftar produk dan varian stok ukuran/warna ke format CSV.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportProducts}
                leftIcon={<FileSpreadsheet className="w-4 h-4" strokeWidth={1.5} />}
              >
                Unduh CSV Produk
              </Button>
            </Card>

            {/* Import Card */}
            <Card className="p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Upload className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                  Impor Koleksi Produk CSV
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Unggah file CSV dengan kolom Nama Produk, Kategori, Harga Jual, Ukuran, Warna, Stok.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleProductFileUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-navy-900 file:text-white hover:file:bg-navy-800"
                />
              </div>
            </Card>
          </div>

          {productImportSuccess !== null && (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
              <CheckCircle className="w-5 h-5" strokeWidth={1.5} />
              <span>Berhasil mengimpor {productImportSuccess} produk busana ke katalog!</span>
            </div>
          )}

          {productCsvPreview.length > 0 && (
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-navy-900 dark:text-ivory-100">
                    Pratinjau Data Produk CSV ({productCsvPreview.length} baris)
                  </h4>
                  <p className="text-xs text-slate-500">Periksa daftar produk sebelum dimasukkan ke etalase.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleExecuteProductImport}>
                  Konfirmasi Impor
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-100 dark:border-navy-800 rounded-xl text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-navy-800 text-[11px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="p-2.5">Nama Produk</th>
                      <th className="p-2.5">Harga</th>
                      <th className="p-2.5">Ukuran</th>
                      <th className="p-2.5">Warna</th>
                      <th className="p-2.5">Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {productCsvPreview.slice(0, 10).map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-semibold">{row['Nama Produk'] || row['name']}</td>
                        <td className="p-2.5">{row['Harga Jual'] || row['price']}</td>
                        <td className="p-2.5">{row['Ukuran'] || row['size']}</td>
                        <td className="p-2.5">{row['Warna'] || row['color']}</td>
                        <td className="p-2.5">{row['Stok'] || row['stock']} pcs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
