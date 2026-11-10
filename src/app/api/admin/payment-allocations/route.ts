import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SETTING_KEY = 'payment_method_allocations';
const FALLBACK_FILE_PATH = path.resolve(process.cwd(), '.threadly-platform-settings.json');

export interface PaymentAllocationItem {
  method: string;
  amount: number;
  count: number;
}

interface StoredSettingRecord {
  value: PaymentAllocationItem[];
  updatedBy: string;
  updatedAt: string;
}

// In-memory cache fallback if filesystem is read-only (e.g. serverless)
const memoryFallbackStore = new Map<string, StoredSettingRecord>();

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

  if (
    !url ||
    !serviceKey ||
    url.includes('placeholder') ||
    url.includes('mock-') ||
    url.includes('example.supabase') ||
    serviceKey.includes('placeholder') ||
    serviceKey.includes('dummy_')
  ) {
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

  if (map.size === 0) return null;
  return ALLOWED_METHODS.map(method => map.get(method) || { method, amount: 0, count: 0 });
}

function readServerFallbackSetting(): StoredSettingRecord | null {
  const mem = memoryFallbackStore.get(SETTING_KEY);
  try {
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      const raw = JSON.parse(fs.readFileSync(FALLBACK_FILE_PATH, 'utf-8'));
      const entry = raw?.[SETTING_KEY];
      if (entry && Array.isArray(entry.value)) {
        const sanitized = sanitizeAllocations(entry.value);
        if (sanitized) {
          const rec: StoredSettingRecord = {
            value: sanitized,
            updatedBy: typeof entry.updatedBy === 'string' ? entry.updatedBy : '',
            updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : new Date().toISOString(),
          };
          memoryFallbackStore.set(SETTING_KEY, rec);
          return rec;
        }
      }
    }
  } catch {
    // ignore file read error
  }
  return mem || null;
}

function writeServerFallbackSetting(allocations: PaymentAllocationItem[], updatedBy: string, updatedAt: string) {
  const record: StoredSettingRecord = { value: allocations, updatedBy, updatedAt };
  memoryFallbackStore.set(SETTING_KEY, record);
  try {
    let existing: Record<string, StoredSettingRecord> = {};
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      existing = JSON.parse(fs.readFileSync(FALLBACK_FILE_PATH, 'utf-8')) || {};
    }
    existing[SETTING_KEY] = record;
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(existing, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem fallback stays in memoryFallbackStore
  }
}

function clearServerFallbackSetting() {
  memoryFallbackStore.delete(SETTING_KEY);
  try {
    if (fs.existsSync(FALLBACK_FILE_PATH)) {
      const existing = JSON.parse(fs.readFileSync(FALLBACK_FILE_PATH, 'utf-8')) || {};
      delete existing[SETTING_KEY];
      fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(existing, null, 2), 'utf-8');
    }
  } catch {
    // ignore
  }
}

export async function GET(req: NextRequest) {
  const auth = verifySuperadmin(req);
  if (!auth.ok) {
    return new NextResponse(null, { status: 404 });
  }

  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value, updated_at')
        .eq('key', SETTING_KEY)
        .maybeSingle();

      if (!error && data) {
        const sanitized = sanitizeAllocations(data.value);
        if (sanitized) {
          return NextResponse.json({
            status: 'ok',
            source: 'supabase',
            allocations: sanitized,
            updatedAt: data.updated_at,
          });
        }
      }
    } catch {
      // fall through to local server metadata store
    }
  }

  const fallback = readServerFallbackSetting();
  if (fallback) {
    return NextResponse.json({
      status: 'ok',
      source: 'metadata',
      allocations: fallback.value,
      updatedAt: fallback.updatedAt,
    });
  }

  return NextResponse.json({
    status: 'ok',
    source: 'local',
    allocations: null,
    updatedAt: null,
  });
}

export async function POST(req: NextRequest) {
  const auth = verifySuperadmin(req);
  if (!auth.ok) {
    return new NextResponse(null, { status: 404 });
  }

  let body: { allocations?: unknown; reset?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: 'error', message: 'Payload JSON tidak valid.' }, { status: 400 });
  }

  if (body?.reset === true) {
    clearServerFallbackSetting();
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        await supabase.from('platform_settings').delete().eq('key', SETTING_KEY);
      } catch {
        // ignore
      }
    }
    return NextResponse.json({
      status: 'ok',
      reset: true,
      allocations: null,
      updatedAt: null,
    });
  }

  const sanitized = sanitizeAllocations(body?.allocations);
  if (!sanitized) {
    return NextResponse.json(
      { status: 'error', message: 'Data alokasi pembayaran harus berupa nominal dan frekuensi bernilai >= 0.' },
      { status: 400 }
    );
  }

  const updatedAt = new Date().toISOString();
  writeServerFallbackSetting(sanitized, auth.email, updatedAt);

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({
      status: 'ok',
      persistedToSupabase: false,
      source: 'metadata',
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
        source: 'metadata',
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
      source: 'metadata',
      allocations: sanitized,
      updatedAt,
    });
  }
}
