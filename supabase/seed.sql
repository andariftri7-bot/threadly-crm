-- ==============================================================================
-- THREADLY - Supabase Seed Data for Development & Testing
-- ==============================================================================

-- 1. Create Mock Auth Users in auth.users (if using Supabase CLI / local instance)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES
            ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'andariftri7@gmail.com', crypt('AdminPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Super Admin Threadly"}', now(), now()),
            ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner.koleksilokal@threadly.id', crypt('OwnerPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dian Sastrowardoyo"}', now(), now()),
            ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner.batikheritage@threadly.id', crypt('OwnerPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Raden Mas Danang"}', now(), now()),
            ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner.urbanthrift@threadly.id', crypt('OwnerPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rian Streetwear"}', now(), now())
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 2. Seed Public Profiles
INSERT INTO public.profiles (id, email, full_name, is_superadmin, created_at)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'andariftri7@gmail.com', 'Super Admin Threadly', true, now()),
    ('a0000000-0000-0000-0000-000000000002', 'owner.koleksilokal@threadly.id', 'Dian Sastrowardoyo', false, now()),
    ('a0000000-0000-0000-0000-000000000003', 'owner.batikheritage@threadly.id', 'Raden Mas Danang', false, now()),
    ('a0000000-0000-0000-0000-000000000004', 'owner.urbanthrift@threadly.id', 'Rian Streetwear', false, now())
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    is_superadmin = EXCLUDED.is_superadmin;

-- 3. Seed Fashion MSME Stores
INSERT INTO public.stores (
    id, name, slug, logo_url, description, phone_wa, address, status, plan,
    trial_ends_at, active_threshold_days, loyal_threshold_orders, loyal_threshold_days, sleeping_threshold_days,
    ai_persona, msg_template_followup_sleeping, msg_template_unpaid_order, msg_template_birthday, msg_template_restock
) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'Koleksi Lokal Boutique',
    'koleksilokal',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80',
    'Butik kurasi busana wanita kontemporer berbahan linen dan katun premium sejuk.',
    '081298765432',
    'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan',
    'active',
    'standar',
    now() + interval '7 days',
    60, 3, 90, 60,
    'Ramah, santai, empatik khas fashion advisor butik lokal Jakarta.',
    'Halo {nama}! Kami kangen nih di {toko}. Kebetulan koleksi baru ukuran {ukuran} warna {warna} baru saja restock lho. Yuk cek katalog kami!',
    'Halo {nama}, pesananmu #{no_pesanan} untuk {produk} masih menunggu pembayaran nih. Butuh bantuan dengan metode transfernya?',
    'Selamat ulang tahun {nama}! Ada kado diskon spesial 15% dari {toko} khusus untuk hari bahagiamu. Jangan lewatkan ya!',
    'Kabar gembira {nama}! {produk} ukuran {ukuran} favoritmu sekarang sudah kembali tersedia di {toko}. Pesan sekarang sebelum kehabisan ya!'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'Batik Heritage Solo',
    'batik-heritage',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&auto=format&fit=crop&q=80',
    'Koleksi batik cap dan tulis modern bernuansa kasual untuk pria dan wanita.',
    '081322334455',
    'Pasar Klewer Blok B No. 12, Solo, Jawa Tengah',
    'active',
    'pro',
    now() + interval '7 days',
    60, 3, 90, 60,
    'Sopan, hangat, mengedepankan filosofi corak batik nusantara yang adiluhung.',
    'Sugeng rawuh {nama}! Motif batik baru favoritmu sudah siap di {toko}. Yuk lihat katalog terbaru!',
    'Halo {nama}, pesanan #{no_pesanan} batik pilihanmu masih kami amankan ya.',
    'Selamat ulang tahun {nama}! Berkah selalu, ada voucher batik spesial dari {toko}.',
    'Halo {nama}, koleksi {produk} sudah kembali diproduksi pengrajin kami!'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'Urban Thrift Haven',
    'urbanthrift',
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format&fit=crop&q=80',
    'Kurasi jaket vintage, flannel impor, dan streetwear 90s pilihan berkelas.',
    '085711223344',
    'Jl. Trunojoyo No. 28, Citarum, Kota Bandung',
    'active',
    'standar',
    now() + interval '7 days',
    60, 3, 90, 60,
    'Gaya santai, asik, ala pecinta streetwear bandung kekinian.',
    'Yo {nama}! Drop artikel streetwear vintage terbaru baru masuk nih di {toko}. Gass cek katalog sebelum kehabisan!',
    'Halo {nama}, artikel #{no_pesanan} masih kami hold ya. Yuk selesaikan transfernya.',
    'Happy birthday {nama}! Nih voucher diskon 20% buat thrift belanjaan hari ini.',
    'Yo {nama}! Jaket & hoodie ukuran {ukuran} incaranmu udah restock lagi nih.'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    status = EXCLUDED.status;

-- 4. Store Memberships (1 User = 1 Store Isolation, Super Admin excluded)
INSERT INTO public.store_members (id, store_id, user_id, user_email, role, status)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'owner.koleksilokal@threadly.id', 'owner', 'active'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'owner.batikheritage@threadly.id', 'owner', 'active'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'owner.urbanthrift@threadly.id', 'owner', 'active')
ON CONFLICT (user_id) DO NOTHING;

-- 5. Products for Store 1 (Koleksi Lokal)
INSERT INTO public.products (id, store_id, name, slug, description, category, base_price, is_active)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Kemeja Linen Oversized', 'kemeja-linen-oversized', 'Kemeja potongan santai berbahan 100% serat rami alami berkualitas tinggi.', 'Atasan', 249000, true),
    ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Celana Kulot Highwaist', 'celana-kulot-highwaist', 'Kulot berpinggang tinggi dengan karet belakang elastis yang nyaman seharian.', 'Bawahan', 199000, true)
ON CONFLICT (id) DO NOTHING;

-- 6. Product Variants
INSERT INTO public.product_variants (id, product_id, store_id, size, color, stock, min_stock_alert, sku)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'S', 'Sage Green', 15, 3, 'KL-KLO-S-SG'),
    ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'M', 'Sage Green', 8, 3, 'KL-KLO-M-SG'),
    ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'L', 'Broken White', 2, 3, 'KL-KLO-L-BW'),
    ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'M', 'Terracotta', 12, 3, 'KL-CKH-M-TC'),
    ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'L', 'Navy', 5, 3, 'KL-CKH-L-NV')
ON CONFLICT (id) DO NOTHING;

-- 7. Customers
INSERT INTO public.customers (
    id, store_id, name, phone_wa, source, birthdate, favorite_size, favorite_color, preferred_style, budget_range,
    tags, total_spend, order_count, average_order_value, stage, last_purchase_date
) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Rania Safitri',
    '081234567890',
    'Instagram',
    '1996-08-14',
    'M',
    'Sage Green',
    'Casual Minimalist',
    'Rp200k - Rp500k',
    ARRAY['VIP', 'Pecinta Linen', 'Langganan Live'],
    1245000,
    4,
    311250,
    'Setia',
    now() - interval '14 days'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Maya Anggraini',
    '085698765432',
    'WhatsApp',
    '1998-11-20',
    'L',
    'Terracotta',
    'Smart Casual',
    'Rp150k - Rp300k',
    ARRAY['Sering Tanya Ukuran'],
    199000,
    1,
    199000,
    'Aktif',
    now() - interval '10 days'
),
(
    'f0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'Siska Putri',
    '087788990011',
    'TikTok',
    '1995-03-05',
    'S',
    'Broken White',
    'Feminine Chic',
    'Rp200k - Rp400k',
    ARRAY['Perlu Diingatkan', 'Diskon Hunter'],
    498000,
    2,
    249000,
    'Tidur',
    now() - interval '75 days'
)
ON CONFLICT (id) DO NOTHING;

-- 8. Sample Order
INSERT INTO public.orders (
    id, store_id, order_number, customer_id, customer_name, customer_phone,
    status, subtotal, shipping_cost, discount, total_amount, payment_method, source
) VALUES (
    '10000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'ORD-202611-001',
    'f0000000-0000-0000-0000-000000000001',
    'Rania Safitri',
    '081234567890',
    'Lunas',
    249000,
    15000,
    0,
    264000,
    'Transfer Bank BCA',
    'manual'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (
    id, order_id, product_id, variant_id, product_name, variant_name, price, quantity, subtotal
) VALUES (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000002',
    'Kemeja Linen Oversized',
    'M / Sage Green',
    249000,
    1,
    249000
) ON CONFLICT (id) DO NOTHING;

-- 9. Sample Follow-up Retention Task (Customer Sleeping)
INSERT INTO public.followup_tasks (
    id, store_id, customer_id, type, title, description, status, due_date, whatsapp_url
) VALUES (
    '30000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000003',
    'sleeping_customer',
    'Reaktivasi Pelanggan Tidur: Siska Putri',
    'Terakhir bertransaksi 75 hari lalu. Kirim sapaan hangat dan info restock Broken White ukuran S.',
    'pending',
    now(),
    'https://wa.me/6287788990011?text=Halo%20Siska%20Putri!%20Kami%20kangen%20nih%20di%20Koleksi%20Lokal%20Boutique.%20Koleksi%20baru%20ukuran%20S%20warna%20Broken%20White%20baru%20saja%20restock%20lho.'
) ON CONFLICT (id) DO NOTHING;
