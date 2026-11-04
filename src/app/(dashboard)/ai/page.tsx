'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { defaultLLMProvider } from '@/lib/llm/provider';
import { ExtractedOrderData } from '@/types';
import { formatRupiah, formatDateWIB } from '@/lib/utils';
import { Card, Button, Input, Badge, useToast } from '@/components/ui';
import {
  PenLine,
  MessageSquare,
  ArrowRight,
  Copy,
  CheckCircle,
  AlertCircle,
  Save,
  RotateCcw,
  Bot,
  Sliders,
} from 'lucide-react';

export default function AiAssistantPage() {
  const router = useRouter();
  const { currentStore, products, createOrder, logAiRun, updateStoreSettings } = useStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'chat_to_order' | 'reply_composer' | 'persona'>('chat_to_order');

  // --- Feature 1: Chat to Order ---
  const [chatInput, setChatInput] = useState(
    `Halo kak, mau pesan Kemeja Linen Oversize Alana warna Broken White ukuran M dong 1 pcs.\nNama: Riska Amelia\nNo WA: 081288990011\nAlamat: Jl. Tebet Barat Dalam VII No. 3, Jakarta Selatan\nBisa kirim hari ini?`
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedOrderData | null>(null);
  const [aiNoticeMessage, setAiNoticeMessage] = useState<string | null>(null);
  const [isSavingExtracted, setIsSavingExtracted] = useState(false);

  const handleExtractOrder = async () => {
    if (!chatInput.trim()) return;
    setIsExtracting(true);
    setAiNoticeMessage(null);

    const res = await defaultLLMProvider.extractOrderFromChat(chatInput, products);
    if (res.message) {
      setAiNoticeMessage(res.message);
    }
    if (res.data) {
      setExtractedData(res.data);
      showToast('Data percakapan berhasil diekstrak', 'success');
    }

    logAiRun({
      store_id: currentStore?.id,
      feature_type: 'chat_to_order',
      prompt_tokens: 120,
      completion_tokens: 80,
      total_tokens: res.tokensUsed || 200,
      latency_ms: res.latencyMs || 150,
      status: res.success ? 'success' : 'failed',
    });

    setIsExtracting(false);
  };

  const handleConfirmAndSaveOrder = async () => {
    if (!extractedData) return;
    setIsSavingExtracted(true);

    try {
      // Find matching product and variant
      const matchedProduct =
        products.find(p => p.name.toLowerCase().includes(extractedData.product_name.toLowerCase())) ||
        products[0];
      const matchedVariant =
        matchedProduct?.variants?.find(
          v =>
            v.size.toLowerCase() === extractedData.size.toLowerCase() ||
            v.color.toLowerCase().includes(extractedData.color.toLowerCase())
        ) || matchedProduct?.variants?.[0];

      const created = await createOrder(
        {
          customer_name: extractedData.customer_name,
          customer_phone: extractedData.customer_phone,
          customer_address: extractedData.customer_address,
          status: 'Menunggu Pembayaran',
          shipping_cost: 15000,
          discount: 0,
          payment_method: 'Transfer Bank BCA',
          notes: extractedData.notes || 'Dibuat otomatis via Asisten AI Tempel Chat',
          source: 'manual',
        },
        [
          {
            product_id: matchedProduct?.id || 'prod_default',
            variant_id: matchedVariant?.id || 'var_default',
            product_name: matchedProduct?.name || extractedData.product_name,
            variant_name: `${extractedData.size} / ${extractedData.color}`,
            price: matchedProduct?.price || 150000,
            quantity: extractedData.quantity || 1,
            subtotal: (matchedProduct?.price || 150000) * (extractedData.quantity || 1),
          },
        ]
      );

      showToast('Pesanan berhasil dibuat dari chat', 'success');
      router.push(`/orders/${created.id}`);
    } catch (err: any) {
      showToast(`Gagal menyimpan: ${err.message}`, 'error');
    } finally {
      setIsSavingExtracted(false);
    }
  };

  // --- Feature 2: Smart Reply Composer ---
  const [inquiryInput, setInquiryInput] = useState(
    'Halo kak, kulot highwaist katun rayon yang warna hitam masih ready gak ya? Sama harganya berapa?'
  );
  const [isComposing, setIsComposing] = useState(false);
  const [composedReply, setComposedReply] = useState<string>('');

  const handleComposeReply = async () => {
    if (!inquiryInput.trim() || !currentStore) return;
    setIsComposing(true);

    // Build catalog context with accurate variants & prices
    const catalogContext = products
      .map(
        p =>
          `- ${p.name} (Kategori: ${p.category}, Harga: ${formatRupiah(p.price)}):\n  Varian: ${
            p.variants?.map(v => `${v.size} / ${v.color} (Stok: ${v.stock})`).join(', ') || 'Standar'
          }`
      )
      .join('\n');

    const res = await defaultLLMProvider.composeReply(
      inquiryInput,
      currentStore.name,
      currentStore.ai_persona,
      catalogContext,
      products,
      currentStore.message_emoji_style || 'bebas'
    );

    if (res.data) {
      setComposedReply(res.data);
      showToast('Draf balasan cerdas berhasil disusun', 'success');
    }
    if (res.message) {
      setAiNoticeMessage(res.message);
    }

    logAiRun({
      store_id: currentStore.id,
      feature_type: 'reply_composer',
      prompt_tokens: 150,
      completion_tokens: 90,
      total_tokens: res.tokensUsed || 240,
      latency_ms: res.latencyMs || 210,
      status: 'success',
    });

    setIsComposing(false);
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(composedReply);
    showToast('Tersalin ke papan klip', 'success');
  };

  // --- Feature 3: Persona Settings ---
  const [personaText, setPersonaText] = useState(
    currentStore?.ai_persona || 'Ramah, santai, empatik khas fashion advisor butik lokal Indonesia.'
  );
  const [emojiStyle, setEmojiStyle] = useState<'bebas' | 'minimal' | 'none'>(
    currentStore?.message_emoji_style || 'bebas'
  );
  const [isSavingPersona, setIsSavingPersona] = useState(false);

  // Sync state when currentStore updates
  useEffect(() => {
    if (currentStore?.ai_persona) {
      setPersonaText(currentStore.ai_persona);
    }
    if (currentStore?.message_emoji_style) {
      setEmojiStyle(currentStore.message_emoji_style);
    }
  }, [currentStore?.ai_persona, currentStore?.message_emoji_style]);

  const handleSavePersona = async () => {
    if (!currentStore) return;
    setIsSavingPersona(true);
    try {
      const nowIso = new Date().toISOString();
      await updateStoreSettings({
        ai_persona: personaText,
        message_emoji_style: emojiStyle,
        last_persona_updated_at: nowIso,
      });
      showToast('Persona dan pengaturan balasan berhasil disimpan', 'success');
    } catch (err: any) {
      showToast(`Gagal menyimpan: ${err.message}`, 'error');
    } finally {
      setIsSavingPersona(false);
    }
  };

  // Uji Balasan Panel
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
        personaText,
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <PenLine className="w-6 h-6 text-violet-500" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold text-card-foreground">
            Asisten AI
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Otomatisasi penginputan pesanan dari obrolan WhatsApp dan susun balasan cerdas berbasis katalog stok toko.
        </p>
      </div>

      {/* Notice Banner if LLM_API_KEY is fallback / configured */}
      {aiNoticeMessage && (
        <div className="p-3.5 bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/40 rounded-xl text-xs text-violet-700 dark:text-violet-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-violet-500" strokeWidth={1.5} />
          <span>{aiNoticeMessage}</span>
        </div>
      )}

      {/* Feature Navigation Tabs */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab('chat_to_order')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'chat_to_order'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-muted-foreground hover:text-navy-900 dark:hover:text-ivory-100'
          }`}
        >
          Tempel Chat Jadi Pesanan
        </button>
        <button
          onClick={() => setActiveTab('reply_composer')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'reply_composer'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-muted-foreground hover:text-navy-900 dark:hover:text-ivory-100'
          }`}
        >
          Penyusun Balasan Cerdas
        </button>
        <button
          onClick={() => setActiveTab('persona')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'persona'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-muted-foreground hover:text-navy-900 dark:hover:text-ivory-100'
          }`}
        >
          Persona &amp; Gaya Bahasa
        </button>
      </div>

      {/* TAB 1: Chat to Order */}
      {activeTab === 'chat_to_order' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <h3 className="font-bold text-base text-card-foreground">
                1. Tempel Percakapan WhatsApp / DM Pembeli
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI akan mengekstrak nama, kontak, produk, ukuran, warna, jumlah, dan alamat ke format terstruktur.
              </p>
            </div>

            <textarea
              rows={6}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Tempel riwayat chat dari pembeli di sini..."
              className="w-full p-3.5 text-xs rounded-xl border border-border bg-card text-card-foreground focus:border-violet-500"
            />

            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="md"
                onClick={handleExtractOrder}
                isLoading={isExtracting}
                leftIcon={<PenLine className="w-4 h-4" strokeWidth={1.5} />}
              >
                Ekstrak Data Pesanan
              </Button>
            </div>
          </Card>

          {/* Extracted Structured Output Confirmation */}
          {extractedData && (
            <Card className="space-y-4 border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10">
              <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                  <h3 className="font-bold text-base text-card-foreground">
                    2. Konfirmasi Data Pesanan Hasil Ekstraksi
                  </h3>
                </div>
                <Badge variant="success">Data Terstruktur</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Nama Pelanggan"
                  value={extractedData.customer_name}
                  onChange={e => setExtractedData({ ...extractedData, customer_name: e.target.value })}
                />
                <Input
                  label="Nomor WhatsApp"
                  value={extractedData.customer_phone}
                  onChange={e => setExtractedData({ ...extractedData, customer_phone: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Alamat Pengiriman"
                    value={extractedData.customer_address}
                    onChange={e => setExtractedData({ ...extractedData, customer_address: e.target.value })}
                  />
                </div>
                <Input
                  label="Nama Produk Busana"
                  value={extractedData.product_name}
                  onChange={e => setExtractedData({ ...extractedData, product_name: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    label="Ukuran"
                    value={extractedData.size}
                    onChange={e => setExtractedData({ ...extractedData, size: e.target.value })}
                  />
                  <Input
                    label="Warna"
                    value={extractedData.color}
                    onChange={e => setExtractedData({ ...extractedData, color: e.target.value })}
                  />
                  <Input
                    label="Jumlah"
                    type="number"
                    value={extractedData.quantity}
                    onChange={e => setExtractedData({ ...extractedData, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Catatan Tambahan"
                    value={extractedData.notes || ''}
                    onChange={e => setExtractedData({ ...extractedData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/40">
                <Button variant="outline" onClick={() => setExtractedData(null)}>
                  Batal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmAndSaveOrder}
                  isLoading={isSavingExtracted}
                  rightIcon={<ArrowRight className="w-4 h-4" strokeWidth={1.5} />}
                >
                  Konfirmasi &amp; Simpan Pesanan
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: Reply Composer */}
      {activeTab === 'reply_composer' && (
        <div className="space-y-6">
          <Card className="space-y-4">
            <div>
              <h3 className="font-bold text-base text-card-foreground">
                Pertanyaan dari Calon Pembeli
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Balasan disusun berdasarkan katalog stok toko yang aktif dengan persona ramah dan akurat.
              </p>
            </div>

            <textarea
              rows={4}
              value={inquiryInput}
              onChange={e => setInquiryInput(e.target.value)}
              placeholder="Tempel pertanyaan pembeli di sini..."
              className="w-full p-3.5 text-xs rounded-xl border border-border bg-card text-card-foreground focus:border-violet-500"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handleComposeReply}
                isLoading={isComposing}
                leftIcon={<PenLine className="w-4 h-4" strokeWidth={1.5} />}
              >
                Susun Balasan Cerdas
              </Button>
            </div>
          </Card>

          {composedReply && (
            <Card className="space-y-3 bg-violet-50/20 dark:bg-violet-950/10 border-violet-200 dark:border-violet-900/40">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h4 className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                  Draf Balasan yang Siap Dikirimkan
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleComposeReply}
                    isLoading={isComposing}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  >
                    Buat Ulang
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyReply}
                    leftIcon={<Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  >
                    Salin Balasan
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-card rounded-xl border border-border text-xs text-card-foreground leading-relaxed whitespace-pre-line">
                {composedReply}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: Persona Settings */}
      {activeTab === 'persona' && (
        <div className="space-y-6">
          <Card className="space-y-5">
            <div>
              <h3 className="font-bold text-base text-card-foreground">
                Persona &amp; Gaya Bahasa Asisten AI
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tentukan bagaimana AI toko kamu berkomunikasi menyapa pelanggan (misalnya: butik elegan, casual streetwear, atau sopan santun tradisi).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-card-foreground uppercase tracking-wide mb-1.5">
                Instruksi Karakter &amp; Nada Bicara
              </label>
              <textarea
                rows={4}
                value={personaText}
                onChange={e => setPersonaText(e.target.value)}
                className="w-full p-3.5 text-xs rounded-xl border border-border bg-card text-card-foreground focus:border-violet-500"
              />
            </div>

            {/* Emoji Style Setting */}
            <div>
              <label className="block text-xs font-semibold text-card-foreground uppercase tracking-wide mb-1.5">
                Emoji pada Pesan Chat
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setEmojiStyle('bebas')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    emojiStyle === 'bebas'
                      ? 'border-violet-500 bg-violet-50/50 dark:bg-navy-800 ring-1 ring-violet-500'
                      : 'border-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-card-foreground">
                      Emoji Bebas
                    </span>
                    {emojiStyle === 'bebas' && (
                      <Badge variant="purple">Aktif</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Bebas berekspresi tanpa batasan jumlah atau varian emoji.
                  </p>
                </div>

                <div
                  onClick={() => setEmojiStyle('minimal')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    emojiStyle === 'minimal'
                      ? 'border-violet-500 bg-violet-50/50 dark:bg-navy-800 ring-1 ring-violet-500'
                      : 'border-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-card-foreground">
                      Minimal (Maksimal 2)
                    </span>
                    {emojiStyle === 'minimal' && (
                      <Badge variant="purple">Aktif</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Hanya menggunakan emoji santun dan profesional dalam batas wajar.
                  </p>
                </div>

                <div
                  onClick={() => setEmojiStyle('none')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    emojiStyle === 'none'
                      ? 'border-violet-500 bg-violet-50/50 dark:bg-navy-800 ring-1 ring-violet-500'
                      : 'border-border hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-card-foreground">
                      Tanpa Emoji
                    </span>
                    {emojiStyle === 'none' && (
                      <Badge variant="purple">Aktif</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Pesan bersih murni teks formal tanpa ikon emotikon apapun.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
              <div>
                {currentStore?.last_persona_updated_at ? (
                  <span className="text-xs text-muted-foreground">
                    Terakhir disimpan: {formatDateWIB(currentStore.last_persona_updated_at)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Gaya bahasa ini digunakan saat menyusun balasan chat.
                  </span>
                )}
              </div>

              <Button
                variant="primary"
                onClick={handleSavePersona}
                isLoading={isSavingPersona}
                leftIcon={<Save className="w-4 h-4" strokeWidth={1.5} />}
              >
                Simpan Persona
              </Button>
            </div>
          </Card>

          {/* Panel Uji Balasan */}
          <Card className="space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="font-bold text-base text-card-foreground">
                Uji Balasan Persona
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Coba kirimkan pertanyaan untuk melihat bagaimana persona dan aturan emoji di atas diterapkan pada pesan balasan.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-card-foreground uppercase tracking-wide mb-1.5">
                Pertanyaan Simulasi
              </label>
              <textarea
                rows={2}
                value={testInquiry}
                onChange={e => setTestInquiry(e.target.value)}
                placeholder="Tulis pertanyaan uji coba di sini..."
                className="w-full p-3 text-xs rounded-xl border border-border bg-card text-card-foreground focus:border-violet-500"
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
              <div className="p-4 rounded-xl bg-muted/60/60 border border-border space-y-2">
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider block">
                  Hasil Pratinjau Balasan:
                </span>
                <p className="text-xs text-card-foreground leading-relaxed whitespace-pre-line">
                  {testReplyResult}
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
