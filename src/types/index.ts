// ==============================================================================
// THREADLY - Core TypeScript Types
// ==============================================================================

export type UserRole = 'owner' | 'staff';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_superadmin: boolean;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  description?: string;
  phone_wa: string;
  address?: string;
  status: 'active' | 'inactive';
  plan: 'standar' | 'pro';
  trial_ends_at: string;
  active_threshold_days: number;
  loyal_threshold_orders: number;
  loyal_threshold_days: number;
  sleeping_threshold_days: number;
  ai_persona: string;
  last_persona_updated_at?: string;
  message_emoji_style?: 'bebas' | 'minimal' | 'none';
  msg_template_followup_sleeping: string;
  msg_template_unpaid_order: string;
  msg_template_birthday: string;
  msg_template_restock: string;
  created_at: string;
  updated_at: string;
}

export interface StoreMember {
  id: string;
  store_id: string;
  user_id: string;
  user_email?: string;
  role: UserRole;
  invited_email?: string;
  status: 'active' | 'invited';
  created_at: string;
}

export type CustomerStage = 'Baru' | 'Aktif' | 'Setia' | 'Tidur';

export type CustomerSource =
  | 'WhatsApp'
  | 'Instagram'
  | 'TikTok'
  | 'Shopee'
  | 'Tokopedia'
  | 'Toko Langsung'
  | 'Lainnya';

export interface Customer {
  id: string;
  store_id: string;
  name: string;
  phone_wa: string;
  address?: string;
  source: CustomerSource;
  birthdate?: string; // YYYY-MM-DD
  favorite_size?: string;
  favorite_color?: string;
  preferred_style?: string;
  budget_range?: string;
  notes?: string;
  tags: string[];
  total_spend: number;
  order_count: number;
  average_order_value: number;
  last_purchase_date?: string;
  stage: CustomerStage;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  store_id: string;
  size: string;
  color: string;
  stock: number;
  min_stock_alert: number;
  sku?: string;
  created_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  sku?: string;
  category: string;
  price: number;
  cost_price?: number;
  description?: string;
  image_url?: string;
  is_active: boolean;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export type StockMovementType =
  | 'in'
  | 'out'
  | 'adjustment'
  | 'order_deduction'
  | 'order_cancellation';

export interface StockMovement {
  id: string;
  store_id: string;
  variant_id: string;
  variant_info?: string;
  type: StockMovementType;
  quantity: number;
  balance_after: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_at: string;
}

export type OrderStatus =
  | 'Menunggu Pembayaran'
  | 'DP'
  | 'Lunas'
  | 'Dikemas'
  | 'Dikirim'
  | 'Selesai'
  | 'Batal';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string; // e.g. "Size M / Hitam"
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  store_id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  tracking_number?: string;
  source: 'manual' | 'public_storefront';
  notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export type FollowupType =
  | 'sleeping_customer'
  | 'unpaid_order'
  | 'birthday'
  | 'restock';

export interface FollowupTask {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  order_id?: string;
  type: FollowupType;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'dismissed';
  due_date: string;
  completed_at?: string;
  whatsapp_url?: string;
  created_at: string;
}

export interface AiRunLog {
  id: string;
  store_id?: string;
  feature_type: 'chat_to_order' | 'reply_composer' | 'customer_summary';
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  status: 'success' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email?: string;
  action: string;
  target_store_id?: string;
  target_store_name?: string;
  reason: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ExtractedOrderData {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  notes?: string;
}
