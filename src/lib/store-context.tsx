'use client';

// ==============================================================================
// THREADLY - Core Application State & Realtime Context
// ==============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Customer,
  Product,
  ProductVariant,
  Order,
  OrderStatus,
  StockMovement,
  FollowupTask,
  Store,
  StoreMember,
  Profile,
  AuditLog,
  AiRunLog,
} from '@/types';
import { calculateCustomerStage, buildWhatsAppLink } from '@/lib/utils';
import { enforceChatEmojis } from '@/lib/llm/provider';

export interface ImpersonationSession {
  isActive: boolean;
  originalAdminEmail: string;
  targetStoreId: string;
  targetStoreName: string;
  reason: string;
  startedAt: string;
}

export interface PlatformStats {
  totalStores: number;
  activeStores: number;
  totalCustomers: number;
  totalOrders: number;
  totalAiRuns: number;
  totalAiTokens: number;
  storeStats: Record<string, { customers: number; products: number; orders: number }>;
}

export interface StoreContextType {
  // Current user & Store
  currentUser: Profile | null;
  currentStore: Store | null;
  allStores: Store[];
  storeMembers: StoreMember[];
  isOwner: boolean;
  isSuperadmin: boolean;
  impersonation: ImpersonationSession | null;

  // Data states (scoped to currentStore)
  customers: Customer[];
  products: Product[];
  orders: Order[];
  stockMovements: StockMovement[];
  followupTasks: FollowupTask[];
  auditLogs: AuditLog[];
  aiRuns: AiRunLog[];

  // Realtime notification toast
  lastRealtimeNotification: string | null;
  clearNotification: () => void;

  // User & Store Actions
  login: (email: string, role?: 'owner' | 'staff', isSuper?: boolean) => Promise<boolean>;
  logout: () => void;
  isEmailRegistered: (email: string) => boolean;
  registerAndCreateStore: (data: { email: string; fullName: string; storeName?: string }) => Promise<{ profile: Profile; store: Store }>;
  createStore: (storeData: Partial<Store>) => Promise<Store>;
  updateStoreSettings: (settings: Partial<Store>) => Promise<void>;
  updateStorePlan: (storeId: string, newPlan: 'standar' | 'pro', reason: string) => Promise<void>;
  switchStore: (storeId: string) => void;
  impersonateStore: (storeId: string, reason: string) => Promise<void>;
  exitImpersonation: () => void;

  // Customer Actions
  addCustomer: (customerData: Partial<Customer>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  checkDuplicateCustomerPhone: (phone: string, excludeId?: string) => Customer | undefined;

  // Product Actions
  addProduct: (productData: Partial<Product>, variants: Partial<ProductVariant>[]) => Promise<Product>;
  updateProduct: (id: string, productData: Partial<Product>, variantsData?: Partial<ProductVariant>[]) => Promise<Product>;
  adjustVariantStock: (variantId: string, delta: number, reason: string, targetStoreId?: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getStoreProducts: (storeId: string) => Product[];

  // Order Actions
  createOrder: (orderData: Partial<Order>, items: any[], targetStoreId?: string) => Promise<Order>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;

  // Follow-up Actions
  completeFollowupTask: (taskId: string) => Promise<void>;
  dismissFollowupTask: (taskId: string) => Promise<void>;
  generateFollowupTasks: () => void;

  // AI Run Logging
  logAiRun: (runData: Omit<AiRunLog, 'id' | 'created_at'>) => void;

  // Super Admin Store Toggle & Platform Aggregates
  toggleStoreStatus: (storeId: string, newStatus: 'active' | 'inactive', reason: string) => Promise<void>;
  getPlatformStats: () => PlatformStats;
  getAllPlatformOrders: () => Order[];

  // Development Seed Loader
  loadSeedData: () => Promise<boolean>;

  // Customer Stage Recalculation & Team
  recalculateAllCustomerStages: (thresholds?: {
    activeDays: number;
    loyalOrders: number;
    loyalDays: number;
    sleepingDays: number;
  }) => Promise<{ active: number; loyal: number; sleeping: number; newCount: number }>;
  inviteMember: (email: string, role: 'owner' | 'staff') => Promise<StoreMember>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const STORAGE_KEYS = {
  USER: 'threadly_user',
  STORE_MEMBERS: 'threadly_store_members',
  CURRENT_STORE_ID: 'threadly_current_store_id',
  STORES: 'threadly_stores',
  CUSTOMERS: 'threadly_customers',
  PRODUCTS: 'threadly_products',
  VARIANTS: 'threadly_variants',
  ORDERS: 'threadly_orders',
  STOCK_MOVEMENTS: 'threadly_stock_movements',
  FOLLOWUP_TASKS: 'threadly_followup_tasks',
  AUDIT_LOGS: 'threadly_audit_logs',
  AI_RUNS: 'threadly_ai_runs',
  IMPERSONATION: 'threadly_impersonation',
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [storeMembers, setStoreMembers] = useState<StoreMember[]>([]);
  const [impersonation, setImpersonation] = useState<ImpersonationSession | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [followupTasks, setFollowupTasks] = useState<FollowupTask[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [aiRuns, setAiRuns] = useState<AiRunLog[]>([]);
  const [lastRealtimeNotification, setLastRealtimeNotification] = useState<string | null>(null);

  // Load collections for a specific store into active state
  const loadStoreData = useCallback((storeId: string) => {
    try {
      const rawCust = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const allCust: Customer[] = rawCust ? JSON.parse(rawCust) : [];
      setCustomers(allCust.filter(c => c.store_id === storeId));

      const rawProd = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const allProd: Product[] = rawProd ? JSON.parse(rawProd) : [];
      setProducts(allProd.filter(p => p.store_id === storeId));

      const rawOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const allOrders: Order[] = rawOrders ? JSON.parse(rawOrders) : [];
      setOrders(allOrders.filter(o => o.store_id === storeId));

      const rawStock = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
      const allStock: StockMovement[] = rawStock ? JSON.parse(rawStock) : [];
      setStockMovements(allStock.filter(s => s.store_id === storeId));

      const rawTasks = localStorage.getItem(STORAGE_KEYS.FOLLOWUP_TASKS);
      const allTasks: FollowupTask[] = rawTasks ? JSON.parse(rawTasks) : [];
      setFollowupTasks(allTasks.filter(t => t.store_id === storeId));

      const rawAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const allAudit: AuditLog[] = rawAudit ? JSON.parse(rawAudit) : [];
      setAuditLogs(allAudit);

      const rawAi = localStorage.getItem(STORAGE_KEYS.AI_RUNS);
      const allAi: AiRunLog[] = rawAi ? JSON.parse(rawAi) : [];
      setAiRuns(allAi);
    } catch (err) {
      console.error('Error loading store data:', err);
    }
  }, []);

  // Programmatically load development seed data from /api/seed
  const loadSeedData = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/seed');
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.stores || !Array.isArray(data.stores)) return false;

      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(data.stores));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products || []));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers || []));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.orders || []));
      localStorage.setItem(STORAGE_KEYS.STORE_MEMBERS, JSON.stringify(data.storeMembers || []));
      if (Array.isArray(data.aiRuns)) {
        localStorage.setItem(STORAGE_KEYS.AI_RUNS, JSON.stringify(data.aiRuns));
        setAiRuns(data.aiRuns);
      }

      setAllStores(data.stores);
      setStoreMembers(data.storeMembers || []);

      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      let user: Profile | null = storedUser ? JSON.parse(storedUser) : null;
      if (!user) {
        // Default to first owner account
        user = data.users?.[1] || {
          id: 'usr_owner_koleksi',
          email: 'owner.koleksilokal@threadly.id',
          full_name: 'Dian Sastrowardoyo',
          is_superadmin: false,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
      setCurrentUser(user);

      // Super admin has no store membership; regular users adhere to 1 User = 1 Store
      let initialStore: Store | null = null;
      if (user && !user.is_superadmin) {
        const membership = (data.storeMembers || []).find(
          (m: StoreMember) => m.user_id === user.id || m.user_email?.toLowerCase() === user.email.toLowerCase()
        );
        if (membership) {
          initialStore = data.stores.find((s: Store) => s.id === membership.store_id) || data.stores[0];
        } else {
          initialStore = data.stores[0];
        }
      }

      if (initialStore) {
        setCurrentStore(initialStore);
        localStorage.setItem(STORAGE_KEYS.CURRENT_STORE_ID, initialStore.id);
        loadStoreData(initialStore.id);
      } else {
        setCurrentStore(null);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STORE_ID);
      }
      return true;
    } catch {
      return false;
    }
  }, [loadStoreData]);

  // Initialize data on mount
  useEffect(() => {
    try {
      const storedStores = localStorage.getItem(STORAGE_KEYS.STORES);
      let loadedStores: Store[] = storedStores ? JSON.parse(storedStores) : [];

      const storedMembers = localStorage.getItem(STORAGE_KEYS.STORE_MEMBERS);
      let loadedMembers: StoreMember[] = storedMembers ? JSON.parse(storedMembers) : [];
      setStoreMembers(loadedMembers);

      const rawAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (rawAudit) {
        setAuditLogs(JSON.parse(rawAudit));
      }

      const rawAi = localStorage.getItem(STORAGE_KEYS.AI_RUNS);
      if (rawAi) {
        setAiRuns(JSON.parse(rawAi));
      } else if (loadedStores.length > 0) {
        fetch('/api/seed')
          .then(r => (r.ok ? r.json() : null))
          .then(data => {
            if (data && Array.isArray(data.aiRuns)) {
              localStorage.setItem(STORAGE_KEYS.AI_RUNS, JSON.stringify(data.aiRuns));
              setAiRuns(data.aiRuns);
            }
          })
          .catch(() => {});
      }

      if (loadedStores.length > 0) {
        setAllStores(loadedStores);

        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const user: Profile | null = storedUser ? JSON.parse(storedUser) : null;
        if (user) {
          setCurrentUser(user);
        }

        const storedCurrentStoreId = localStorage.getItem(STORAGE_KEYS.CURRENT_STORE_ID);
        let active: Store | undefined;

        if (user && user.is_superadmin) {
          // Super admin is not part of any store
          setCurrentStore(null);
          localStorage.removeItem(STORAGE_KEYS.CURRENT_STORE_ID);
        } else {
          if (user) {
            // Strict 1 User = 1 Store resolution
            const membership = loadedMembers.find(
              m => m.user_id === user.id || m.user_email?.toLowerCase() === user.email.toLowerCase()
            );
            if (membership) {
              active = loadedStores.find(s => s.id === membership.store_id);
            }
          }

          if (!active) {
            active = loadedStores.find(s => s.id === storedCurrentStoreId) || loadedStores[0];
          }

          if (active) {
            setCurrentStore(active);
            loadStoreData(active.id);
          }
        }
      } else {
        // Attempt to load seed data dynamically from /api/seed
        loadSeedData();
      }

      // Check active impersonation
      const storedImpersonation = localStorage.getItem(STORAGE_KEYS.IMPERSONATION);
      if (storedImpersonation) {
        setImpersonation(JSON.parse(storedImpersonation));
      }
    } catch (e) {
      console.error('Error initializing store context:', e);
    }
  }, [loadSeedData, loadStoreData]);

  // Listen to cross-tab BroadcastChannel for Realtime Storefront Orders
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('threadly_realtime_events');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_ORDER' && event.data?.storeId === currentStore?.id) {
          setLastRealtimeNotification(
            `Pesanan baru masuk dari etalase publik! Nomor: #${event.data.orderNumber} oleh ${event.data.customerName}`
          );
          if (currentStore) {
            loadStoreData(currentStore.id);
          }
        }
      };
    } catch {
      // BroadcastChannel not available in non-standard environments
    }

    return () => {
      bc?.close();
    };
  }, [currentStore, loadStoreData]);

  const clearNotification = () => setLastRealtimeNotification(null);

  // Authentication & Onboarding
  const login = async (email: string, role: 'owner' | 'staff' = 'owner', isSuper: boolean = false) => {
    // Satu-satunya akun superadmin resmi adalah andariftri7@gmail.com
    const isSuperadminUser = email.toLowerCase().trim() === 'andariftri7@gmail.com';

    const rawMembers = localStorage.getItem(STORAGE_KEYS.STORE_MEMBERS);
    const members: StoreMember[] = rawMembers ? JSON.parse(rawMembers) : storeMembers;

    const existingMember = members.find(
      m => m.user_email?.toLowerCase() === email.toLowerCase() || m.invited_email?.toLowerCase() === email.toLowerCase()
    );

    const profile: Profile = {
      id: existingMember ? existingMember.user_id : (isSuperadminUser ? 'usr_admin' : `usr_${Date.now()}`),
      email,
      full_name: isSuperadminUser ? 'Super Admin Threadly' : email.split('@')[0],
      is_superadmin: isSuperadminUser,
      created_at: new Date().toISOString(),
    };

    setCurrentUser(profile);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));

    // Simpan cookie sesi terenkapsulasi untuk validasi middleware sisi server
    if (typeof document !== 'undefined') {
      const authPayload = {
        email: profile.email,
        is_superadmin: isSuperadminUser,
        email_verified: true,
        valid: true,
      };
      document.cookie = `threadly_auth=${encodeURIComponent(JSON.stringify(authPayload))}; path=/; max-age=86400; SameSite=Lax`;
    }

    if (isSuperadminUser) {
      // Super admin TIDAK boleh memiliki data toko atau keanggotaan toko
      setCurrentStore(null);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STORE_ID);
      setCustomers([]);
      setProducts([]);
      setOrders([]);
      setStockMovements([]);
      setFollowupTasks([]);
      const rawAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (rawAudit) setAuditLogs(JSON.parse(rawAudit));
      const rawAi = localStorage.getItem(STORAGE_KEYS.AI_RUNS);
      if (rawAi) {
        setAiRuns(JSON.parse(rawAi));
      } else {
        fetch('/api/seed')
          .then(r => (r.ok ? r.json() : null))
          .then(data => {
            if (data && Array.isArray(data.aiRuns)) {
              localStorage.setItem(STORAGE_KEYS.AI_RUNS, JSON.stringify(data.aiRuns));
              setAiRuns(data.aiRuns);
            }
          })
          .catch(() => {});
      }
    } else {
      // Regular user: strict 1 user = 1 store isolation
      if (existingMember) {
        const userStore = allStores.find(s => s.id === existingMember.store_id);
        if (userStore) {
          setCurrentStore(userStore);
          localStorage.setItem(STORAGE_KEYS.CURRENT_STORE_ID, userStore.id);
          loadStoreData(userStore.id);
        }
      } else {
        // No store registered yet
        setCurrentStore(null);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STORE_ID);
        setCustomers([]);
        setProducts([]);
        setOrders([]);
        setStockMovements([]);
        setFollowupTasks([]);
      }
    }

    return true;
  };

  const isEmailRegistered = useCallback((emailToCheck: string): boolean => {
    if (!emailToCheck) return false;
    const clean = emailToCheck.toLowerCase().trim();
    if (clean === 'andariftri7@gmail.com') return true;

    try {
      const rawMembers = localStorage.getItem(STORAGE_KEYS.STORE_MEMBERS);
      const members: StoreMember[] = rawMembers ? JSON.parse(rawMembers) : storeMembers;
      const found = members.some(
        m => m.user_email?.toLowerCase().trim() === clean || m.invited_email?.toLowerCase().trim() === clean
      );
      if (found) return true;

      const rawUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.email?.toLowerCase().trim() === clean) return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [storeMembers]);

  const registerAndCreateStore = async ({
    email,
    fullName,
    storeName,
  }: {
    email: string;
    fullName: string;
    storeName?: string;
  }): Promise<{ profile: Profile; store: Store }> => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'andariftri7@gmail.com') {
      throw new Error('Alamat email super admin dilindungi.');
    }

    const profile: Profile = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      full_name: fullName.trim() || cleanEmail.split('@')[0],
      is_superadmin: false,
      created_at: new Date().toISOString(),
    };

    const effectiveStoreName = storeName?.trim() || `Butik ${profile.full_name}`;
    const slug = effectiveStoreName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const storeId = `store_${Date.now()}`;
    const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000).toISOString();

    const newStore: Store = {
      id: storeId,
      name: effectiveStoreName,
      slug: slug || `toko-${Date.now()}`,
      logo_url: '',
      description: 'Butik Fashion UMKM Indonesia',
      phone_wa: '081234567890',
      address: 'Indonesia',
      status: 'active',
      plan: 'standar',
      trial_ends_at: sevenDaysFromNow,
      active_threshold_days: 60,
      loyal_threshold_orders: 3,
      loyal_threshold_days: 90,
      sleeping_threshold_days: 60,
      ai_persona: 'Ramah, santai, empatik khas fashion advisor butik lokal.',
      msg_template_followup_sleeping: 'Halo Kak {nama}! Kami kangen nih di {toko}. Ada koleksi baru lho!',
      msg_template_unpaid_order: 'Halo Kak {nama}! Pesanan {produk} di {toko} menunggu pembayaran ya.',
      msg_template_birthday: 'Selamat ulang tahun Kak {nama}! Dapatkan diskon spesial hari ini.',
      msg_template_restock: 'Kabar gembira Kak {nama}! Varian busana favoritmu sudah restock!',
      message_emoji_style: 'bebas',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newMember: StoreMember = {
      id: `mem_${Date.now()}`,
      store_id: storeId,
      user_id: profile.id,
      user_email: profile.email,
      role: 'owner',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const rawStores = localStorage.getItem(STORAGE_KEYS.STORES);
    const currentStores: Store[] = rawStores ? JSON.parse(rawStores) : allStores;
    const updatedStores = [...currentStores, newStore];
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(updatedStores));
    setAllStores(updatedStores);

    const rawMembers = localStorage.getItem(STORAGE_KEYS.STORE_MEMBERS);
    const currentMembers: StoreMember[] = rawMembers ? JSON.parse(rawMembers) : storeMembers;
    const updatedMembers = [...currentMembers, newMember];
    localStorage.setItem(STORAGE_KEYS.STORE_MEMBERS, JSON.stringify(updatedMembers));
    setStoreMembers(updatedMembers);

    setCurrentUser(profile);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));

    setCurrentStore(newStore);
    localStorage.setItem(STORAGE_KEYS.CURRENT_STORE_ID, newStore.id);

    if (typeof document !== 'undefined') {
      const authPayload = {
        email: profile.email,
        is_superadmin: false,
        email_verified: true,
        valid: true,
      };
      document.cookie = `threadly_auth=${encodeURIComponent(JSON.stringify(authPayload))}; path=/; max-age=86400; SameSite=Lax`;
    }

    setCustomers([]);
    setProducts([]);
    setOrders([]);
    setStockMovements([]);
    setFollowupTasks([]);

    return { profile, store: newStore };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentStore(null);
    setCustomers([]);
    setProducts([]);
    setOrders([]);
    setStockMovements([]);
    setFollowupTasks([]);
    setImpersonation(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STORE_ID);
    localStorage.removeItem(STORAGE_KEYS.IMPERSONATION);
    if (typeof document !== 'undefined') {
      document.cookie = 'threadly_auth=; path=/; max-age=0; SameSite=Lax';
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const createStore = async (storeData: Partial<Store>): Promise<Store> => {
    if (!currentUser) throw new Error('Silakan masuk terlebih dahulu.');

    // 1 User = 1 Store constraint check
    const rawMembers = localStorage.getItem(STORAGE_KEYS.STORE_MEMBERS);
    const members: StoreMember[] = rawMembers ? JSON.parse(rawMembers) : storeMembers;
    const existingMembership = members.find(
      m => m.user_id === currentUser.id || m.user_email?.toLowerCase() === currentUser.email.toLowerCase()
    );

    if (existingMembership && !currentUser.is_superadmin) {
      throw new Error('Akun ini sudah memiliki satu toko aktif. Setiap akun dibatasi maksimal satu toko.');
    }

    const slug = (storeData.slug || storeData.name || 'toko-baru')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-');

    const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000).toISOString();

    const newStore: Store = {
      id: `store_${Date.now()}`,
      name: storeData.name || 'Toko Fashion Baru',
      slug,
      logo_url: storeData.logo_url || '',
      description: storeData.description || 'Butik Fashion UMKM Indonesia',
      phone_wa: storeData.phone_wa || '08120000000',
      address: storeData.address || '',
      status: 'active',
      plan: storeData.plan || 'standar',
      trial_ends_at: storeData.trial_ends_at || sevenDaysFromNow,
      active_threshold_days: 60,
      loyal_threshold_orders: 3,
      loyal_threshold_days: 90,
      sleeping_threshold_days: 60,
      ai_persona: 'Ramah, santai, empatik khas fashion advisor butik lokal.',
      msg_template_followup_sleeping: 'Halo Kak {nama} tercinta! 🥰✨ Kami di {toko} kangen banget nih sama Kakak. Kebetulan koleksi baru ukuran {ukuran} warna {warna} baru saja restock lho! 👗✨ Yuk intip katalog kami di threadly.id/{toko_slug} sebelum sold out lagi ya kak! 💕🛍️',
      msg_template_unpaid_order: 'Halo Kak {nama}! 🙏✨ Mau konfirmasi untuk pesanan #{no_pesanan} ({produk}) yang super kece nih. Pembayarannya masih kami tunggu ya kak 💳✨ Ada kendala transfer atau butuh bantuan admin? Kami siap bantu dengan senang hati ya kak! 🥰📦',
      msg_template_birthday: 'Happy Birthday Kak {nama}! 🎂🎉🥳 Semoga panjang umur, sehat selalu, dan makin berkilau setiap hari! ✨ Di hari spesial ini, {toko} punya kado voucher diskon spesial 15% eksklusif buat Kakak lho 🎁💖 Yuk manjakan diri dengan outfit impianmu hari ini! 🛍️💃',
      msg_template_restock: 'Kabar gembira spesial buat Kak {nama}! 🎉✨ Busana favoritmu {produk} ukuran {ukuran} yang ditunggu-tunggu akhirnya RESTOCK lagi di {toko}! 😍👗 Stoknya limited banget lho kak, buruan amankan sebelum keduluan yang lain ya kak! 🏃‍♀️💨🛒',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store membership (1 user = 1 store)
    const newMember: StoreMember = {
      id: `mem_${Date.now()}`,
      store_id: newStore.id,
      user_id: currentUser.id,
      user_email: currentUser.email,
      role: 'owner',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    const updatedMembers = [...members, newMember];
    setStoreMembers(updatedMembers);
    localStorage.setItem(STORAGE_KEYS.STORE_MEMBERS, JSON.stringify(updatedMembers));

    const updated = [...allStores, newStore];
    setAllStores(updated);
    setCurrentStore(newStore);
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.CURRENT_STORE_ID, newStore.id);
    loadStoreData(newStore.id);
    return newStore;
  };

  const updateStoreSettings = async (settings: Partial<Store>) => {
    if (!currentStore) return;
    const updatedStore = { ...currentStore, ...settings, updated_at: new Date().toISOString() };
    const updatedList = allStores.map(s => (s.id === currentStore.id ? updatedStore : s));
    setAllStores(updatedList);
    setCurrentStore(updatedStore);
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(updatedList));
  };

  const switchStore = (storeId: string) => {
    // Row level isolation check: only superadmin or active impersonator can switch to other stores
    if (!currentUser?.is_superadmin && !impersonation?.isActive) {
      const rawMembers = localStorage.getItem(STORAGE_KEYS.STORE_MEMBERS);
      const members: StoreMember[] = rawMembers ? JSON.parse(rawMembers) : storeMembers;
      const membership = members.find(
        m => m.user_id === currentUser?.id || m.user_email?.toLowerCase() === currentUser?.email.toLowerCase()
      );
      if (membership && membership.store_id !== storeId) {
        console.warn(`[Threadly Security] Pengguna biasa (${currentUser?.email}) dilarang beralih ke toko ID ${storeId}. Isolasi toko aktif.`);
        return;
      }
    }

    const target = allStores.find(s => s.id === storeId);
    if (target) {
      setCurrentStore(target);
      localStorage.setItem(STORAGE_KEYS.CURRENT_STORE_ID, target.id);
      loadStoreData(target.id);
    }
  };

  const impersonateStore = async (storeId: string, reason: string) => {
    console.warn('[Threadly Privacy] Mode impersonasi dinonaktifkan demi privasi dan kerahasiaan data tenant.');
    throw new Error('Mode impersonasi dinonaktifkan demi perlindungan privasi data toko UMKM.');
  };

  const exitImpersonation = () => {
    setImpersonation(null);
    localStorage.removeItem(STORAGE_KEYS.IMPERSONATION);
  };

  // Customers Management
  const checkDuplicateCustomerPhone = (phone: string, excludeId?: string): Customer | undefined => {
    const clean = phone.replace(/[^0-9]/g, '');
    return customers.find(c => {
      if (excludeId && c.id === excludeId) return false;
      return c.phone_wa.replace(/[^0-9]/g, '') === clean;
    });
  };

  const addCustomer = async (data: Partial<Customer>): Promise<Customer> => {
    if (!currentStore) throw new Error('Toko belum dipilih');

    const newCustomer: Customer = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      store_id: currentStore.id,
      name: data.name || 'Pelanggan Baru',
      phone_wa: data.phone_wa || '',
      address: data.address || '',
      source: data.source || 'WhatsApp',
      birthdate: data.birthdate,
      favorite_size: data.favorite_size,
      favorite_color: data.favorite_color,
      preferred_style: data.preferred_style,
      budget_range: data.budget_range,
      notes: data.notes || '',
      tags: data.tags || [],
      total_spend: data.total_spend || 0,
      order_count: data.order_count || 0,
      average_order_value: data.average_order_value || 0,
      last_purchase_date: data.last_purchase_date,
      stage: data.stage || 'Baru',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const all: Customer[] = raw ? JSON.parse(raw) : [];
    all.push(newCustomer);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(all));

    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const all: Customer[] = raw ? JSON.parse(raw) : [];
    let updatedCustomer: Customer | undefined;

    const updatedAll = all.map(c => {
      if (c.id === id) {
        updatedCustomer = { ...c, ...updates, updated_at: new Date().toISOString() };
        return updatedCustomer;
      }
      return c;
    });

    if (!updatedCustomer) throw new Error('Pelanggan tidak ditemukan');

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedAll));
    setCustomers(prev => prev.map(c => (c.id === id ? updatedCustomer! : c)));
    return updatedCustomer;
  };

  const deleteCustomer = async (id: string) => {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const all: Customer[] = raw ? JSON.parse(raw) : [];
    const filtered = all.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(filtered));
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Products & Variants Management
  const getStoreProducts = useCallback((storeId: string): Product[] => {
    try {
      const rawProd = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const allProd: Product[] = rawProd ? JSON.parse(rawProd) : [];
      return allProd.filter(p => p.store_id === storeId && p.is_active);
    } catch {
      return [];
    }
  }, []);

  const addProduct = async (
    productData: Partial<Product>,
    variantsData: Partial<ProductVariant>[]
  ): Promise<Product> => {
    if (!currentStore) throw new Error('Toko belum dipilih');

    const productId = `prod_${Date.now()}`;
    const newVariants: ProductVariant[] = variantsData.map((v, idx) => ({
      id: `var_${Date.now()}_${idx}`,
      product_id: productId,
      store_id: currentStore.id,
      size: v.size || 'All Size',
      color: v.color || 'Standar',
      stock: Number(v.stock !== undefined ? v.stock : 0),
      min_stock_alert: Number(v.min_stock_alert !== undefined ? v.min_stock_alert : 3),
      sku: v.sku || `${productData.sku || 'SKU'}-${idx + 1}`,
      created_at: new Date().toISOString(),
    }));

    const newProduct: Product = {
      id: productId,
      store_id: currentStore.id,
      name: productData.name || 'Produk Fashion',
      sku: productData.sku || `PROD-${Date.now().toString().slice(-4)}`,
      category: productData.category || 'Atasan',
      price: Number(productData.price || 0),
      cost_price: productData.cost_price ? Number(productData.cost_price) : undefined,
      description: productData.description || '',
      image_url: productData.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
      is_active: productData.is_active !== undefined ? productData.is_active : true,
      variants: newVariants,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const allProd: Product[] = raw ? JSON.parse(raw) : [];
    allProd.push(newProduct);
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(allProd));
    } catch {
      newProduct.image_url = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80';
      allProd[allProd.length - 1] = newProduct;
      try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(allProd));
      } catch (e) {
        console.error('Storage error:', e);
      }
    }

    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  const updateProduct = async (
    id: string,
    productData: Partial<Product>,
    variantsData?: Partial<ProductVariant>[]
  ): Promise<Product> => {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const all: Product[] = raw ? JSON.parse(raw) : [];
    let updatedProd: Product | undefined;

    const next = all.map(p => {
      if (p.id === id) {
        let updatedVariants = p.variants;
        if (variantsData && variantsData.length > 0) {
          updatedVariants = variantsData.map((v, idx) => ({
            id: v.id || `var_${Date.now()}_${idx}`,
            product_id: id,
            store_id: p.store_id,
            size: v.size || 'All Size',
            color: v.color || 'Standar',
            stock: Number(v.stock !== undefined ? v.stock : 0),
            min_stock_alert: Number(v.min_stock_alert !== undefined ? v.min_stock_alert : 3),
            sku: v.sku || `${productData.sku || p.sku || 'SKU'}-${idx + 1}`,
            created_at: v.created_at || new Date().toISOString(),
          }));
        }
        updatedProd = {
          ...p,
          ...productData,
          variants: updatedVariants,
          updated_at: new Date().toISOString(),
        };
        return updatedProd;
      }
      return p;
    });

    if (!updatedProd) throw new Error('Produk tidak ditemukan');
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(next));
    } catch {
      if (updatedProd && updatedProd.image_url?.startsWith('data:')) {
        updatedProd.image_url = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80';
        const sanitizedNext = next.map(p => (p.id === id ? updatedProd! : p));
        try {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(sanitizedNext));
        } catch (e) {
          console.error('Storage error on update:', e);
        }
      }
    }
    setProducts(prev => prev.map(p => (p.id === id ? updatedProd! : p)));
    return updatedProd;
  };

  const adjustVariantStock = async (
    variantId: string,
    delta: number,
    reason: string,
    targetStoreId?: string
  ) => {
    const storeIdToUse = targetStoreId || currentStore?.id;
    if (!storeIdToUse) return;

    const rawProd = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const allProd: Product[] = rawProd ? JSON.parse(rawProd) : [];

    let foundProd: Product | undefined;
    let foundVariant: ProductVariant | undefined;

    for (const p of allProd) {
      if (p.variants) {
        const v = p.variants.find(item => item.id === variantId);
        if (v) {
          foundProd = p;
          foundVariant = v;
          break;
        }
      }
    }

    if (!foundProd || !foundVariant) return;

    const newStock = Math.max(0, foundVariant.stock + delta);
    const updatedTargetVariant: ProductVariant = { ...foundVariant, stock: newStock };

    const nextAllProducts = allProd.map(p => {
      if (p.id !== foundProd!.id || !p.variants) return p;
      return {
        ...p,
        variants: p.variants.map(v => (v.id === variantId ? updatedTargetVariant : v)),
      };
    });

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(nextAllProducts));

    if (currentStore?.id === foundProd.store_id) {
      setProducts(nextAllProducts.filter(p => p.store_id === currentStore.id));
    }

    // Record Stock Movement
    const movement: StockMovement = {
      id: `sm_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      store_id: foundProd.store_id,
      variant_id: variantId,
      variant_info: `${foundProd.name} (${updatedTargetVariant.size} / ${updatedTargetVariant.color})`,
      type: delta >= 0 ? 'in' : 'out',
      quantity: Math.abs(delta),
      balance_after: updatedTargetVariant.stock,
      notes: reason,
      created_at: new Date().toISOString(),
    };

    const rawMovements = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
    const allMovements: StockMovement[] = rawMovements ? JSON.parse(rawMovements) : [];
    allMovements.unshift(movement);
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(allMovements));

    if (currentStore?.id === foundProd.store_id) {
      setStockMovements(prev => [movement, ...prev]);
    }
  };

  const deleteProduct = async (id: string) => {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const all: Product[] = raw ? JSON.parse(raw) : [];
    const filtered = all.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Orders Management & Customer Stats Update
  const recalculateCustomerStats = (
    customerId: string,
    allOrders: Order[],
    currentThresholds: {
      activeDays: number;
      loyalOrders: number;
      loyalDays: number;
      sleepingDays: number;
    }
  ) => {
    const customerOrders = allOrders.filter(
      o => o.customer_id === customerId && o.status !== 'Batal'
    );
    const orderCount = customerOrders.length;
    const totalSpend = customerOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const averageOrderValue = orderCount > 0 ? totalSpend / orderCount : 0;

    let lastPurchaseDate: string | undefined;
    if (orderCount > 0) {
      const sorted = [...customerOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      lastPurchaseDate = sorted[0].created_at;
    }

    const stage = calculateCustomerStage(
      orderCount,
      lastPurchaseDate,
      currentThresholds.activeDays,
      currentThresholds.loyalOrders,
      currentThresholds.loyalDays,
      currentThresholds.sleepingDays
    );

    return { totalSpend, orderCount, averageOrderValue, lastPurchaseDate, stage };
  };

  const createOrder = async (
    orderData: Partial<Order>,
    items: any[],
    targetStoreId?: string
  ): Promise<Order> => {
    const storeIdToUse = targetStoreId || currentStore?.id;
    if (!storeIdToUse) throw new Error('Toko belum dipilih');

    const targetStore = allStores.find(s => s.id === storeIdToUse) || currentStore;
    if (!targetStore) throw new Error('Data toko tidak ditemukan');

    let customerId = orderData.customer_id;
    let customerName = orderData.customer_name || 'Pelanggan';
    let customerPhone = orderData.customer_phone || '';
    let customerAddress = orderData.customer_address || '';

    // Check or auto-create customer for this store
    const rawCust = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const allCust: Customer[] = rawCust ? JSON.parse(rawCust) : [];
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');

    const existing = allCust.find(
      c => c.store_id === storeIdToUse && c.phone_wa.replace(/[^0-9]/g, '') === cleanPhone
    );

    if (existing) {
      customerId = existing.id;
      customerName = existing.name;
    } else if (!customerId) {
      const newCust: Customer = {
        id: `cust_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        store_id: storeIdToUse,
        name: customerName,
        phone_wa: customerPhone,
        address: customerAddress,
        source: orderData.source === 'public_storefront' ? 'Toko Langsung' : 'WhatsApp',
        tags: [],
        total_spend: 0,
        order_count: 0,
        average_order_value: 0,
        stage: 'Baru',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      allCust.push(newCust);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(allCust));
      if (currentStore?.id === storeIdToUse) {
        setCustomers(prev => [...prev, newCust]);
      }
      customerId = newCust.id;
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const subtotal = items.reduce((sum, i) => sum + Number(i.subtotal || i.price * i.quantity), 0);
    const shipping = Number(orderData.shipping_cost || 0);
    const discount = Number(orderData.discount || 0);
    const total = Math.max(0, subtotal + shipping - discount);

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      store_id: storeIdToUse,
      order_number: orderNumber,
      customer_id: customerId!,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      status: orderData.status || 'Menunggu Pembayaran',
      subtotal,
      shipping_cost: shipping,
      discount,
      total_amount: total,
      payment_method: orderData.payment_method || 'Transfer Bank BCA',
      tracking_number: orderData.tracking_number || '',
      source: orderData.source || 'manual',
      notes: orderData.notes || '',
      items: items.map(item => ({
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        order_id: `ord_${Date.now()}`,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_name: item.variant_name || `${item.size || ''} / ${item.color || ''}`,
        price: Number(item.price),
        quantity: Number(item.quantity),
        subtotal: Number(item.subtotal || item.price * item.quantity),
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // If order confirmed immediately upon creation, deduct variant stock
    if (newOrder.status !== 'Menunggu Pembayaran' && newOrder.status !== 'Batal') {
      for (const item of newOrder.items || []) {
        await adjustVariantStock(item.variant_id, -item.quantity, `Dipotong pesanan #${orderNumber}`, storeIdToUse);
      }
    }

    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const allOrders: Order[] = raw ? JSON.parse(raw) : [];
    allOrders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(allOrders));

    if (currentStore?.id === storeIdToUse) {
      setOrders(prev => [newOrder, ...prev]);
    }

    // Recalculate customer statistics
    const stats = recalculateCustomerStats(customerId!, allOrders, {
      activeDays: targetStore.active_threshold_days,
      loyalOrders: targetStore.loyal_threshold_orders,
      loyalDays: targetStore.loyal_threshold_days,
      sleepingDays: targetStore.sleeping_threshold_days,
    });
    await updateCustomer(customerId!, stats);

    // Broadcast event
    try {
      const bc = new BroadcastChannel('threadly_realtime_events');
      bc.postMessage({
        type: 'NEW_ORDER',
        storeId: storeIdToUse,
        orderNumber,
        customerName,
      });
      bc.close();
    } catch {
      // ignore
    }

    return newOrder;
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order> => {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const allOrders: Order[] = raw ? JSON.parse(raw) : [];
    let updatedOrder: Order | undefined;

    const nextOrders = allOrders.map(o => {
      if (o.id === orderId) {
        updatedOrder = { ...o, ...updates, updated_at: new Date().toISOString() };
        return updatedOrder;
      }
      return o;
    });

    if (!updatedOrder) throw new Error('Pesanan tidak ditemukan');

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(nextOrders));
    setOrders(prev => prev.map(o => (o.id === orderId ? updatedOrder! : o)));
    return updatedOrder;
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!currentStore) return;
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder || targetOrder.status === newStatus) return;

    const oldStatus = targetOrder.status;

    // Stock deduction & return rules:
    const isConfirmed = (s: OrderStatus) => s !== 'Menunggu Pembayaran' && s !== 'Batal';

    // 1. Moving from non-confirmed -> confirmed: deduct stock
    if (!isConfirmed(oldStatus) && isConfirmed(newStatus)) {
      for (const item of targetOrder.items || []) {
        await adjustVariantStock(item.variant_id, -item.quantity, `Konfirmasi pesanan #${targetOrder.order_number}`);
      }
    }
    // 2. Moving from confirmed -> non-confirmed: return stock
    if (isConfirmed(oldStatus) && !isConfirmed(newStatus)) {
      for (const item of targetOrder.items || []) {
        await adjustVariantStock(item.variant_id, item.quantity, `Pengembalian stok pesanan #${targetOrder.order_number} (${newStatus})`);
      }
    }

    const updatedOrder: Order = {
      ...targetOrder,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const allOrders: Order[] = raw ? JSON.parse(raw) : [];
    const nextOrders = allOrders.map(o => (o.id === orderId ? updatedOrder : o));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(nextOrders));
    setOrders(prev => prev.map(o => (o.id === orderId ? updatedOrder : o)));

    // Recalculate customer statistics & stage
    const stats = recalculateCustomerStats(targetOrder.customer_id, nextOrders, {
      activeDays: currentStore.active_threshold_days,
      loyalOrders: currentStore.loyal_threshold_orders,
      loyalDays: currentStore.loyal_threshold_days,
      sleepingDays: currentStore.sleeping_threshold_days,
    });
    await updateCustomer(targetOrder.customer_id, stats);
  };

  // Follow-up Retention Tasks Automation
  const generateFollowupTasks = useCallback(() => {
    if (!currentStore) return;

    const generated: FollowupTask[] = [];

    // 1. Sleeping customers (Pelanggan Tidur)
    for (const cust of customers) {
      if (cust.stage === 'Tidur') {
        let text = (currentStore.msg_template_followup_sleeping || 'Halo Kak {nama} tercinta! 🥰✨ Kami di {toko} kangen banget nih sama Kakak. Kebetulan koleksi baru ukuran {ukuran} warna {warna} baru saja restock lho! 👗✨ Yuk intip katalog kami di threadly.id/{toko_slug} sebelum sold out lagi ya kak! 💕🛍️')
          .replace(/{nama}/g, cust.name)
          .replace(/{toko}/g, currentStore.name)
          .replace(/{toko_slug}/g, currentStore.slug)
          .replace(/{ukuran}/g, cust.favorite_size || 'M')
          .replace(/{warna}/g, cust.favorite_color || 'favorit');
        text = enforceChatEmojis(text, currentStore.message_emoji_style || 'bebas');

        generated.push({
          id: `task_sleep_${cust.id}`,
          store_id: currentStore.id,
          customer_id: cust.id,
          customer_name: cust.name,
          customer_phone: cust.phone_wa,
          type: 'sleeping_customer',
          title: `Ajak kembali ${cust.name}`,
          description: `Pelanggan tidak bertransaksi > ${currentStore.sleeping_threshold_days} hari. Ajak kembali dengan koleksi terbaru.`,
          status: 'pending',
          due_date: new Date().toISOString(),
          whatsapp_url: buildWhatsAppLink(cust.phone_wa, text),
          created_at: new Date().toISOString(),
        });
      }
    }

    // 2. Unpaid orders > 24 hours
    const now = Date.now();
    for (const ord of orders) {
      if (ord.status === 'Menunggu Pembayaran') {
        const orderTime = new Date(ord.created_at).getTime();
        const diffHours = (now - orderTime) / (1000 * 60 * 60);
        if (diffHours >= 24) {
          const itemSummary = ord.items?.map(i => i.product_name).join(', ') || 'pesanan busana';
          let text = (currentStore.msg_template_unpaid_order || 'Halo Kak {nama}! 🙏✨ Mau konfirmasi untuk pesanan #{no_pesanan} ({produk}) yang super kece nih. Pembayarannya masih kami tunggu ya kak 💳✨ Ada kendala transfer atau butuh bantuan admin? Kami siap bantu dengan senang hati ya kak! 🥰📦')
            .replace(/{nama}/g, ord.customer_name)
            .replace(/{no_pesanan}/g, ord.order_number)
            .replace(/{produk}/g, itemSummary)
            .replace(/{toko}/g, currentStore.name);
          text = enforceChatEmojis(text, currentStore.message_emoji_style || 'bebas');

          generated.push({
            id: `task_unpaid_${ord.id}`,
            store_id: currentStore.id,
            customer_id: ord.customer_id,
            customer_name: ord.customer_name,
            customer_phone: ord.customer_phone,
            order_id: ord.id,
            type: 'unpaid_order',
            title: `Follow up pembayaran #${ord.order_number}`,
            description: `Pesanan belum dibayar lebih dari 24 jam. Kirimkan pengingat ramah via WhatsApp.`,
            status: 'pending',
            due_date: new Date().toISOString(),
            whatsapp_url: buildWhatsAppLink(ord.customer_phone, text),
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // 3. Customer birthdays (Today or within 3 days)
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();

    for (const cust of customers) {
      if (cust.birthdate) {
        const b = new Date(cust.birthdate);
        if (b.getMonth() + 1 === todayMonth && Math.abs(b.getDate() - todayDate) <= 3) {
          let text = (currentStore.msg_template_birthday || 'Happy Birthday Kak {nama}! 🎂🎉🥳 Semoga panjang umur, sehat selalu, dan makin berkilau setiap hari! ✨ Di hari spesial ini, {toko} punya kado voucher diskon spesial 15% eksklusif buat Kakak lho 🎁💖 Yuk manjakan diri dengan outfit impianmu hari ini! 🛍️💃')
            .replace(/{nama}/g, cust.name)
            .replace(/{toko}/g, currentStore.name);
          text = enforceChatEmojis(text, currentStore.message_emoji_style || 'bebas');

          generated.push({
            id: `task_bday_${cust.id}`,
            store_id: currentStore.id,
            customer_id: cust.id,
            customer_name: cust.name,
            customer_phone: cust.phone_wa,
            type: 'birthday',
            title: `Ucapan Ulang Tahun: ${cust.name}`,
            description: `Pelanggan berulang tahun dalam waktu dekat. Kirimkan ucapan hangat & voucher diskon.`,
            status: 'pending',
            due_date: new Date().toISOString(),
            whatsapp_url: buildWhatsAppLink(cust.phone_wa, text),
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    // 4. Variant previously searched / preferred by customer is back in stock (Restock)
    for (const cust of customers) {
      if (cust.favorite_size || cust.favorite_color) {
        for (const prod of products) {
          if (!prod.is_active || !prod.variants) continue;
          const matchingVariant = prod.variants.find(v => {
            const sizeMatches = !cust.favorite_size || v.size.toLowerCase() === cust.favorite_size.toLowerCase();
            const colorMatches = !cust.favorite_color || v.color.toLowerCase().includes(cust.favorite_color.toLowerCase());
            return sizeMatches && colorMatches && v.stock > 0;
          });

          if (matchingVariant) {
            let text = (currentStore.msg_template_restock || 'Kabar gembira spesial buat Kak {nama}! 🎉✨ Busana favoritmu {produk} ukuran {ukuran} yang ditunggu-tunggu akhirnya RESTOCK lagi di {toko}! 😍👗 Stoknya limited banget lho kak, buruan amankan sebelum keduluan yang lain ya kak! 🏃‍♀️💨🛒')
              .replace(/{nama}/g, cust.name)
              .replace(/{produk}/g, prod.name)
              .replace(/{ukuran}/g, matchingVariant.size)
              .replace(/{warna}/g, matchingVariant.color)
              .replace(/{toko}/g, currentStore.name)
              .replace(/{toko_slug}/g, currentStore.slug);
            text = enforceChatEmojis(text, currentStore.message_emoji_style || 'bebas');

            generated.push({
              id: `task_restock_${cust.id}_${matchingVariant.id}`,
              store_id: currentStore.id,
              customer_id: cust.id,
              customer_name: cust.name,
              customer_phone: cust.phone_wa,
              type: 'restock',
              title: `Kabar Restock: ${prod.name} (${matchingVariant.size})`,
              description: `Varian favorit ${matchingVariant.size} / ${matchingVariant.color} untuk ${cust.name} sekarang ready (stok: ${matchingVariant.stock}). Hubungi sebelum habis!`,
              status: 'pending',
              due_date: new Date().toISOString(),
              whatsapp_url: buildWhatsAppLink(cust.phone_wa, text),
              created_at: new Date().toISOString(),
            });
            break; // One restock task per customer
          }
        }
      }
    }

    // Refresh tasks: preserve completed tasks and other stores, and refresh active pending tasks
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWUP_TASKS);
    const existing: FollowupTask[] = raw ? JSON.parse(raw) : [];

    const preserved = existing.filter(
      t => t.store_id !== currentStore.id || t.status === 'completed'
    );

    for (const g of generated) {
      const alreadyCompleted = preserved.some(
        p => p.id === g.id && p.store_id === g.store_id && p.status === 'completed'
      );
      if (!alreadyCompleted) {
        preserved.unshift(g);
      }
    }

    localStorage.setItem(STORAGE_KEYS.FOLLOWUP_TASKS, JSON.stringify(preserved));
    setFollowupTasks(preserved.filter(t => t.store_id === currentStore.id));
  }, [currentStore, customers, orders, products]);

  // Run follow-up generation whenever customers, orders, or products change
  useEffect(() => {
    if (customers.length > 0 || orders.length > 0) {
      generateFollowupTasks();
    }
  }, [customers.length, orders.length, products.length, generateFollowupTasks]);

  const completeFollowupTask = async (taskId: string) => {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWUP_TASKS);
    const all: FollowupTask[] = raw ? JSON.parse(raw) : [];
    const updated = all.map(t =>
      t.id === taskId ? { ...t, status: 'completed' as const, completed_at: new Date().toISOString() } : t
    );
    localStorage.setItem(STORAGE_KEYS.FOLLOWUP_TASKS, JSON.stringify(updated));
    setFollowupTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: 'completed' as const, completed_at: new Date().toISOString() } : t))
    );
  };

  const dismissFollowupTask = async (taskId: string) => {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLLOWUP_TASKS);
    const all: FollowupTask[] = raw ? JSON.parse(raw) : [];
    const updated = all.map(t => (t.id === taskId ? { ...t, status: 'dismissed' as const } : t));
    localStorage.setItem(STORAGE_KEYS.FOLLOWUP_TASKS, JSON.stringify(updated));
    setFollowupTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: 'dismissed' as const } : t)));
  };

  // Recalculate stages of all customers for current store
  const recalculateAllCustomerStages = async (
    thresholds?: {
      activeDays: number;
      loyalOrders: number;
      loyalDays: number;
      sleepingDays: number;
    }
  ) => {
    if (!currentStore) return { active: 0, loyal: 0, sleeping: 0, newCount: 0 };
    const th = thresholds || {
      activeDays: currentStore.active_threshold_days,
      loyalOrders: currentStore.loyal_threshold_orders,
      loyalDays: currentStore.loyal_threshold_days,
      sleepingDays: currentStore.sleeping_threshold_days,
    };

    const rawCust = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const allCust: Customer[] = rawCust ? JSON.parse(rawCust) : [];
    const rawOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    const allOrders: Order[] = rawOrders ? JSON.parse(rawOrders) : [];

    let active = 0;
    let loyal = 0;
    let sleeping = 0;
    let newCount = 0;

    const updatedAllCust = allCust.map(c => {
      if (c.store_id !== currentStore.id) return c;
      const stats = recalculateCustomerStats(c.id, allOrders, th);
      const stage = stats.stage;
      if (stage === 'Aktif') active++;
      else if (stage === 'Setia') loyal++;
      else if (stage === 'Tidur') sleeping++;
      else newCount++;

      return {
        ...c,
        ...stats,
        updated_at: new Date().toISOString(),
      };
    });

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedAllCust));
    setCustomers(updatedAllCust.filter(c => c.store_id === currentStore.id));
    return { active, loyal, sleeping, newCount };
  };

  // Team Invite Member
  const inviteMember = async (email: string, role: 'owner' | 'staff'): Promise<StoreMember> => {
    if (!currentStore) throw new Error('Toko belum dipilih');
    const rawMembers = localStorage.getItem(STORAGE_KEYS.STORE_MEMBERS);
    const allMembers: StoreMember[] = rawMembers ? JSON.parse(rawMembers) : storeMembers;

    const storeMems = allMembers.filter(m => m.store_id === currentStore.id);
    const maxUsers = currentStore.plan === 'pro' ? 5 : 2;

    if (storeMems.length >= maxUsers) {
      throw new Error(
        `Batas kuota anggota tim (${maxUsers} pengguna) telah tercapai untuk ${
          currentStore.plan === 'pro' ? 'Paket Pro' : 'Paket Standar'
        }.`
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = storeMems.find(
      m =>
        m.user_email?.toLowerCase() === cleanEmail ||
        m.invited_email?.toLowerCase() === cleanEmail
    );
    if (existing) {
      throw new Error('Email tersebut sudah terdaftar sebagai anggota atau undangan toko ini.');
    }

    const newMember: StoreMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      store_id: currentStore.id,
      user_id: `usr_invite_${Date.now()}`,
      user_email: cleanEmail,
      invited_email: cleanEmail,
      role,
      status: 'invited',
      created_at: new Date().toISOString(),
    };

    const nextMembers = [...allMembers, newMember];
    localStorage.setItem(STORAGE_KEYS.STORE_MEMBERS, JSON.stringify(nextMembers));
    setStoreMembers(nextMembers);
    return newMember;
  };

  // AI Run Logging
  const logAiRun = (data: Omit<AiRunLog, 'id' | 'created_at'>) => {
    const newLog: AiRunLog = {
      ...data,
      id: `ai_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const raw = localStorage.getItem(STORAGE_KEYS.AI_RUNS);
    const all: AiRunLog[] = raw ? JSON.parse(raw) : [];
    all.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AI_RUNS, JSON.stringify(all));
    setAiRuns(all);
  };

  // Superadmin Store Status Toggle & Platform Stats
  const toggleStoreStatus = async (storeId: string, newStatus: 'active' | 'inactive', reason: string) => {
    const target = allStores.find(s => s.id === storeId);
    if (!target) return;

    const updated = allStores.map(s => (s.id === storeId ? { ...s, status: newStatus } : s));
    setAllStores(updated);
    if (currentStore?.id === storeId) {
      setCurrentStore({ ...currentStore, status: newStatus });
    }
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(updated));

    // Audit log
    const audit: AuditLog = {
      id: `audit_${Date.now()}`,
      user_id: currentUser?.id || 'usr_superadmin',
      user_email: currentUser?.email || 'superadmin@threadly.id',
      action: 'toggle_store_status',
      target_store_id: storeId,
      target_store_name: target.name,
      reason,
      metadata: { oldStatus: target.status, newStatus },
      created_at: new Date().toISOString(),
    };
    const rawAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const audits: AuditLog[] = rawAudit ? JSON.parse(rawAudit) : [];
    audits.unshift(audit);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(audits));
    setAuditLogs(audits);
  };

  const updateStorePlan = async (storeId: string, newPlan: 'standar' | 'pro', reason: string) => {
    if (!reason || !reason.trim()) {
      throw new Error('Alasan perubahan paket wajib diisi.');
    }

    const target = allStores.find(s => s.id === storeId);
    if (!target) throw new Error('Toko tidak ditemukan.');

    const oldPlan = target.plan;
    const updatedStore: Store = { ...target, plan: newPlan, updated_at: new Date().toISOString() };
    const updated = allStores.map(s => (s.id === storeId ? updatedStore : s));
    setAllStores(updated);
    if (currentStore?.id === storeId) {
      setCurrentStore(updatedStore);
    }
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(updated));

    // Audit log
    const audit: AuditLog = {
      id: `audit_${Date.now()}`,
      user_id: currentUser?.id || 'usr_superadmin',
      user_email: currentUser?.email || 'admin@threadly.id',
      action: 'update_store_plan',
      target_store_id: storeId,
      target_store_name: target.name,
      reason,
      metadata: { old_plan: oldPlan, new_plan: newPlan },
      created_at: new Date().toISOString(),
    };
    const rawAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const audits: AuditLog[] = rawAudit ? JSON.parse(rawAudit) : [];
    audits.unshift(audit);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(audits));
    setAuditLogs(audits);
  };

  const getPlatformStats = useCallback((): PlatformStats => {
    try {
      const rawStores = localStorage.getItem(STORAGE_KEYS.STORES);
      const storesList: Store[] = rawStores ? JSON.parse(rawStores) : allStores;

      const rawCust = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const custsList: Customer[] = rawCust ? JSON.parse(rawCust) : [];

      const rawProd = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const prodsList: Product[] = rawProd ? JSON.parse(rawProd) : [];

      const rawOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const ordersList: Order[] = rawOrders ? JSON.parse(rawOrders) : [];

      const rawAi = localStorage.getItem(STORAGE_KEYS.AI_RUNS);
      const aiList: AiRunLog[] = rawAi ? JSON.parse(rawAi) : [];

      const storeStats: Record<string, { customers: number; products: number; orders: number }> = {};
      for (const s of storesList) {
        storeStats[s.id] = {
          customers: custsList.filter(c => c.store_id === s.id).length,
          products: prodsList.filter(p => p.store_id === s.id).length,
          orders: ordersList.filter(o => o.store_id === s.id).length,
        };
      }

      const totalAiTokens = aiList.reduce((sum, r) => sum + Number(r.total_tokens || 0), 0);

      return {
        totalStores: storesList.length,
        activeStores: storesList.filter(s => s.status === 'active').length,
        totalCustomers: custsList.length,
        totalOrders: ordersList.length,
        totalAiRuns: aiList.length,
        totalAiTokens,
        storeStats,
      };
    } catch {
      return {
        totalStores: allStores.length,
        activeStores: allStores.filter(s => s.status === 'active').length,
        totalCustomers: customers.length,
        totalOrders: orders.length,
        totalAiRuns: aiRuns.length,
        totalAiTokens: aiRuns.reduce((sum, r) => sum + Number(r.total_tokens || 0), 0),
        storeStats: {},
      };
    }
  }, [allStores, customers.length, orders.length, aiRuns]);

  const getAllPlatformOrders = useCallback((): Order[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return raw ? JSON.parse(raw) : orders;
    } catch {
      return orders;
    }
  }, [orders]);

  const isSuperadmin = Boolean(
    currentUser?.is_superadmin &&
    currentUser?.email?.toLowerCase().trim() === 'andariftri7@gmail.com'
  );
  const currentMember = storeMembers.find(
    m => (m.user_id === currentUser?.id || m.user_email?.toLowerCase() === currentUser?.email?.toLowerCase()) && m.store_id === currentStore?.id
  );
  const isOwner = Boolean(!isSuperadmin && (currentMember ? currentMember.role === 'owner' : true));

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        currentStore,
        allStores,
        storeMembers,
        isOwner,
        isSuperadmin,
        impersonation,
        customers,
        products,
        orders,
        stockMovements,
        followupTasks,
        auditLogs,
        aiRuns,
        lastRealtimeNotification,
        clearNotification,
        login,
        logout,
        isEmailRegistered,
        registerAndCreateStore,
        createStore,
        updateStoreSettings,
        updateStorePlan,
        switchStore,
        impersonateStore,
        exitImpersonation,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        checkDuplicateCustomerPhone,
        addProduct,
        updateProduct,
        adjustVariantStock,
        deleteProduct,
        getStoreProducts,
        createOrder,
        updateOrder,
        updateOrderStatus,
        completeFollowupTask,
        dismissFollowupTask,
        generateFollowupTasks,
        logAiRun,
        toggleStoreStatus,
        getPlatformStats,
        getAllPlatformOrders,
        loadSeedData,
        recalculateAllCustomerStages,
        inviteMember,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
