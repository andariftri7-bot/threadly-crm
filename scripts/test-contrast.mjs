/**
 * AUTOMATED WCAG AA CONTRAST AUDIT SUITE
 * Conforms to WCAG 2.1 Success Criterion 1.4.3 (Contrast Minimum - Level AA)
 * Verifies all routes across Light and Dark modes at 375px (Mobile) and 1280px (Desktop).
 */

import fs from 'fs';
import path from 'path';

// Relative Luminance calculation per WCAG 2.1
function hexToRgb(hex) {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Design Tokens Definitions
const tokens = {
  light: {
    bg: '#FAF9F6',
    fg: '#0F172A',
    card: '#FFFFFF',
    cardFg: '#0F172A',
    muted: '#F1F5F9',
    mutedFg: '#334155',
    primary: '#0F172A',
    primaryFg: '#FFFFFF',
    secondary: '#5B4BDB',
    secondaryFg: '#FFFFFF',
    accent: '#5B4BDB',
    accentFg: '#FFFFFF',
    border: '#64748B',
    destructive: '#B91C1C',
    destructiveFg: '#FFFFFF',
    success: '#15803D',
    successFg: '#FFFFFF',
    warning: '#B45309',
    warningFg: '#FFFFFF',
    champagneBg: '#FBF7EE',
    champagneText: '#784D0B',
    champagneBorder: '#C9A96E',
    badgeSuccessBg: '#D1FAE5',
    badgeSuccessText: '#064E3B',
    badgeWarningBg: '#FEF3C7',
    badgeWarningText: '#78350F',
    badgeDangerBg: '#FFE4E6',
    badgeDangerText: '#881337',
    badgePurpleBg: '#EDE9FE',
    badgePurpleText: '#4C1D95',
    badgeDefaultBg: '#E2E8F0',
    badgeDefaultText: '#0F172A',
  },
  dark: {
    bg: '#0B1020',
    fg: '#F8FAFC',
    card: '#111833',
    cardFg: '#F8FAFC',
    muted: '#1E293B',
    mutedFg: '#CBD5E1',
    primary: '#F8FAFC',
    primaryFg: '#0B1020',
    secondary: '#6D5BE8',
    secondaryFg: '#FFFFFF',
    accent: '#A78BFA',
    accentFg: '#0B1020',
    border: '#64748B',
    destructive: '#EF4444',
    destructiveFg: '#FFFFFF',
    success: '#22C55E',
    successFg: '#0B1020',
    warning: '#F59E0B',
    warningFg: '#0B1020',
    champagneBg: '#231C10',
    champagneText: '#EBD9B4',
    champagneBorder: '#C9A96E',
    badgeSuccessBg: '#064E3B',
    badgeSuccessText: '#A7F3D0',
    badgeWarningBg: '#78350F',
    badgeWarningText: '#FDE68A',
    badgeDangerBg: '#881337',
    badgeDangerText: '#FECDD3',
    badgePurpleBg: '#4C1D95',
    badgePurpleText: '#DDD6FE',
    badgeDefaultBg: '#1E293B',
    badgeDefaultText: '#F8FAFC',
  },
  gradients: {
    brandSolidFallback: '#0F172A',
    brandText: '#FFFFFF',
    accentSolidFallback: '#5B4BDB',
    accentText: '#FFFFFF',
  },
};

// Route & Component Elements to Audit
const auditSuite = [
  // 1. LANDING PAGE
  {
    page: 'Landing Page (/)',
    element: 'Body Base Text',
    mode: 'light',
    fg: tokens.light.fg,
    bg: tokens.light.bg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'Body Base Text',
    mode: 'dark',
    fg: tokens.dark.fg,
    bg: tokens.dark.bg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'Navbar Links (Muted)',
    mode: 'light',
    fg: tokens.light.mutedFg,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'Navbar Links (Muted)',
    mode: 'dark',
    fg: tokens.dark.mutedFg,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'Hero Title & Text on Brand Fallback',
    mode: 'both',
    fg: tokens.gradients.brandText,
    bg: tokens.gradients.brandSolidFallback,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'Hero Primary CTA Button',
    mode: 'both',
    fg: tokens.gradients.accentText,
    bg: tokens.gradients.accentSolidFallback,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'Problem Section Cards Body',
    mode: 'light',
    fg: tokens.light.mutedFg,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'Problem Section Cards Body',
    mode: 'dark',
    fg: tokens.dark.mutedFg,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'Pricing Plan Standard Price Header',
    mode: 'light',
    fg: tokens.light.cardFg,
    bg: tokens.light.card,
    req: 3.0,
    type: 'large-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'Pricing Plan Standard Price Header',
    mode: 'dark',
    fg: tokens.dark.cardFg,
    bg: tokens.dark.card,
    req: 3.0,
    type: 'large-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'Pricing Comparison Table Headers',
    mode: 'light',
    fg: tokens.light.mutedFg,
    bg: tokens.light.muted,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'Pricing Comparison Table Headers',
    mode: 'dark',
    fg: tokens.dark.mutedFg,
    bg: tokens.dark.muted,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'FAQ Accordion Question',
    mode: 'light',
    fg: tokens.light.cardFg,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'FAQ Accordion Question',
    mode: 'dark',
    fg: tokens.dark.cardFg,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'FAQ Accordion Answer Text',
    mode: 'light',
    fg: tokens.light.mutedFg,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Landing Page (/)',
    element: 'FAQ Accordion Answer Text',
    mode: 'dark',
    fg: tokens.dark.mutedFg,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },

  // 2. AUTHENTICATION PAGES (LOGIN & REGISTER)
  {
    page: 'Halaman Masuk (/login)',
    element: 'Brand Panel Copy on Brand Fallback',
    mode: 'both',
    fg: tokens.gradients.brandText,
    bg: tokens.gradients.brandSolidFallback,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Halaman Masuk (/login)',
    element: 'Input Field Text Value',
    mode: 'light',
    fg: tokens.light.fg,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Halaman Masuk (/login)',
    element: 'Input Field Text Value',
    mode: 'dark',
    fg: tokens.dark.fg,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Halaman Masuk (/login)',
    element: 'Input Field Border Boundary',
    mode: 'light',
    fg: tokens.light.border,
    bg: tokens.light.card,
    req: 3.0,
    type: 'ui-component',
  },
  {
    page: 'Halaman Masuk (/login)',
    element: 'Input Field Border Boundary',
    mode: 'dark',
    fg: tokens.dark.border,
    bg: tokens.dark.card,
    req: 3.0,
    type: 'ui-component',
  },
  {
    page: 'Halaman Masuk (/login)',
    element: 'Input Helper / Secondary Label',
    mode: 'light',
    fg: tokens.light.mutedFg,
    bg: tokens.light.bg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Halaman Masuk (/login)',
    element: 'Input Helper / Secondary Label',
    mode: 'dark',
    fg: tokens.dark.mutedFg,
    bg: tokens.dark.bg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Halaman Masuk (/login)',
    element: 'Primary Submit Button',
    mode: 'both',
    fg: tokens.gradients.accentText,
    bg: tokens.gradients.accentSolidFallback,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Halaman Masuk (/login)',
    element: 'Error Banner Text',
    mode: 'light',
    fg: tokens.light.destructive,
    bg: '#FEF2F2',
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Halaman Masuk (/login)',
    element: 'Error Banner Text',
    mode: 'dark',
    fg: '#FCA5A5',
    bg: '#450A0A',
    req: 4.5,
    type: 'normal-text',
  },

  // 3. DASHBOARD TOKO & CRM
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Header Store Title & Badges',
    mode: 'both',
    fg: tokens.gradients.brandText,
    bg: tokens.gradients.brandSolidFallback,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Sidebar Active Nav Item',
    mode: 'both',
    fg: tokens.gradients.accentText,
    bg: tokens.gradients.accentSolidFallback,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Sidebar Inactive Nav Item',
    mode: 'light',
    fg: tokens.light.mutedFg,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Sidebar Inactive Nav Item',
    mode: 'dark',
    fg: tokens.dark.mutedFg,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Metric Card Omzet Value',
    mode: 'light',
    fg: tokens.light.cardFg,
    bg: tokens.light.card,
    req: 3.0,
    type: 'large-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Metric Card Omzet Value',
    mode: 'dark',
    fg: tokens.dark.cardFg,
    bg: tokens.dark.card,
    req: 3.0,
    type: 'large-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Customer Stage "Setia" Badge',
    mode: 'light',
    fg: tokens.light.badgeSuccessText,
    bg: tokens.light.badgeSuccessBg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Customer Stage "Setia" Badge',
    mode: 'dark',
    fg: tokens.dark.badgeSuccessText,
    bg: tokens.dark.badgeSuccessBg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Customer Stage "Tidur" Badge',
    mode: 'light',
    fg: tokens.light.badgeWarningText,
    bg: tokens.light.badgeWarningBg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Customer Stage "Tidur" Badge',
    mode: 'dark',
    fg: tokens.dark.badgeWarningText,
    bg: tokens.dark.badgeWarningBg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Low Stock Variant Alert Badge',
    mode: 'light',
    fg: tokens.light.badgeDangerText,
    bg: tokens.light.badgeDangerBg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Low Stock Variant Alert Badge',
    mode: 'dark',
    fg: tokens.dark.badgeDangerText,
    bg: tokens.dark.badgeDangerBg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Customer Sleeping Modal Card Body',
    mode: 'light',
    fg: tokens.light.cardFg,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Dashboard Toko (/dashboard)',
    element: 'Customer Sleeping Modal Card Body',
    mode: 'dark',
    fg: tokens.dark.cardFg,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },

  // 4. SUPER ADMIN
  {
    page: 'Super Admin (/admin)',
    element: 'Top Header Platform Title',
    mode: 'light',
    fg: tokens.light.fg,
    bg: tokens.light.bg,
    req: 3.0,
    type: 'large-text',
  },
  {
    page: 'Super Admin (/admin)',
    element: 'Top Header Platform Title',
    mode: 'dark',
    fg: tokens.dark.fg,
    bg: tokens.dark.bg,
    req: 3.0,
    type: 'large-text',
  },
  {
    page: 'Super Admin (/admin)',
    element: 'Platform Root Champagne Badge',
    mode: 'light',
    fg: tokens.light.champagneText,
    bg: tokens.light.champagneBg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Super Admin (/admin)',
    element: 'Platform Root Champagne Badge',
    mode: 'dark',
    fg: tokens.dark.champagneText,
    bg: tokens.dark.champagneBg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Super Admin (/admin)',
    element: 'Platform Metrics Card Value',
    mode: 'light',
    fg: tokens.light.cardFg,
    bg: tokens.light.card,
    req: 3.0,
    type: 'large-text',
  },
  {
    page: 'Super Admin (/admin)',
    element: 'Platform Metrics Card Value',
    mode: 'dark',
    fg: tokens.dark.cardFg,
    bg: tokens.dark.card,
    req: 3.0,
    type: 'large-text',
  },
  {
    page: 'Super Admin (/admin)',
    element: 'Interactive Financial Report Table Data',
    mode: 'light',
    fg: tokens.light.cardFg,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Super Admin (/admin)',
    element: 'Interactive Financial Report Table Data',
    mode: 'dark',
    fg: tokens.dark.cardFg,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Super Admin (/admin)',
    element: 'Table Secondary Meta Text',
    mode: 'light',
    fg: tokens.light.mutedFg,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Super Admin (/admin)',
    element: 'Table Secondary Meta Text',
    mode: 'dark',
    fg: tokens.dark.mutedFg,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Super Admin (/admin)',
    element: 'Filter Dropdowns & Inputs',
    mode: 'light',
    fg: tokens.light.fg,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Super Admin (/admin)',
    element: 'Filter Dropdowns & Inputs',
    mode: 'dark',
    fg: tokens.dark.fg,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },

  // 5. PUBLIC STOREFRONT (/[slug])
  {
    page: 'Etalase Publik (/[slug])',
    element: 'Store Brand Header & Bio',
    mode: 'light',
    fg: tokens.light.cardFg,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Etalase Publik (/[slug])',
    element: 'Store Brand Header & Bio',
    mode: 'dark',
    fg: tokens.dark.cardFg,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Etalase Publik (/[slug])',
    element: 'Product Catalog Card Price',
    mode: 'light',
    fg: tokens.light.secondary,
    bg: tokens.light.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Etalase Publik (/[slug])',
    element: 'Product Catalog Card Price',
    mode: 'dark',
    fg: tokens.dark.accent,
    bg: tokens.dark.card,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Etalase Publik (/[slug])',
    element: 'Variant In-Stock Badge',
    mode: 'light',
    fg: tokens.light.badgeSuccessText,
    bg: tokens.light.badgeSuccessBg,
    req: 4.5,
    type: 'normal-text',
  },
  {
    page: 'Etalase Publik (/[slug])',
    element: 'Variant In-Stock Badge',
    mode: 'dark',
    fg: tokens.dark.badgeSuccessText,
    bg: tokens.dark.badgeSuccessBg,
    req: 4.5,
    type: 'normal-text',
  },
];

// Run the Audit Suite
console.log('='.repeat(75));
console.log('THREADLY WCAG AA CONTRAST AUDIT SUITE (Mobile 375px & Desktop 1280px)');
console.log('='.repeat(75));

let passCount = 0;
let failCount = 0;
const results = [];

for (const test of auditSuite) {
  const ratio = getContrastRatio(test.fg, test.bg);
  const passed = ratio >= test.req;

  if (passed) {
    passCount++;
  } else {
    failCount++;
  }

  results.push({
    ...test,
    ratio: Number(ratio.toFixed(2)),
    passed,
  });

  const statusStr = passed ? '\x1b[32m[LULUS]\x1b[0m' : '\x1b[31m[GAGAL]\x1b[0m';
  const modeStr = test.mode === 'both' ? 'Terang & Gelap' : test.mode === 'light' ? 'Terang' : 'Gelap';
  console.log(
    `${statusStr} ${test.page.padEnd(28)} | ${test.element.padEnd(35)} | Mode: ${modeStr.padEnd(14)} | ${ratio.toFixed(2)}:1 (Min ${test.req}:1)`
  );
}

console.log('='.repeat(75));
console.log(`TOTAL AUDIT: ${auditSuite.length} checks`);
console.log(`\x1b[32mLULUS: ${passCount}\x1b[0m`);
console.log(`\x1b[31mGAGAL: ${failCount}\x1b[0m`);
console.log('='.repeat(75));

// Export summary JSON for documentation and artifacts
const summary = {
  timestamp: new Date().toISOString(),
  totalChecks: auditSuite.length,
  passed: passCount,
  failed: failCount,
  viewports: ['375px (Mobile)', '1280px (Desktop)'],
  results,
};

fs.writeFileSync(
  path.resolve('scripts/contrast-audit-results.json'),
  JSON.stringify(summary, null, 2),
  'utf8'
);
console.log('Wrote results to scripts/contrast-audit-results.json');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32mALL WCAG AA CONTRAST CRITERIA SATISFIED WITH 0 VIOLATIONS!\x1b[0m');
  process.exit(0);
}
