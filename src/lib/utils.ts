import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah (e.g. Rp1.250.000)
 */
export function formatRupiah(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return "Rp0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rp0";

  const formatted = Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp${formatted}`;
}

/**
 * Format Date to Indonesian WIB (Asia/Jakarta)
 */
export function formatDateWIB(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "-";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d) + " WIB";
  } catch {
    return "-";
  }
}

/**
 * Format Short Date (DD MMM YYYY)
 */
export function formatShortDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return "-";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
}

/**
 * Normalize phone number to Indonesian international format (628xxxxxxxx)
 */
export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  } else if (cleaned.startsWith("620")) {
    cleaned = "62" + cleaned.substring(3);
  }
  return cleaned;
}

/**
 * Build WhatsApp wa.me link with encoded prefilled message
 */
export function buildWhatsAppLink(phone: string, text: string): string {
  const normalized = normalizeWhatsAppNumber(phone);
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${normalized}?text=${encoded}`;
}

/**
 * Calculate customer lifecycle stage based on rules:
 * - Baru: orderCount === 0
 * - Aktif: bought within activeThresholdDays (default 60 days)
 * - Setia: orderCount >= loyalThresholdOrders (default 3) AND bought within loyalThresholdDays (default 90 days)
 * - Tidur: has orders, but last purchase is older than sleepingThresholdDays (default 60 days)
 */
export function calculateCustomerStage(
  orderCount: number,
  lastPurchaseDate: string | undefined | null,
  activeThresholdDays: number = 60,
  loyalThresholdOrders: number = 3,
  loyalThresholdDays: number = 90,
  sleepingThresholdDays: number = 60
): 'Baru' | 'Aktif' | 'Setia' | 'Tidur' {
  if (!orderCount || orderCount <= 0 || !lastPurchaseDate) {
    return 'Baru';
  }

  const lastPurchase = new Date(lastPurchaseDate).getTime();
  const now = new Date().getTime();
  const diffDays = Math.floor((now - lastPurchase) / (1000 * 60 * 60 * 24));

  // Loyal check: >= 3 orders AND within 90 days
  if (orderCount >= loyalThresholdOrders && diffDays <= loyalThresholdDays) {
    return 'Setia';
  }

  // Active check: bought within 60 days
  if (diffDays <= activeThresholdDays) {
    return 'Aktif';
  }

  // Otherwise sleeping
  return 'Tidur';
}
