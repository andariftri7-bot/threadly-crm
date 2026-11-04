-- ==============================================================================
-- THREADLY - B2B Fashion CRM Supabase Schema Migration
-- ==============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    is_superadmin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. STORES (Multi-tenant boundary)
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    phone_wa TEXT,
    address TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    -- Subscription Plan & 7-Day Trial
    plan TEXT NOT NULL DEFAULT 'standar' CHECK (plan IN ('standar', 'pro')),
    trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now() + interval '7 days'),
    -- Customer lifecycle thresholds
    active_threshold_days INT NOT NULL DEFAULT 60,
    loyal_threshold_orders INT NOT NULL DEFAULT 3,
    loyal_threshold_days INT NOT NULL DEFAULT 90,
    sleeping_threshold_days INT NOT NULL DEFAULT 60,
    -- AI Persona settings
    ai_persona TEXT NOT NULL DEFAULT 'Ramah, santai, empatik khas fashion advisor butik lokal Indonesia.',
    -- Follow-up WhatsApp message templates
    msg_template_followup_sleeping TEXT NOT NULL DEFAULT 'Halo {nama}! Kami kangen nih di {toko}. Kebetulan koleksi baru ukuran {ukuran} warna {warna} baru saja restock lho. Yuk cek katalog kami!',
    msg_template_unpaid_order TEXT NOT NULL DEFAULT 'Halo {nama}, pesananmu #{no_pesanan} untuk {produk} masih menunggu pembayaran nih. Butuh bantuan dengan metode transfernya?',
    msg_template_birthday TEXT NOT NULL DEFAULT 'Selamat ulang tahun {nama}! Ada kado diskon spesial 15% dari {toko} khusus untuk hari bahagiamu. Jangan lewatkan ya!',
    msg_template_restock TEXT NOT NULL DEFAULT 'Kabar gembira {nama}! {produk} ukuran {ukuran} favoritmu sekarang sudah kembali tersedia di {toko}. Pesan sekarang sebelum kehabisan ya!',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. STORE MEMBERS (Owner & Staff roles)
-- ATURAN KETAT: Satu akun pengguna hanya dapat tergabung pada satu toko (UNIQUE pada user_id)
CREATE TABLE IF NOT EXISTS public.store_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
    invited_email TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id) -- 1 Akun = 1 Toko
);

-- 4. CUSTOMERS (CRM)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_wa TEXT NOT NULL,
    address TEXT,
    source TEXT NOT NULL DEFAULT 'WhatsApp' CHECK (source IN ('WhatsApp', 'Instagram', 'TikTok', 'Shopee', 'Tokopedia', 'Toko Langsung', 'Lainnya')),
    birthdate DATE,
    favorite_size TEXT,
    favorite_color TEXT,
    preferred_style TEXT,
    budget_range TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    -- Automatic stats
    total_spend NUMERIC NOT NULL DEFAULT 0,
    order_count INT NOT NULL DEFAULT 0,
    average_order_value NUMERIC NOT NULL DEFAULT 0,
    last_purchase_date TIMESTAMPTZ,
    -- Automatic stage: Baru, Aktif, Setia, Tidur
    stage TEXT NOT NULL DEFAULT 'Baru' CHECK (stage IN ('Baru', 'Aktif', 'Setia', 'Tidur')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(store_id, phone_wa)
);

-- 5. PRODUCTS & VARIANTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT NOT NULL DEFAULT 'Pakaian',
    price NUMERIC NOT NULL DEFAULT 0,
    cost_price NUMERIC,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    min_stock_alert INT NOT NULL DEFAULT 3,
    sku TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'order_deduction', 'order_cancellation')),
    quantity INT NOT NULL,
    balance_after INT NOT NULL,
    reference_type TEXT,
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    status TEXT NOT NULL DEFAULT 'Menunggu Pembayaran' CHECK (status IN ('Menunggu Pembayaran', 'DP', 'Lunas', 'Dikemas', 'Dikirim', 'Selesai', 'Batal')),
    subtotal NUMERIC NOT NULL DEFAULT 0,
    shipping_cost NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'Transfer Bank',
    tracking_number TEXT,
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'public_storefront')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    product_name TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. FOLLOW-UP TASKS
CREATE TABLE IF NOT EXISTS public.followup_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('sleeping_customer', 'unpaid_order', 'birthday', 'restock')),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed')),
    due_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    whatsapp_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. AI RUNS LOG
CREATE TABLE IF NOT EXISTS public.ai_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    feature_type TEXT NOT NULL CHECK (feature_type IN ('chat_to_order', 'reply_composer', 'customer_summary')),
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    total_tokens INT NOT NULL DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. SUPER ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. FORWARD PREPARATION: CONVERSATIONS & MESSAGES (Architecture placeholder)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'shopee', 'tokopedia', 'tiktok_shop', 'direct')),
    external_chat_id TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    last_message_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'staff', 'bot')),
    content TEXT NOT NULL,
    external_message_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followup_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user member of store?
CREATE OR REPLACE FUNCTION public.is_member_of_store(store_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.store_members
        WHERE store_id = store_uuid
        AND user_id = auth.uid()
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: is current user superadmin?
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND is_superadmin = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: users read and update their own profile; superadmins can read all profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_superadmin());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Stores: members can read and update their store; public can view active stores (for storefronts)
CREATE POLICY "Store members can view store" ON public.stores
    FOR SELECT USING (public.is_member_of_store(id) OR status = 'active' OR public.is_superadmin());

CREATE POLICY "Store owners can update store" ON public.stores
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.store_members
            WHERE store_id = stores.id AND user_id = auth.uid() AND role = 'owner'
        ) OR public.is_superadmin()
    );

CREATE POLICY "Superadmins can manage stores" ON public.stores
    FOR ALL USING (public.is_superadmin());

-- Store members
CREATE POLICY "Members can view members in their store" ON public.store_members
    FOR SELECT USING (public.is_member_of_store(store_id) OR public.is_superadmin());

CREATE POLICY "Owners can manage members" ON public.store_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.store_members sm
            WHERE sm.store_id = store_members.store_id AND sm.user_id = auth.uid() AND sm.role = 'owner'
        ) OR public.is_superadmin()
    );

-- Customers
CREATE POLICY "Store members view customers" ON public.customers
    FOR SELECT USING (public.is_member_of_store(store_id));

CREATE POLICY "Store members insert customers" ON public.customers
    FOR INSERT WITH CHECK (public.is_member_of_store(store_id) OR true); -- allows public storefront checkout

CREATE POLICY "Store members update customers" ON public.customers
    FOR UPDATE USING (public.is_member_of_store(store_id));

CREATE POLICY "Store members delete customers" ON public.customers
    FOR DELETE USING (public.is_member_of_store(store_id));

-- Products & Variants: public can view active products on active stores
CREATE POLICY "View products" ON public.products
    FOR SELECT USING (public.is_member_of_store(store_id) OR is_active = true OR public.is_superadmin());

CREATE POLICY "Manage products" ON public.products
    FOR ALL USING (public.is_member_of_store(store_id));

CREATE POLICY "View variants" ON public.product_variants
    FOR SELECT USING (public.is_member_of_store(store_id) OR true);

CREATE POLICY "Manage variants" ON public.product_variants
    FOR ALL USING (public.is_member_of_store(store_id));

-- Stock Movements
CREATE POLICY "Manage stock movements" ON public.stock_movements
    FOR ALL USING (public.is_member_of_store(store_id));

-- Orders & Items
CREATE POLICY "View orders" ON public.orders
    FOR SELECT USING (public.is_member_of_store(store_id));

CREATE POLICY "Insert orders" ON public.orders
    FOR INSERT WITH CHECK (public.is_member_of_store(store_id) OR true); -- storefront checkout allowed

CREATE POLICY "Update orders" ON public.orders
    FOR UPDATE USING (public.is_member_of_store(store_id));

CREATE POLICY "View order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id AND (public.is_member_of_store(o.store_id) OR true)
        )
    );

CREATE POLICY "Insert order items" ON public.order_items
    FOR INSERT WITH CHECK (true);

-- Followup Tasks
CREATE POLICY "Manage followup tasks" ON public.followup_tasks
    FOR ALL USING (public.is_member_of_store(store_id));

-- AI Runs
CREATE POLICY "View and insert AI runs" ON public.ai_runs
    FOR ALL USING (store_id IS NULL OR public.is_member_of_store(store_id) OR public.is_superadmin());

-- Audit Logs (Super admin only)
CREATE POLICY "Super admin audit logs" ON public.audit_logs
    FOR ALL USING (public.is_superadmin());

-- Conversations & Messages
CREATE POLICY "Manage conversations" ON public.conversations
    FOR ALL USING (public.is_member_of_store(store_id));

CREATE POLICY "Manage messages" ON public.messages
    FOR ALL USING (public.is_member_of_store(store_id));

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_customers_store_phone ON public.customers(store_id, phone_wa);
CREATE INDEX IF NOT EXISTS idx_customers_store_stage ON public.customers(store_id, stage);
CREATE INDEX IF NOT EXISTS idx_products_store_active ON public.products(store_id, is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_status ON public.orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_followup_tasks_store_status ON public.followup_tasks(store_id, status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant ON public.stock_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_ai_runs_store ON public.ai_runs(store_id, created_at);
