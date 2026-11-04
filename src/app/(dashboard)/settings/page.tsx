'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store-context';
import { Card, Button, Input, Badge, Modal, useToast } from '@/components/ui';
import { formatShortDate, formatDateWIB, formatRupiah, buildWhatsAppLink } from '@/lib/utils';
import { defaultLLMProvider, enforceChatEmojis } from '@/lib/llm/provider';
import { CustomerStage, Customer } from '@/types';
import {
  Store,
  Sliders,
  MessageSquare,
  Users,
  Check,
  Save,
  UserPlus,
  PenLine,
  AlertCircle,
  RotateCcw,
  Bot,
  Info,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Search,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    currentStore,
    allStores,
    updateStoreSettings,
    storeMembers,
    inviteMember,
    customers,
    orders,
    products,
    recalculateAllCustomerStages,
  } = useStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'thresholds' | 'templates' | 'persona' | 'team'>('profile');

  // Store Profile State
  const [storeName, setStoreName] = useState(currentStore?.name || '');
  const [storeSlug, setStoreSlug] = useState(currentStore?.slug || '');
  const [storePhone, setStorePhone] = useState(currentStore?.phone_wa || '');
  const [storeDesc, setStoreDesc] = useState(currentStore?.description || '');
  const [storeAddress, setStoreAddress] = useState(currentStore?.address || '');

  // Thresholds State
  const [activeDays, setActiveDays] = useState(currentStore?.active_threshold_days || 60);
  const [loyalOrders, setLoyalOrders] = useState(currentStore?.loyal_threshold_orders || 3);
  const [loyalDays, setLoyalDays] = useState(currentStore?.loyal_threshold_days || 90);
  const [sleepingDays, setSleepingDays] = useState(currentStore?.sleeping_threshold_days || 60);

  // Templates State
  const [tplSleeping, setTplSleeping] = useState(currentStore?.msg_template_followup_sleeping || '');
  const [tplUnpaid, setTplUnpaid] = useState(currentStore?.msg_template_unpaid_order || '');
  const [tplBirthday, setTplBirthday] = useState(currentStore?.msg_template_birthday || '');
  const [tplRestock, setTplRestock] = useState(currentStore?.msg_template_restock || '');

  // AI Persona State
  const [aiPersona, setAiPersona] = useState(
    currentStore?.ai_persona || 'Ramah, santai, empatik khas fashion advisor butik lokal.'
  );
  const [emojiStyle, setEmojiStyle] = useState<'bebas' | 'minimal' | 'none'>(
    currentStore?.message_emoji_style || 'bebas'
  );

  // Sync state when currentStore loads
  useEffect(() => {
    if (currentStore) {
      setStoreName(currentStore.name);
      setStoreSlug(currentStore.slug);
      setStorePhone(currentStore.phone_wa || '');
      setStoreDesc(currentStore.description || '');
      setStoreAddress(currentStore.address || '');
      setActiveDays(currentStore.active_threshold_days || 60);
      setLoyalOrders(currentStore.loyal_threshold_orders || 3);
      setLoyalDays(currentStore.loyal_threshold_days || 90);
      setSleepingDays(currentStore.sleeping_threshold_days || 60);
      setTplSleeping(currentStore.msg_template_followup_sleeping || '');
      setTplUnpaid(currentStore.msg_template_unpaid_order || '');
      setTplBirthday(currentStore.msg_template_birthday || '');
      setTplRestock(currentStore.msg_template_restock || '');
      setAiPersona(currentStore.ai_persona || 'Ramah, santai, empatik khas fashion advisor butik lokal.');
      setEmojiStyle(currentStore.message_emoji_style || 'bebas');
    }
  }, [currentStore]);

  // Team Invite State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'owner' | 'staff'>('staff');
  const [isInviting, setIsInviting] = useState(false);

  // Saving states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingThresholds, setIsSavingThresholds] = useState(false);
  const [isSavingTemplates, setIsSavingTemplates] = useState(false);
  const [isSavingPersona, setIsSavingPersona] = useState(false);

  // Live impact calculation for Siklus Pelanggan
  const previewStageDistribution = useMemo(() => {
    let act = 0, loy = 0, slp = 0, nw = 0;
    const now = Date.now();
    for (const cust of customers) {
      const custOrders = orders.filter(
        o => (o.customer_id === cust.id || o.customer_phone === cust.phone_wa) && o.status !== 'Batal'
      );
      if (custOrders.length === 0) {
        nw++;
        continue;
      }
      const sorted = [...custOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const lastOrderTime = new Date(sorted[0].created_at).getTime();
      const diffDays = Math.floor((now - lastOrderTime) / (1000 * 60 * 60 * 24));

      if (diffDays > sleepingDays) {
        slp++;
      } else if (custOrders.length >= loyalOrders && diffDays <= loyalDays) {
        loy++;
      } else if (diffDays <= activeDays) {
        act++;
      } else {
        slp++;
      }
    }
    return { active: act, loyal: loy, sleeping: slp, newCount: nw };
  }, [customers, orders, activeDays, sleepingDays, loyalOrders, loyalDays]);

  // Modal State for Customer Stage List
  const [selectedStageModal, setSelectedStageModal] = useState<CustomerStage | null>(null);
  const [stageModalSearch, setStageModalSearch] = useState('');

  // Filtered customer list for the selected stage modal
  const stageModalCustomers = useMemo(() => {
    if (!selectedStageModal) return [];
    const now = Date.now();

    return customers.filter(cust => {
      // Calculate dynamic stage based on active thresholds
      const custOrders = orders.filter(
        o => (o.customer_id === cust.id || o.customer_phone === cust.phone_wa) && o.status !== 'Batal'
      );
      let calculatedStage: CustomerStage = 'Baru';
      if (custOrders.length === 0) {
        calculatedStage = 'Baru';
      } else {
        const sorted = [...custOrders].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const lastOrderTime = new Date(sorted[0].created_at).getTime();
        const diffDays = Math.floor((now - lastOrderTime) / (1000 * 60 * 60 * 24));

        if (diffDays > sleepingDays) {
          calculatedStage = 'Tidur';
        } else if (custOrders.length >= loyalOrders && diffDays <= loyalDays) {
          calculatedStage = 'Setia';
        } else if (diffDays <= activeDays) {
          calculatedStage = 'Aktif';
        } else {
          calculatedStage = 'Tidur';
        }
      }

      if (calculatedStage !== selectedStageModal && cust.stage !== selectedStageModal) {
        return false;
      }

      if (!stageModalSearch.trim()) return true;
      const q = stageModalSearch.toLowerCase().trim();
      return (
        cust.name.toLowerCase().includes(q) ||
        cust.phone_wa.toLowerCase().includes(q) ||
        (cust.favorite_size && cust.favorite_size.toLowerCase().includes(q)) ||
        (cust.favorite_color && cust.favorite_color.toLowerCase().includes(q))
      );
    });
  }, [customers, orders, selectedStageModal, stageModalSearch, activeDays, sleepingDays, loyalOrders, loyalDays]);

  // Direct WhatsApp link for sleeping customer reactivation
  const getSleepingWaLink = (customer: Customer) => {
    const defaultTemplate =
      tplSleeping ||
      currentStore?.msg_template_followup_sleeping ||
      'Halo Kak {nama} tercinta! 🥰✨ Kami di {toko} kangen banget nih sama Kakak. Kebetulan koleksi baru ukuran {ukuran} warna {warna} baru saja restock lho! 👗✨ Yuk intip katalog kami di threadly.id/{toko_slug} sebelum sold out lagi ya kak! 💕🛍️';
    const text = defaultTemplate
      .replace(/{nama}/g, customer.name)
      .replace(/{toko}/g, currentStore?.name || 'toko kami')
      .replace(/{toko_slug}/g, currentStore?.slug || '')
      .replace(/{ukuran}/g, customer.favorite_size || 'favorit')
      .replace(/{warna}/g, customer.favorite_color || 'favorit')
      .replace(/{stage}/g, customer.stage);
    const finalMsg = enforceChatEmojis(text, 'bebas');
    return buildWhatsAppLink(customer.phone_wa, finalMsg);
  };

  // Current store team members & quota
  const currentStoreMembers = useMemo(() => {
    if (!currentStore) return [];
    return storeMembers.filter(m => m.store_id === currentStore.id);
  }, [storeMembers, currentStore]);

  const maxUsersAllowed = currentStore?.plan === 'pro' ? 5 : 2;
  const isQuotaReached = currentStoreMembers.length >= maxUsersAllowed;

  // 6a: Save Profile with Slug Uniqueness Check
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;

    const normalizedSlug = storeSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (!normalizedSlug) {
      showToast('Slug etalase tidak boleh kosong', 'error');
      return;
    }

    // Slug uniqueness check across other stores
    const slugConflict = allStores.find(
      s => s.id !== currentStore.id && s.slug.toLowerCase() === normalizedSlug
    );
    if (slugConflict) {
      showToast('Slug sudah digunakan oleh toko lain', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateStoreSettings({
        name: storeName.trim(),
        slug: normalizedSlug,
        phone_wa: storePhone.trim(),
        description: storeDesc.trim(),
        address: storeAddress.trim(),
      });
      showToast('Pengaturan profil toko berhasil disimpan', 'success');
    } catch (err: any) {
      showToast(`Gagal menyimpan profil: ${err.message}`, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 6b: Save Customer Cycle & Recalculate
  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;

    setIsSavingThresholds(true);
    try {
      await updateStoreSettings({
        active_threshold_days: Number(activeDays),
        loyal_threshold_orders: Number(loyalOrders),
        loyal_threshold_days: Number(loyalDays),
        sleeping_threshold_days: Number(sleepingDays),
      });

      await recalculateAllCustomerStages({
        activeDays: Number(activeDays),
        loyalOrders: Number(loyalOrders),
        loyalDays: Number(loyalDays),
        sleepingDays: Number(sleepingDays),
      });

      showToast('Siklus pelanggan diperbarui', 'success');
    } catch (err: any) {
      showToast(`Gagal memperbarui siklus: ${err.message}`, 'error');
    } finally {
      setIsSavingThresholds(false);
    }
  };

  // 6c: Save Backup Templates
  const handleSaveTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;

    setIsSavingTemplates(true);
    try {
      await updateStoreSettings({
        msg_template_followup_sleeping: tplSleeping,
        msg_template_unpaid_order: tplUnpaid,
        msg_template_birthday: tplBirthday,
        msg_template_restock: tplRestock,
      });
      showToast('Kerangka pesan berhasil disimpan', 'success');
    } catch (err: any) {
      showToast(`Gagal menyimpan template: ${err.message}`, 'error');
    } finally {
      setIsSavingTemplates(false);
    }
  };

  // 6d: Save Persona & Settings
  const handleSavePersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore) return;

    setIsSavingPersona(true);
    try {
      const nowIso = new Date().toISOString();
      await updateStoreSettings({
        ai_persona: aiPersona,
        message_emoji_style: emojiStyle,
        last_persona_updated_at: nowIso,
      });
      showToast('Persona AI berhasil disimpan', 'success');
    } catch (err: any) {
      showToast(`Gagal menyimpan persona: ${err.message}`, 'error');
    } finally {
      setIsSavingPersona(false);
    }
  };

  // 6d: Test Reply Panel
  const [testInquiry, setTestInquiry] = useState(
    'Halo kak, kemeja linen broken white size M ready gak ya? Harganya berapa?'
  );
  const [isTestingReply, setIsTestingReply] = useState(false);
  const [testReplyResult, setTestReplyResult] = useState<string>('');

  const handleRunTestReply = async () => {
    if (!testInquiry.trim() || !currentStore) return;
    setIsTestingReply(true);
    try {
      const catalogContext = products
        .map(
          p =>
            `- ${p.name} (Kategori: ${p.category}, Harga: ${formatRupiah(p.price)}):\n  Varian: ${
              p.variants?.map(v => `${v.size} / ${v.color} (Stok: ${v.stock})`).join(', ') || 'Standar'
            }`
        )
        .join('\n');

      const res = await defaultLLMProvider.composeReply(
        testInquiry,
        currentStore.name,
        aiPersona,
        catalogContext,
        products,
        emojiStyle
      );
      setTestReplyResult(res.data || '');
      showToast('Uji balasan persona berhasil', 'info');
    } catch (err: any) {
      showToast(`Gagal menguji balasan: ${err.message}`, 'error');
    } finally {
      setIsTestingReply(false);
    }
  };

  // 6e: Team Invite
  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      showToast('Masukkan alamat email yang valid', 'error');
      return;
    }
    if (isQuotaReached) {
      showToast('Batas kuota anggota tim telah tercapai', 'error');
      return;
    }

    setIsInviting(true);
    try {
      await inviteMember(inviteEmail.trim(), inviteRole);
      showToast('Undangan anggota tim berhasil dikirim', 'success');
      setInviteEmail('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-navy-900 dark:text-ivory-100">
          Pengaturan Toko
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Atur identitas butik, siklus pelanggan CRM, kerangka pesan cadangan, persona AI, dan tim kerja.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-navy-800 gap-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 hover:text-navy-900 dark:hover:text-ivory-100'
          }`}
        >
          <Store className="w-4 h-4" strokeWidth={1.5} />
          <span>Profil Toko &amp; Slug</span>
        </button>
        <button
          onClick={() => setActiveTab('thresholds')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'thresholds'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 hover:text-navy-900 dark:hover:text-ivory-100'
          }`}
        >
          <Sliders className="w-4 h-4" strokeWidth={1.5} />
          <span>Siklus Pelanggan</span>
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'templates'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 hover:text-navy-900 dark:hover:text-ivory-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
          <span>Kerangka Pesan Cadangan</span>
        </button>
        <button
          onClick={() => setActiveTab('persona')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'persona'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 hover:text-navy-900 dark:hover:text-ivory-100'
          }`}
        >
          <PenLine className="w-4 h-4" strokeWidth={1.5} />
          <span>Persona AI</span>
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'team'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-slate-500 hover:text-navy-900 dark:hover:text-ivory-100'
          }`}
        >
          <Users className="w-4 h-4" strokeWidth={1.5} />
          <span>Manajemen Tim &amp; Staf</span>
        </button>
      </div>

      {/* TAB 1: Profile (6a) */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-violet-900 dark:text-violet-200">
                    Paket: {currentStore?.plan === 'pro' ? 'Paket Pro (Rp45.000/bln)' : 'Paket Standar (Rp20.000/bln)'}
                  </span>
                  <Badge variant="purple">Masa Coba 7 Hari</Badge>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Masa coba berlaku sampai {currentStore?.trial_ends_at ? formatShortDate(currentStore.trial_ends_at) : '7 hari'}.
                </p>
              </div>
            </div>

            <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
              Identitas Toko &amp; Etalase Publik
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Toko / Brand Fashion"
                required
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
              />
              <Input
                label="Slug Tautan Etalase (threadly.id/[slug])"
                required
                value={storeSlug}
                onChange={e => setStoreSlug(e.target.value)}
                helperText="Hanya gunakan huruf kecil, angka, dan tanda hubung (-)."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nomor WhatsApp Toko"
                required
                placeholder="Contoh: 081298765432"
                value={storePhone}
                onChange={e => setStorePhone(e.target.value)}
              />
              <Input
                label="Alamat Fisik / Workshop"
                value={storeAddress}
                onChange={e => setStoreAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                Deskripsi Singkat Butik
              </label>
              <textarea
                rows={3}
                value={storeDesc}
                onChange={e => setStoreDesc(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100 focus:border-violet-500"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-navy-800">
              <Button
                type="submit"
                variant="secondary"
                isLoading={isSavingProfile}
                leftIcon={<Save className="w-4 h-4" strokeWidth={1.5} />}
              >
                Simpan Profil Toko
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 2: Siklus Pelanggan (6b) */}
      {activeTab === 'thresholds' && (
        <form onSubmit={handleSaveThresholds} className="space-y-4">
          <Card className="space-y-5">
            <div>
              <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                Siklus Pelanggan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur kriteria otomatisasi pengelompokan pelanggan fashion tokomu agar tindak lanjut retensi berjalan tepat sasaran. Klik kartu untuk melihat daftar pelanggan pada tahap terkait.
              </p>
            </div>

            {/* Stage Explanations with Counts beside definition & Clickable to see list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Tahap Baru */}
              <div
                onClick={() => {
                  setSelectedStageModal('Baru');
                  setStageModalSearch('');
                }}
                className="group p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/90 dark:bg-navy-800/60 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-violet-400 dark:hover:border-violet-500 cursor-pointer transition shadow-sm space-y-2 select-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Baru</Badge>
                    <span className="font-bold text-xs text-navy-900 dark:text-ivory-100">
                      ({previewStageDistribution.newCount} Pelanggan)
                    </span>
                  </div>
                  <span className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Lihat Daftar</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Pelanggan yang baru pertama kali bertransaksi atau belum pernah bertransaksi di tokomu.
                </p>
              </div>

              {/* Tahap Aktif */}
              <div
                onClick={() => {
                  setSelectedStageModal('Aktif');
                  setStageModalSearch('');
                }}
                className="group p-3.5 rounded-xl bg-emerald-50/40 hover:bg-emerald-50/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-400 dark:hover:border-emerald-600 cursor-pointer transition shadow-sm space-y-2 select-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Aktif</Badge>
                    <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                      ({previewStageDistribution.active} Pelanggan)
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Lihat Daftar</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Pelanggan yang bertransaksi dalam kurun waktu aktif (default: {activeDays} hari terakhir).
                </p>
              </div>

              {/* Tahap Setia */}
              <div
                onClick={() => {
                  setSelectedStageModal('Setia');
                  setStageModalSearch('');
                }}
                className="group p-3.5 rounded-xl bg-violet-50/40 hover:bg-violet-50/80 dark:bg-violet-950/20 dark:hover:bg-violet-950/40 border border-violet-100 dark:border-violet-900/40 hover:border-violet-400 dark:hover:border-violet-600 cursor-pointer transition shadow-sm space-y-2 select-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple">Setia</Badge>
                    <span className="font-bold text-xs text-violet-800 dark:text-violet-300">
                      ({previewStageDistribution.loyal} Pelanggan)
                    </span>
                  </div>
                  <span className="text-[11px] text-violet-700 dark:text-violet-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Lihat Daftar</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Pelanggan yang telah berbelanja berulang kali (minimal {loyalOrders} pesanan) dalam {loyalDays} hari terakhir.
                </p>
              </div>

              {/* Tahap Tidur */}
              <div
                onClick={() => {
                  setSelectedStageModal('Tidur');
                  setStageModalSearch('');
                }}
                className="group p-3.5 rounded-xl bg-amber-50/40 hover:bg-amber-50/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer transition shadow-sm space-y-2 select-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Tidur</Badge>
                    <span className="font-bold text-xs text-amber-800 dark:text-amber-300">
                      ({previewStageDistribution.sleeping} Pelanggan)
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Lihat Daftar</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Pelanggan yang tidak pernah bertransaksi lebih dari {sleepingDays} hari (otomatis masuk daftar tindak lanjut retensi).
                </p>
              </div>
            </div>

            {/* Formal Notification Message Below Stages */}
            <div className="p-3.5 bg-slate-50 dark:bg-navy-800/80 rounded-xl border border-slate-200 dark:border-navy-700 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-violet-600 flex-shrink-0" strokeWidth={1.5} />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                <span className="font-bold text-navy-900 dark:text-ivory-100 mr-1.5">Pratinjau Dampak Pengaturan:</span>
                Distribusi kuantitas pelanggan di atas terhitung secara otomatis dan dinamis berdasarkan konfigurasi ambang batas kriteria siklus yang aktif saat ini.
              </p>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tahap Aktif: Batas Pembelian Terakhir (Hari)"
                type="number"
                min={1}
                value={activeDays}
                onChange={e => setActiveDays(Number(e.target.value))}
                helperText="Membeli dalam kurun waktu ini dianggap pelanggan Aktif (default 60 hari)."
              />

              <Input
                label="Tahap Tidur: Batas Tidak Membeli (Hari)"
                type="number"
                min={1}
                value={sleepingDays}
                onChange={e => setSleepingDays(Number(e.target.value))}
                helperText="Tidak bertransaksi melebihi batas ini masuk daftar Tindak Lanjut (default 60 hari)."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tahap Setia: Minimal Jumlah Pesanan"
                type="number"
                min={1}
                value={loyalOrders}
                onChange={e => setLoyalOrders(Number(e.target.value))}
                helperText="Minimal frekuensi pesanan untuk mendapat predikat Pelanggan Setia (default 3x)."
              />

              <Input
                label="Tahap Setia: Batas Transaksi Terakhir (Hari)"
                type="number"
                min={1}
                value={loyalDays}
                onChange={e => setLoyalDays(Number(e.target.value))}
                helperText="Tetap harus bertransaksi dalam kurun waktu ini (default 90 hari)."
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-navy-800">
              <Button
                type="submit"
                variant="secondary"
                isLoading={isSavingThresholds}
                leftIcon={<Save className="w-4 h-4" strokeWidth={1.5} />}
              >
                Simpan Siklus Pelanggan
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 3: Kerangka Pesan Cadangan (6c) */}
      {activeTab === 'templates' && (
        <form onSubmit={handleSaveTemplates} className="space-y-4">
          <Card className="space-y-4">
            <div>
              <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                Kerangka Pesan Cadangan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kerangka ini digunakan sebagai pesan alternatif ketika AI tidak aktif, atau sebagai dasar inspirasi balasan WhatsApp.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-navy-800/60 rounded-xl text-[11px] text-slate-500 border border-slate-200 dark:border-navy-700">
              Gunakan variabel {'{nama}'}, {'{toko}'}, {'{toko_slug}'}, {'{produk}'}, {'{ukuran}'}, {'{warna}'}, {'{no_pesanan}'} untuk disisipkan otomatis.
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  1. Template Pelanggan Tidur (Ajak Kembali)
                </label>
                <textarea
                  rows={3}
                  value={tplSleeping}
                  onChange={e => setTplSleeping(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  2. Template Pesanan Menunggu Pembayaran (&gt; 24 Jam)
                </label>
                <textarea
                  rows={3}
                  value={tplUnpaid}
                  onChange={e => setTplUnpaid(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  3. Template Ucapan Ulang Tahun &amp; Diskon
                </label>
                <textarea
                  rows={3}
                  value={tplBirthday}
                  onChange={e => setTplBirthday(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  4. Template Restock Busana Favorit
                </label>
                <textarea
                  rows={3}
                  value={tplRestock}
                  onChange={e => setTplRestock(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100 focus:border-violet-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-navy-800">
              <Button
                type="submit"
                variant="secondary"
                isLoading={isSavingTemplates}
                leftIcon={<Save className="w-4 h-4" strokeWidth={1.5} />}
              >
                Simpan Kerangka Pesan
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* TAB 4: Persona AI (6d) */}
      {activeTab === 'persona' && (
        <div className="space-y-6">
          <form onSubmit={handleSavePersona} className="space-y-4">
            <Card className="space-y-5">
              <div>
                <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                  Persona &amp; Gaya Bahasa Asisten AI
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tentukan bagaimana AI toko kamu berkomunikasi menyapa pelanggan butik lokal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  Instruksi Karakter &amp; Nada Bicara
                </label>
                <textarea
                  rows={3}
                  value={aiPersona}
                  onChange={e => setAiPersona(e.target.value)}
                  placeholder="Contoh: Ramah, santai, empatik khas fashion advisor butik lokal Jakarta..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100 focus:border-violet-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  AI hanya akan mengutip data harga dan stok riil dari katalog tokomu tanpa menebak atau berhalusinasi.
                </p>
              </div>

              {/* Emoji Style Setting */}
              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  Emoji pada Pesan Chat
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setEmojiStyle('bebas')}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      emojiStyle === 'bebas'
                        ? 'border-violet-500 bg-violet-50/50 dark:bg-navy-800 ring-1 ring-violet-500'
                        : 'border-slate-200 dark:border-navy-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-navy-900 dark:text-ivory-100">
                        Emoji Bebas
                      </span>
                      {emojiStyle === 'bebas' && (
                        <Badge variant="purple">Aktif</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Bebas berekspresi tanpa batasan jumlah atau varian emoji.
                    </p>
                  </div>

                  <div
                    onClick={() => setEmojiStyle('minimal')}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      emojiStyle === 'minimal'
                        ? 'border-violet-500 bg-violet-50/50 dark:bg-navy-800 ring-1 ring-violet-500'
                        : 'border-slate-200 dark:border-navy-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-navy-900 dark:text-ivory-100">
                        Minimal (Maksimal 2)
                      </span>
                      {emojiStyle === 'minimal' && (
                        <Badge variant="purple">Aktif</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Hanya menggunakan emoji santun dan profesional dalam batas wajar.
                    </p>
                  </div>

                  <div
                    onClick={() => setEmojiStyle('none')}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      emojiStyle === 'none'
                        ? 'border-violet-500 bg-violet-50/50 dark:bg-navy-800 ring-1 ring-violet-500'
                        : 'border-slate-200 dark:border-navy-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-navy-900 dark:text-ivory-100">
                        Tanpa Emoji
                      </span>
                      {emojiStyle === 'none' && (
                        <Badge variant="purple">Aktif</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Pesan bersih murni teks formal tanpa ikon emotikon apapun.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
                <div>
                  {currentStore?.last_persona_updated_at ? (
                    <span className="text-xs text-slate-500">
                      Terakhir disimpan: {formatDateWIB(currentStore.last_persona_updated_at)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">
                      Gaya bahasa ini digunakan saat menyusun balasan chat.
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={isSavingPersona}
                  leftIcon={<Save className="w-4 h-4" strokeWidth={1.5} />}
                >
                  Simpan Persona AI
                </Button>
              </div>
            </Card>
          </form>

          {/* Panel Uji Balasan */}
          <Card className="space-y-4">
            <div className="border-b border-slate-100 dark:border-navy-800 pb-3">
              <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
                Uji Balasan Persona
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Coba kirimkan pertanyaan untuk melihat bagaimana persona dan aturan emoji di atas diterapkan pada pesan balasan.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                Pertanyaan Simulasi
              </label>
              <textarea
                rows={2}
                value={testInquiry}
                onChange={e => setTestInquiry(e.target.value)}
                placeholder="Tulis pertanyaan uji coba di sini..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100 focus:border-violet-500"
              />
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRunTestReply}
                isLoading={isTestingReply}
                leftIcon={<Bot className="w-4 h-4" strokeWidth={1.5} />}
              >
                Uji Balasan Persona
              </Button>
            </div>

            {testReplyResult && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-700 space-y-2">
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider block">
                  Hasil Pratinjau Balasan:
                </span>
                <p className="text-xs text-navy-900 dark:text-ivory-100 leading-relaxed whitespace-pre-line">
                  {testReplyResult}
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 5: Team & Staff (6e) */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-violet-900 dark:text-violet-200">
                  Penggunaan Kuota: {currentStoreMembers.length} dari {maxUsersAllowed} pengguna ({currentStore?.plan === 'pro' ? 'Paket Pro' : 'Paket Standar'})
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentStore?.plan === 'pro'
                    ? 'Paket Pro mendukung hingga maksimal 5 anggota tim.'
                    : 'Paket Standar mendukung hingga maksimal 2 anggota tim.'}
                </p>
              </div>
              {isQuotaReached && (
                <Badge variant="warning">Kuota Penuh</Badge>
              )}
            </div>

            {isQuotaReached && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                <span>
                  Kuota anggota tim untuk paket ini sudah penuh. Upgrade ke Paket Pro untuk menambah hingga 5 pengguna.
                </span>
              </div>
            )}

            <h3 className="font-bold text-base text-navy-900 dark:text-ivory-100">
              Undang Anggota Tim / Kasir Toko
            </h3>

            <form onSubmit={handleInviteStaff} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6">
                <Input
                  label="Email Staf"
                  placeholder="nama.staf@gmail.com"
                  type="email"
                  required
                  disabled={isQuotaReached}
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-navy-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  Peran
                </label>
                <select
                  disabled={isQuotaReached}
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as 'owner' | 'staff')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-ivory-100 disabled:opacity-50"
                >
                  <option value="staff">Staff / Kasir</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isQuotaReached}
                  isLoading={isInviting}
                  className="w-full"
                  leftIcon={<UserPlus className="w-4 h-4" strokeWidth={1.5} />}
                >
                  Kirim Undangan
                </Button>
              </div>
            </form>
          </Card>

          <Card className="space-y-3">
            <h4 className="font-bold text-sm text-navy-900 dark:text-ivory-100">
              Daftar Anggota Tim Toko ({currentStoreMembers.length})
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-navy-800">
              {currentStoreMembers.map((member) => (
                <div key={member.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-navy-800 flex items-center justify-center font-bold text-navy-900 dark:text-ivory-100">
                      {(member.user_email || member.invited_email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-navy-900 dark:text-ivory-100">
                        {member.user_email || member.invited_email}
                      </p>
                      <p className="text-slate-400">
                        Peran: <span className="uppercase font-semibold">{member.role}</span>
                      </p>
                    </div>
                  </div>
                  <Badge variant={member.status === 'active' ? 'success' : 'default'}>
                    {member.status === 'active' ? 'Aktif' : 'Terkirim (Menunggu)'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Modal Daftar Pelanggan per Tahap Siklus (Revisi Dashboard Toko Butir 1) */}
      <Modal
        isOpen={Boolean(selectedStageModal)}
        onClose={() => setSelectedStageModal(null)}
        title={`Daftar Pelanggan Tahap ${selectedStageModal || ''} (${stageModalCustomers.length} Orang)`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" strokeWidth={1.5} />
            <Input
              placeholder="Cari nama, WhatsApp, ukuran favorit, warna..."
              value={stageModalSearch}
              onChange={e => setStageModalSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-navy-800">
            {stageModalCustomers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada pelanggan yang ditemukan pada tahap {selectedStageModal}
                {stageModalSearch ? ' dengan kata kunci tersebut' : ''}.
              </div>
            ) : (
              stageModalCustomers.map(cust => (
                <div
                  key={cust.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-navy-800/30 px-2 rounded-xl transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-navy-900 dark:text-ivory-100">
                        {cust.name}
                      </p>
                      <Badge
                        variant={
                          cust.stage === 'Baru'
                            ? 'default'
                            : cust.stage === 'Aktif'
                            ? 'success'
                            : cust.stage === 'Setia'
                            ? 'purple'
                            : 'warning'
                        }
                      >
                        {cust.stage}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 font-mono">
                      {cust.phone_wa}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>Total Belanja: {formatRupiah(cust.total_spend || 0)}</span>
                      <span>•</span>
                      <span>{cust.order_count || 0} Pesanan</span>
                      {(cust.favorite_size || cust.favorite_color) && (
                        <>
                          <span>•</span>
                          <span>
                            Favorit: {[cust.favorite_size, cust.favorite_color].filter(Boolean).join(' / ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Profil Pelanggan Link - Selalu ada */}
                    <Link
                      href={`/customers/${cust.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-xs font-semibold text-navy-900 dark:text-ivory-100 transition shadow-sm"
                    >
                      <span>Lihat Profil</span>
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </Link>

                    {/* Tombol WhatsApp: HANYA untuk pelanggan tahap TIDUR, tahap lain TIDAK ADA */}
                    {selectedStageModal === 'Tidur' && (
                      <a
                        href={getSleepingWaLink(cust)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                        title="Langsung chat WhatsApp untuk ajak kembali"
                      >
                        <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>Chat WA</span>
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-navy-800 flex justify-between items-center text-xs text-slate-400">
            <span>
              Menampilkan {stageModalCustomers.length} pelanggan
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStageModal(null)}
            >
              Tutup
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
