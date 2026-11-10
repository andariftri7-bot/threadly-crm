// ==============================================================================
// THREADLY - Supabase Database TypeScript Definitions
// Auto-generated mapping for Supabase Client & Server Operations
// ==============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          is_superadmin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string | null;
          is_superadmin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          is_superadmin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          phone_wa: string | null;
          address: string | null;
          status: 'active' | 'inactive';
          plan: 'standar' | 'pro';
          trial_ends_at: string;
          active_threshold_days: number;
          loyal_threshold_orders: number;
          loyal_threshold_days: number;
          sleeping_threshold_days: number;
          ai_persona: string;
          msg_template_followup_sleeping: string;
          msg_template_unpaid_order: string;
          msg_template_birthday: string;
          msg_template_restock: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          description?: string | null;
          phone_wa?: string | null;
          address?: string | null;
          status?: 'active' | 'inactive';
          plan?: 'standar' | 'pro';
          trial_ends_at?: string;
          active_threshold_days?: number;
          loyal_threshold_orders?: number;
          loyal_threshold_days?: number;
          sleeping_threshold_days?: number;
          ai_persona?: string;
          msg_template_followup_sleeping?: string;
          msg_template_unpaid_order?: string;
          msg_template_birthday?: string;
          msg_template_restock?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          description?: string | null;
          phone_wa?: string | null;
          address?: string | null;
          status?: 'active' | 'inactive';
          plan?: 'standar' | 'pro';
          trial_ends_at?: string;
          active_threshold_days?: number;
          loyal_threshold_orders?: number;
          loyal_threshold_days?: number;
          sleeping_threshold_days?: number;
          ai_persona?: string;
          msg_template_followup_sleeping?: string;
          msg_template_unpaid_order?: string;
          msg_template_birthday?: string;
          msg_template_restock?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      store_members: {
        Row: {
          id: string;
          store_id: string;
          user_id: string;
          user_email: string | null;
          role: 'owner' | 'staff';
          invited_email: string | null;
          status: 'active' | 'invited';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          user_id: string;
          user_email?: string | null;
          role?: 'owner' | 'staff';
          invited_email?: string | null;
          status?: 'active' | 'invited';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          user_id?: string;
          user_email?: string | null;
          role?: 'owner' | 'staff';
          invited_email?: string | null;
          status?: 'active' | 'invited';
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          phone_wa: string;
          address: string | null;
          source: string;
          birthdate: string | null;
          favorite_size: string | null;
          favorite_color: string | null;
          preferred_style: string | null;
          budget_range: string | null;
          notes: string | null;
          tags: string[];
          total_spend: number;
          order_count: number;
          average_order_value: number;
          last_purchase_date: string | null;
          stage: 'Baru' | 'Aktif' | 'Setia' | 'Tidur';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          phone_wa: string;
          address?: string | null;
          source?: string;
          birthdate?: string | null;
          favorite_size?: string | null;
          favorite_color?: string | null;
          preferred_style?: string | null;
          budget_range?: string | null;
          notes?: string | null;
          tags?: string[];
          total_spend?: number;
          order_count?: number;
          average_order_value?: number;
          last_purchase_date?: string | null;
          stage?: 'Baru' | 'Aktif' | 'Setia' | 'Tidur';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          phone_wa?: string;
          address?: string | null;
          source?: string;
          birthdate?: string | null;
          favorite_size?: string | null;
          favorite_color?: string | null;
          preferred_style?: string | null;
          budget_range?: string | null;
          notes?: string | null;
          tags?: string[];
          total_spend?: number;
          order_count?: number;
          average_order_value?: number;
          last_purchase_date?: string | null;
          stage?: 'Baru' | 'Aktif' | 'Setia' | 'Tidur';
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          slug: string;
          description: string | null;
          category: string;
          base_price: number;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          slug: string;
          description?: string | null;
          category?: string;
          base_price?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          category?: string;
          base_price?: number;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          store_id: string;
          size: string;
          color: string;
          stock: number;
          min_stock_alert: number;
          sku: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          store_id: string;
          size: string;
          color: string;
          stock?: number;
          min_stock_alert?: number;
          sku?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          store_id?: string;
          size?: string;
          color?: string;
          stock?: number;
          min_stock_alert?: number;
          sku?: string | null;
          created_at?: string;
        };
      };
      stock_movements: {
        Row: {
          id: string;
          store_id: string;
          variant_id: string;
          type: 'in' | 'out' | 'adjustment' | 'order_deduction' | 'order_cancellation';
          quantity: number;
          balance_after: number;
          reference_type: string | null;
          reference_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          variant_id: string;
          type: 'in' | 'out' | 'adjustment' | 'order_deduction' | 'order_cancellation';
          quantity: number;
          balance_after: number;
          reference_type?: string | null;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          variant_id?: string;
          type?: 'in' | 'out' | 'adjustment' | 'order_deduction' | 'order_cancellation';
          quantity?: number;
          balance_after?: number;
          reference_type?: string | null;
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          store_id: string;
          order_number: string;
          customer_id: string;
          customer_name: string;
          customer_phone: string;
          customer_address: string | null;
          status: 'Menunggu Pembayaran' | 'DP' | 'Lunas' | 'Dikemas' | 'Dikirim' | 'Selesai' | 'Batal';
          subtotal: number;
          shipping_cost: number;
          discount: number;
          total_amount: number;
          payment_method: string;
          tracking_number: string | null;
          source: 'manual' | 'public_storefront';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          order_number: string;
          customer_id: string;
          customer_name: string;
          customer_phone: string;
          customer_address?: string | null;
          status?: 'Menunggu Pembayaran' | 'DP' | 'Lunas' | 'Dikemas' | 'Dikirim' | 'Selesai' | 'Batal';
          subtotal?: number;
          shipping_cost?: number;
          discount?: number;
          total_amount?: number;
          payment_method?: string;
          tracking_number?: string | null;
          source?: 'manual' | 'public_storefront';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          order_number?: string;
          customer_id?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_address?: string | null;
          status?: 'Menunggu Pembayaran' | 'DP' | 'Lunas' | 'Dikemas' | 'Dikirim' | 'Selesai' | 'Batal';
          subtotal?: number;
          shipping_cost?: number;
          discount?: number;
          total_amount?: number;
          payment_method?: string;
          tracking_number?: string | null;
          source?: 'manual' | 'public_storefront';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name: string;
          variant_name: string;
          price: number;
          quantity: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name: string;
          variant_name: string;
          price?: number;
          quantity?: number;
          subtotal?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          variant_id?: string;
          product_name?: string;
          variant_name?: string;
          price?: number;
          quantity?: number;
          subtotal?: number;
          created_at?: string;
        };
      };
      followup_tasks: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string;
          order_id: string | null;
          type: 'sleeping_customer' | 'unpaid_order' | 'birthday' | 'restock';
          title: string;
          description: string | null;
          status: 'pending' | 'completed' | 'dismissed';
          due_date: string;
          completed_at: string | null;
          whatsapp_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id: string;
          order_id?: string | null;
          type: 'sleeping_customer' | 'unpaid_order' | 'birthday' | 'restock';
          title: string;
          description?: string | null;
          status?: 'pending' | 'completed' | 'dismissed';
          due_date?: string;
          completed_at?: string | null;
          whatsapp_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          customer_id?: string;
          order_id?: string | null;
          type?: 'sleeping_customer' | 'unpaid_order' | 'birthday' | 'restock';
          title?: string;
          description?: string | null;
          status?: 'pending' | 'completed' | 'dismissed';
          due_date?: string;
          completed_at?: string | null;
          whatsapp_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_runs: {
        Row: {
          id: string;
          store_id: string | null;
          user_id: string | null;
          feature_type: 'chat_to_order' | 'reply_composer' | 'customer_summary';
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          latency_ms: number;
          status: 'success' | 'failed';
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id?: string | null;
          user_id?: string | null;
          feature_type: 'chat_to_order' | 'reply_composer' | 'customer_summary';
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          latency_ms?: number;
          status?: 'success' | 'failed';
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string | null;
          user_id?: string | null;
          feature_type?: 'chat_to_order' | 'reply_composer' | 'customer_summary';
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          latency_ms?: number;
          status?: 'success' | 'failed';
          error_message?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string;
          action: string;
          target_type: string;
          target_id: string | null;
          metadata: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email: string;
          action: string;
          target_type: string;
          target_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string;
          action?: string;
          target_type?: string;
          target_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string | null;
          channel: string;
          customer_identifier: string;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id?: string | null;
          channel?: string;
          customer_identifier: string;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          customer_id?: string | null;
          channel?: string;
          customer_identifier?: string;
          last_message_at?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender: 'customer' | 'staff' | 'ai';
          text: string;
          raw_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender: 'customer' | 'staff' | 'ai';
          text: string;
          raw_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender?: 'customer' | 'staff' | 'ai';
          text?: string;
          raw_data?: Json | null;
          created_at?: string;
        };
      };
      platform_settings: {
        Row: {
          key: string;
          value: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_superadmin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
