'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store-context';
import { FollowupType, FollowupTask, Customer, Order } from '@/types';
import { formatDateWIB, formatShortDate, normalizeWhatsAppNumber } from '@/lib/utils';
import { Card, Button, Badge, Modal, EmptyState, useToast } from '@/components/ui';
import { enforceChatEmojis } from '@/lib/llm/provider';
import {
  RefreshCw,
  MessageCircle,
  CheckCircle,
  Clock,
  Cake,
  Package,
  Moon,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  Copy,
  RotateCcw,
  PenLine,
  User,
  ShoppingBag,
} from 'lucide-react';

function generateAiFollowupMessage(
  task: FollowupTask,
  customer?: Customer,
  latestOrder?: Order,
  store?: {
    name: string;
    slug?: string;
    ai_persona?: string;
    message_emoji_style?: 'bebas' | 'minimal' | 'none';
    msg_template_followup_sleeping?: string;
    msg_template_unpaid_order?: string;
    msg_template_birthday?: string;
    msg_template_restock?: string;
  },
  products: any[] = [],
  variant: number = 0
): string {
  const storeName = store?.name || 'Threadly';
  const custName = customer?.name || task.customer_name;
  const favSize = customer?.favorite_size ? `ukuran ${customer.favorite_size}` : '';
  const favColor = customer?.favorite_color ? `warna ${customer.favorite_color}` : '';
  const favSpec = [favSize, favColor].filter(Boolean).join(' ');
  const latestItem = latestOrder?.items?.[0]?.product_name || (products.length > 0 ? products[0].name : 'koleksi terbaru');
  const personaLower = (store?.ai_persona || '').toLowerCase();

  const isFormalOrBatik =
    personaLower.includes('sopan') ||
    personaLower.includes('santun') ||
    personaLower.includes('jawa') ||
    personaLower.includes('solo') ||
    personaLower.includes('batik') ||
    personaLower.includes('budaya') ||
    personaLower.includes('filosofi') ||
    personaLower.includes('resmi');

  const isStreetwearOrGaul =
    personaLower.includes('gaul') ||
    personaLower.includes('streetwear') ||
    personaLower.includes('anak muda') ||
    personaLower.includes('bandung') ||
    personaLower.includes('thrift') ||
    personaLower.includes('vintage') ||
    personaLower.includes('casual');

  let text = '';

  // Variant 0: Use configured Backup Template (Kerangka Pesan Cadangan) if available
  if (variant === 0) {
    let tpl = '';
    if (task.type === 'sleeping_customer') tpl = store?.msg_template_followup_sleeping || '';
    else if (task.type === 'unpaid_order') tpl = store?.msg_template_unpaid_order || '';
    else if (task.type === 'birthday') tpl = store?.msg_template_birthday || '';
    else if (task.type === 'restock') tpl = store?.msg_template_restock || '';

    if (tpl.trim().length > 0) {
      text = tpl
        .replace(/{nama}/g, custName)
        .replace(/{toko}/g, storeName)
        .replace(/{toko_slug}/g, store?.slug || '')
        .replace(/{produk}/g, latestItem)
        .replace(/{ukuran}/g, customer?.favorite_size || 'M')
        .replace(/{warna}/g, customer?.favorite_color || 'favorit')
        .replace(/{no_pesanan}/g, latestOrder?.order_number || 'Pesanan')
        .replace(/{stage}/g, customer?.stage || 'Pelanggan');
      return enforceChatEmojis(text, store?.message_emoji_style || 'bebas');
    }
  }

  // Personalized Generation with Store Persona & Customer Profile
  const mod = variant % 3;
  if (task.type === 'sleeping_customer') {
    const daysSince = customer?.last_purchase_date
      ? Math.floor((Date.now() - new Date(customer.last_purchase_date).getTime()) / 86400000)
      : 60;
    if (isFormalOrBatik) {
      text = mod === 0
        ? `Sugeng rawuh Kak ${custName} 🙏 Salam hangat dari ${storeName}. Sudah cukup lama (${daysSince} hari) kami tidak bersua. Kebetulan koleksi batik terbaru kami ${favSpec ? `pilihan ${favSpec}` : ''} baru saja selesai diproduksi. Menawi kepareng, kersa kami kirimkan katalognya kak? 🙏`
        : `Sugeng rawuh Kak ${custName} 🙏 Mengingat kembali pesanan ${latestItem} terdahulu, semoga berkenan dan awet. Saat ini ${storeName} menghadirkan motif klasik alusan terbaru. Mugi tansah pinaringan rahayu kak 🙏`;
    } else if (isStreetwearOrGaul) {
      text = mod === 0
        ? `Wassup ${custName}! Kangen nih udah ${daysSince} hari gak mampir ke ${storeName} 👍 Kebetulan drop baru vintage streetwear ${favSpec ? `size ${favSpec}` : ''} udah mendarat. Gass kepoin katalog sebelum disikat yang lain bro/sis 🛍️`
        : `Yo ${custName}! Gimana kabar ${latestItem} kemarin? Semoga makin keren dipakainya! Ada drop jaket & outfit baru nih di ${storeName}, cekidot ya bro/sis 👍`;
    } else {
      text = mod === 0
        ? `Halo Kak ${custName}, apa kabar? Semoga selalu sehat dan lancar ya 🙏 Kangen nih Kak ${custName} sudah ${daysSince} hari belum mampir lagi ke ${storeName}. Kebetulan minggu ini kami baru rilis model baru ${favSpec ? `ukuran ${favSpec}` : ''} yang cocok banget. Mampir lihat katalog ya kak 😊`
        : `Halo Kak ${custName} pelanggan setia ${storeName} 🙏 Spesial untuk Kak ${custName}, ada voucher potongan belanja khusus minggu ini. Koleksi ${latestItem ? `pelengkap ${latestItem}` : 'busana terbaru'} sudah siap kirim lho, yuk cek katalognya kak 🛍️`;
    }
  } else if (task.type === 'unpaid_order') {
    const orderNo = latestOrder?.order_number || 'Pesanan';
    if (isFormalOrBatik) {
      text = `Sugeng rawuh Kak ${custName} 🙏 Mengonfirmasi pesanan #${orderNo} di ${storeName}. Menawi wonten kendala dalam proses transfer, dengan senang hati kami siap membantu kak. Matur nuwun 🙏`;
    } else if (isStreetwearOrGaul) {
      text = `Yo ${custName}! Pesanan #${orderNo} untuk ${latestItem} masih kami amankan nih di ${storeName} 👍 Butuh info no rek atau QRIS? Konfirmasi ya bro/sis biar langsung dipacking hari ini 🛍️`;
    } else {
      text = `Halo Kak ${custName} 🙏 Terima kasih sudah membuat pesanan #${orderNo} di ${storeName}. Mau konfirmasi apakah ada kendala dalam proses transfer pembayarannya kak? Pesanan siap kami kemas dan kirim hari ini 😊`;
    }
  } else if (task.type === 'birthday') {
    if (isFormalOrBatik) {
      text = `Selamat ulang tahun Kak ${custName}! Mugi tansah pinaringan kesehatan, berkah, lan kabagyan 🙏 Spesial hari berbahagia ini, ${storeName} haturkan kado diskon khusus 15% untuk koleksi batik nusantara kami. Sugeng ambal warsa kak 🙏`;
    } else if (isStreetwearOrGaul) {
      text = `HBD ${custName}! Panjang umur & makin stylish ya 👍 Spesial ultahmu, ${storeName} kasih voucher belanja 20K buat sikat drop vintage incaranmu. Gass klaim hari ini bro/sis 🛍️`;
    } else {
      text = `Selamat ulang tahun Kak ${custName}! Semoga panjang umur, sehat selalu, dan semakin berkah ya 🙏 Spesial di hari bahagia ini, ${storeName} ada kado potongan harga khusus untuk Kakak. Yuk manjakan diri dengan busana favorit 🛍️`;
    }
  } else if (task.type === 'restock') {
    if (isFormalOrBatik) {
      text = `Kabar gembira Kak ${custName}! Varian ${favSpec || 'favorit Kakak'} untuk ${latestItem} sekarang sudah kembali tersedia di ${storeName} 🙏 Persediaan sangat terbatas, silakan dipesan sebelum kehabisan ya kak 🙏`;
    } else if (isStreetwearOrGaul) {
      text = `Drop restock buat ${custName}! Varian ${favSpec || 'favoritmu'} udah ready stock lagi nih di ${storeName} 👍 Siapa cepat dia dapat, gass checkout sebelum sold out bro/sis 🛍️`;
    } else {
      text = `Kabar gembira Kak ${custName}! Koleksi busana favorit ${favSpec ? `(${favSpec})` : ''} yang sempat dicari sekarang sudah restock kembali di ${storeName} 🙏 Stok sangat terbatas, yuk amankan sebelum kehabisan 🛍️`;
    }
  } else {
    text = task.description;
  }

  return enforceChatEmojis(text, store?.message_emoji_style || 'bebas');
}

export default function FollowupPage() {
  const {
    followupTasks,
    completeFollowupTask,
    dismissFollowupTask,
    currentStore,
    generateFollowupTasks,
    customers,
    orders,
    products,
  } = useStore();
  const { showToast } = useToast();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed'>('pending');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Interactive Message Editor Modal
  const [selectedTask, setSelectedTask] = useState<FollowupTask | null>(null);
  const [customizedMessage, setCustomizedMessage] = useState<string>('');
  const [messageVariant, setMessageVariant] = useState<number>(0);

  const filteredTasks = useMemo(() => {
    return followupTasks.filter(task => {
      if (task.status !== statusFilter) return false;
      if (typeFilter !== 'all' && task.type !== typeFilter) return false;
      return true;
    });
  }, [followupTasks, statusFilter, typeFilter]);

  const activeCustomer = useMemo(() => {
    if (!selectedTask) return undefined;
    return customers.find(c => c.id === selectedTask.customer_id);
  }, [selectedTask, customers]);

  const activeLatestOrder = useMemo(() => {
    if (!selectedTask) return undefined;
    const custOrders = orders.filter(
      o => o.customer_id === selectedTask.customer_id || o.customer_phone === selectedTask.customer_phone
    );
    return custOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }, [selectedTask, orders]);

  const handleRefreshTasks = async () => {
    setIsRefreshing(true);
    try {
      await generateFollowupTasks();
      showToast('Tugas tindak lanjut berhasil diperbarui', 'success');
    } catch (err: any) {
      showToast(`Gagal menyegarkan tugas: ${err.message}`, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenSender = (task: FollowupTask) => {
    setSelectedTask(task);
    setMessageVariant(0);
    const cust = customers.find(c => c.id === task.customer_id);
    const custOrders = orders.filter(
      o => o.customer_id === task.customer_id || o.customer_phone === task.customer_phone
    );
    const latest = custOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const initialMsg = generateAiFollowupMessage(
      task,
      cust,
      latest,
      currentStore || undefined,
      products,
      0
    );
    setCustomizedMessage(initialMsg);
  };

  const handleRegenerate = () => {
    const nextVar = messageVariant + 1;
    setMessageVariant(nextVar);
    if (!selectedTask) return;
    const newMsg = generateAiFollowupMessage(
      selectedTask,
      activeCustomer,
      activeLatestOrder,
      currentStore || undefined,
      products,
      nextVar
    );
    setCustomizedMessage(newMsg);
    showToast('Variasi pesan baru berhasil dibuat', 'info');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customizedMessage);
    showToast('Tersalin ke papan klip', 'success');
  };

  const handleOpenWhatsApp = () => {
    if (!selectedTask) return;
    const cleanPhone = normalizeWhatsAppNumber(selectedTask.customer_phone);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customizedMessage)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleMarkCompleted = async () => {
    if (!selectedTask) return;
    await completeFollowupTask(selectedTask.id);
    showToast('Tugas berhasil ditandai selesai', 'success');
    setSelectedTask(null);
  };

  const getTypeIcon = (type: FollowupType) => {
    switch (type) {
      case 'sleeping_customer':
        return <Moon className="w-4 h-4 text-amber-500" strokeWidth={1.5} />;
      case 'unpaid_order':
        return <Clock className="w-4 h-4 text-rose-500" strokeWidth={1.5} />;
      case 'birthday':
        return <Cake className="w-4 h-4 text-pink-500" strokeWidth={1.5} />;
      case 'restock':
        return <Package className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />;
    }
  };

  const getTypeBadge = (type: FollowupType) => {
    switch (type) {
      case 'sleeping_customer':
        return <Badge variant="warning">Pelanggan Tidur</Badge>;
      case 'unpaid_order':
        return <Badge variant="danger">Pesanan Tertunda</Badge>;
      case 'birthday':
        return <Badge variant="purple">Ulang Tahun</Badge>;
      case 'restock':
        return <Badge variant="success">Restock Favorit</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">
            Tindak Lanjut &amp; Retensi Pelanggan
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kirimkan pesan personal via WhatsApp agar pelanggan lama kembali berbelanja di {currentStore?.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshTasks}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="w-4 h-4" strokeWidth={1.5} />}
          >
            Segarkan Tugas
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              statusFilter === 'pending'
                ? 'bg-navy-900 text-white dark:bg-violet-600 shadow-sm'
                : 'bg-card text-slate-600 dark:text-muted-foreground border border-border'
            }`}
          >
            Perlu Ditindaklanjuti ({followupTasks.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
              statusFilter === 'completed'
                ? 'bg-navy-900 text-white dark:bg-violet-600 shadow-sm'
                : 'bg-card text-slate-600 dark:text-muted-foreground border border-border'
            }`}
          >
            Selesai Ditindaklanjuti ({followupTasks.filter(t => t.status === 'completed').length})
          </button>
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-border bg-card text-card-foreground"
        >
          <option value="all">Semua Jenis Tugas</option>
          <option value="sleeping_customer">Pelanggan Tidur (&gt; 60 hari)</option>
          <option value="unpaid_order">Pesanan Tertunda (&gt; 24 jam)</option>
          <option value="birthday">Ulang Tahun Pelanggan</option>
          <option value="restock">Varian Restock</option>
        </select>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckCircle className="w-8 h-8" strokeWidth={1.5} />}
          title={statusFilter === 'pending' ? 'Tidak ada tugas yang tertunda' : 'Belum ada tugas selesai'}
          description="Semua pelanggan sudah dirawat dengan baik. Sistem akan otomatis mendeteksi ketika ada pelanggan yang perlu dihubungi."
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <Card
              key={task.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-violet-300 dark:hover:border-violet-700 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getTypeIcon(task.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(task.type)}
                    <h4 className="font-bold text-sm text-card-foreground">
                      {task.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-muted-foreground">
                    {task.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Pelanggan: <strong>{task.customer_name}</strong> ({task.customer_phone}) &bull;{' '}
                    {formatDateWIB(task.due_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                {task.status === 'pending' ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenSender(task)}
                      leftIcon={<PenLine className="w-4 h-4" strokeWidth={1.5} />}
                    >
                      Buat Pesan
                    </Button>

                    <button
                      onClick={() => completeFollowupTask(task.id)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                      title="Tandai Selesai"
                    >
                      <Check className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    <button
                      onClick={() => dismissFollowupTask(task.id)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-navy-800 transition"
                      title="Abaikan"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </>
                ) : (
                  <Badge variant="success">
                    Telah Ditindaklanjuti {formatShortDate(task.completed_at)}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* WhatsApp Message Customizer Modal */}
      <Modal
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title="Personalisasi Pesan Tindak Lanjut"
        description={`Kirim ke: ${selectedTask?.customer_name} (${selectedTask?.customer_phone})`}
      >
        <div className="space-y-4 pt-1">
          {/* Customer Context Information */}
          <div className="p-3.5 bg-muted/60/60 rounded-xl text-xs space-y-2 border border-border">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" strokeWidth={1.5} />
                Profil Pelanggan
              </span>
              <Badge variant={activeCustomer?.stage === 'Setia' ? 'purple' : activeCustomer?.stage === 'Aktif' ? 'success' : activeCustomer?.stage === 'Tidur' ? 'warning' : 'default'}>
                Stage: {activeCustomer?.stage || 'Baru'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div>
                <span className="text-muted-foreground">Ukuran Favorit:</span>{' '}
                <strong>{activeCustomer?.favorite_size || 'Belum ada'}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Warna Favorit:</span>{' '}
                <strong>{activeCustomer?.favorite_color || 'Belum ada'}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Pesanan Terakhir:</span>{' '}
                <strong>
                  {activeLatestOrder
                    ? `${activeLatestOrder.items?.[0]?.product_name || 'Produk'} (${formatShortDate(activeLatestOrder.created_at)})`
                    : 'Belum ada riwayat'}
                </strong>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-card-foreground uppercase tracking-wide">
                Pratinjau &amp; Edit Pesan
              </label>
              <button
                type="button"
                onClick={handleRegenerate}
                className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                Buat Ulang Variasi
              </button>
            </div>
            <textarea
              rows={5}
              value={customizedMessage}
              onChange={e => setCustomizedMessage(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-border bg-card text-card-foreground focus:border-violet-500"
            />
          </div>

          <div className="p-3 bg-violet-50/60 dark:bg-navy-800/40 rounded-xl text-[11px] text-muted-foreground flex items-start gap-2 border border-violet-100 dark:border-navy-700">
            <AlertCircle className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>
              Pesan disesuaikan dengan persona toko dan aturan emoji minimal. Kamu bisa menyalin pesan atau langsung membuka WhatsApp.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkCompleted}
              leftIcon={<Check className="w-4 h-4" strokeWidth={1.5} />}
            >
              Tandai Selesai
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMessage}
                leftIcon={<Copy className="w-4 h-4" strokeWidth={1.5} />}
              >
                Salin Pesan
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOpenWhatsApp}
                leftIcon={<ExternalLink className="w-4 h-4" strokeWidth={1.5} />}
              >
                Buka WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
