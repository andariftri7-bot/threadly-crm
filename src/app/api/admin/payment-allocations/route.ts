import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SETTING_KEY = 'payment_method_allocations';

export interface PaymentAllocationItem {
  method: string;
  amount: number;
  count: number;
}

const ALLOWED_METHODS = [
  'Virtual Account',
  'E-Wallet (QRIS/GoPay/OVO/ShopeePay)',
  'Auto-Debit',
  'Transfer Bank',
];

function verifySuperadmin(req: NextRequest): { ok: boolean; email: string } {
  const superadminEmail = (process.env.SUPERADMIN_EMAIL || 'andariftri7@gmail.com').toLowerCase().trim();
  const authCookie = req.cookies.get('threadly_auth')?.value;
  if (!authCookie) {
    return { ok: false, email: '' };
  }

  try {
    const session = JSON.parse(decodeURIComponent(authCookie));
    const sessionEmail = (session.email || '').toLowerCase().trim();
    const isVerified = session.email_verified === true || session.verified === true;
    const isSuper = session.is_superadmin === true;

    if (session && sessionEmail === superadminEmail && isVerified && isSuper) {
      return { ok: true, email: sessionEmail };
    }
  } catch {
    return { ok: false, email: '' };
  }

  return { ok: false, email: '' };
}

function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey || url.includes('placeholder') || serviceKey.includes('placeholder')) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
      },
    },
  });
}

function sanitizeAllocations(input: unknown): PaymentAllocationItem[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;

  const map = new Map<string, PaymentAllocationItem>();
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const method = typeof record.method === 'string' ? record.method.trim() : '';
    if (!ALLOWED_METHODS.includes(method)) continue;

    const amount = Number(record.amount);
    const count = Number(record.count);

    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(count) || count < 0) {
      return null;
    }

    map.set(method, {
      method,
      amount: Math.round(amount),
      count: Math.round(count),
    });
  }

  return ALLOWED_METHODS.map(method => map.get(method) || { method, amount: 0, count: 0 });
}

export async function GET(req: NextRequest) {
  const auth = verifySuperadmin(req);
  if (!auth.ok) {
    return new NextResponse(null, { status: 404 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({
      status: 'ok',
      source: 'local',
      allocations: null,
      updatedAt: null,
    });
  }

  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value, updated_at')
      .eq('key', SETTING_KEY)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({
        status: 'ok',
        source: 'local',
        allocations: null,
        updatedAt: null,
        note: error?.message || 'Belum ada data tersimpan di Supabase',
      });
    }

    const sanitized = sanitizeAllocations(data.value);
    return NextResponse.json({
      status: 'ok',
      source: 'supabase',
      allocations: sanitized,
      updatedAt: data.updated_at,
    });
  } catch {
    return NextResponse.json({
      status: 'ok',
      source: 'local',
      allocations: null,
      updatedAt: null,
    });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifySuperadmin(req);
  if (!auth.ok) {
    return new NextResponse(null, { status: 404 });
  }

  let body: { allocations?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: 'error', message: 'Payload JSON tidak valid.' }, { status: 400 });
  }

  const sanitized = sanitizeAllocations(body?.allocations);
  if (!sanitized) {
    return NextResponse.json(
      { status: 'error', message: 'Data alokasi pembayaran harus berupa nominal dan frekuensi bernilai >= 0.' },
      { status: 400 }
    );
  }

  const updatedAt = new Date().toISOString();
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({
      status: 'ok',
      persistedToSupabase: false,
      source: 'local',
      allocations: sanitized,
      updatedAt,
    });
  }

  try {
    const { error } = await supabase
      .from('platform_settings')
      .upsert(
        {
          key: SETTING_KEY,
          value: sanitized,
          updated_by: auth.email,
          updated_at: updatedAt,
        },
        { onConflict: 'key' }
      );

    if (error) {
      return NextResponse.json({
        status: 'ok',
        persistedToSupabase: false,
        source: 'local',
        allocations: sanitized,
        updatedAt,
        supabaseError: error.message,
      });
    }

    return NextResponse.json({
      status: 'ok',
      persistedToSupabase: true,
      source: 'supabase',
      allocations: sanitized,
      updatedAt,
    });
  } catch {
    return NextResponse.json({
      status: 'ok',
      persistedToSupabase: false,
      source: 'local',
      allocations: sanitized,
      updatedAt,
    });
  }
}
