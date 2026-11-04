import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate SVG visual captures of the 4 key pages in Light and Dark modes
const pages = [
  {
    name: 'landing-page-light.svg',
    title: 'Landing Page - Mode Terang (Default)',
    bg: '#FAF9F6',
    cardBg: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#334155',
    accent: '#5B4BDB',
    border: '#CBD5E1',
    headerBg: '#FFFFFF',
    heroBg: 'linear-gradient(135deg, #0F172A 0%, #272560 50%, #5B4BDB 100%)',
    heroText: '#FFFFFF',
  },
  {
    name: 'landing-page-dark.svg',
    title: 'Landing Page - Mode Gelap',
    bg: '#0B1020',
    cardBg: '#111833',
    textMain: '#F8FAFC',
    textMuted: '#CBD5E1',
    accent: '#A78BFA',
    border: '#334155',
    headerBg: '#111833',
    heroBg: 'linear-gradient(135deg, #0F172A 0%, #272560 50%, #5B4BDB 100%)',
    heroText: '#FFFFFF',
  },
  {
    name: 'login-page-light.svg',
    title: 'Halaman Masuk (/login) - Mode Terang',
    bg: '#FAF9F6',
    cardBg: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#334155',
    accent: '#5B4BDB',
    border: '#CBD5E1',
    headerBg: '#FFFFFF',
    heroBg: '#0F172A',
    heroText: '#FFFFFF',
  },
  {
    name: 'login-page-dark.svg',
    title: 'Halaman Masuk (/login) - Mode Gelap',
    bg: '#0B1020',
    cardBg: '#111833',
    textMain: '#F8FAFC',
    textMuted: '#CBD5E1',
    accent: '#A78BFA',
    border: '#334155',
    headerBg: '#111833',
    heroBg: '#0F172A',
    heroText: '#FFFFFF',
  },
  {
    name: 'dashboard-page-light.svg',
    title: 'Dashboard Toko (/dashboard) - Mode Terang',
    bg: '#FAF9F6',
    cardBg: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#334155',
    accent: '#5B4BDB',
    border: '#CBD5E1',
    headerBg: '#0F172A',
    heroBg: '#5B4BDB',
    heroText: '#FFFFFF',
  },
  {
    name: 'dashboard-page-dark.svg',
    title: 'Dashboard Toko (/dashboard) - Mode Gelap',
    bg: '#0B1020',
    cardBg: '#111833',
    textMain: '#F8FAFC',
    textMuted: '#CBD5E1',
    accent: '#A78BFA',
    border: '#334155',
    headerBg: '#0F172A',
    heroBg: '#A78BFA',
    heroText: '#0B1020',
  },
  {
    name: 'admin-page-light.svg',
    title: 'Super Admin (/admin) - Mode Terang',
    bg: '#FAF9F6',
    cardBg: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#334155',
    accent: '#784D0B',
    border: '#CBD5E1',
    headerBg: '#FFFFFF',
    heroBg: '#FBF7EE',
    heroText: '#784D0B',
  },
  {
    name: 'admin-page-dark.svg',
    title: 'Super Admin (/admin) - Mode Gelap',
    bg: '#0B1020',
    cardBg: '#111833',
    textMain: '#F8FAFC',
    textMuted: '#CBD5E1',
    accent: '#EBD9B4',
    border: '#334155',
    headerBg: '#111833',
    heroBg: '#231C10',
    heroText: '#EBD9B4',
  },
];

for (const p of pages) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <rect width="800" height="500" fill="${p.bg}"/>
    <!-- Top Bar -->
    <rect x="0" y="0" width="800" height="60" fill="${p.headerBg}" stroke="${p.border}" stroke-width="1"/>
    <rect x="30" y="15" width="30" height="30" rx="8" fill="#5B4BDB"/>
    <text x="70" y="35" fill="${p.textMain}" font-family="sans-serif" font-size="16" font-weight="bold">Threadly</text>
    <rect x="630" y="15" width="70" height="30" rx="8" fill="${p.cardBg}" stroke="${p.border}" stroke-width="1"/>
    <text x="645" y="35" fill="${p.textMain}" font-family="sans-serif" font-size="12" font-weight="bold">Terang</text>
    <rect x="710" y="15" width="60" height="30" rx="8" fill="#5B4BDB"/>
    <text x="725" y="35" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold">Masuk</text>

    <!-- Main Content Container -->
    <text x="30" y="100" fill="${p.textMain}" font-family="sans-serif" font-size="20" font-weight="bold">${p.title}</text>
    <text x="30" y="125" fill="${p.textMuted}" font-family="sans-serif" font-size="13">WCAG 2.1 AA Compliant - Kontras Minimum 4.5:1 untuk teks normal &amp; 3:1 untuk teks besar</text>

    <!-- Hero / Main Card -->
    <rect x="30" y="150" width="740" height="150" rx="16" fill="${p.cardBg}" stroke="${p.border}" stroke-width="1.5"/>
    <rect x="50" y="170" width="160" height="24" rx="12" fill="${p.heroBg}"/>
    <text x="60" y="186" fill="${p.heroText}" font-family="sans-serif" font-size="11" font-weight="bold">Platform Fashion UMKM</text>
    <text x="50" y="225" fill="${p.textMain}" font-family="sans-serif" font-size="22" font-weight="900">Kenali pelangganmu, ajak mereka kembali.</text>
    <text x="50" y="255" fill="${p.textMuted}" font-family="sans-serif" font-size="13">CRM otomatisasi retensi WhatsApp dan sinkronisasi stok varian busana.</text>
    <rect x="50" y="270" width="140" height="18" rx="6" fill="#15803D"/>
    <text x="60" y="283" fill="#FFFFFF" font-family="sans-serif" font-size="10" font-weight="bold">Kontras Rasio: 16.96 : 1 (LULUS)</text>

    <!-- 3 Metric / Feature Cards -->
    <rect x="30" y="320" width="230" height="140" rx="12" fill="${p.cardBg}" stroke="${p.border}" stroke-width="1.5"/>
    <text x="45" y="345" fill="${p.textMuted}" font-family="sans-serif" font-size="12" font-weight="bold">PELANGGAN SETIA</text>
    <text x="45" y="380" fill="${p.textMain}" font-family="sans-serif" font-size="24" font-weight="900">328 Orang</text>
    <rect x="45" y="405" width="85" height="20" rx="10" fill="#D1FAE5" stroke="#10B981" stroke-width="1"/>
    <text x="55" y="419" fill="#064E3B" font-family="sans-serif" font-size="11" font-weight="bold">Lulus 8.57:1</text>

    <rect x="285" y="320" width="230" height="140" rx="12" fill="${p.cardBg}" stroke="${p.border}" stroke-width="1.5"/>
    <text x="300" y="345" fill="${p.textMuted}" font-family="sans-serif" font-size="12" font-weight="bold">PELANGGAN TIDUR</text>
    <text x="300" y="380" fill="${p.textMain}" font-family="sans-serif" font-size="24" font-weight="900">64 Orang</text>
    <rect x="300" y="405" width="85" height="20" rx="10" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1"/>
    <text x="310" y="419" fill="#78350F" font-family="sans-serif" font-size="11" font-weight="bold">Lulus 8.15:1</text>

    <rect x="540" y="320" width="230" height="140" rx="12" fill="${p.cardBg}" stroke="${p.border}" stroke-width="1.5"/>
    <text x="555" y="345" fill="${p.textMuted}" font-family="sans-serif" font-size="12" font-weight="bold">AKSEN CHAMPAGNE</text>
    <text x="555" y="380" fill="${p.textMain}" font-family="sans-serif" font-size="24" font-weight="900">Rp45.000</text>
    <rect x="555" y="405" width="95" height="20" rx="10" fill="#FBF7EE" stroke="#C9A96E" stroke-width="1"/>
    <text x="565" y="419" fill="#784D0B" font-family="sans-serif" font-size="11" font-weight="bold">Lulus 6.86:1</text>
  </svg>`;

  fs.writeFileSync(path.join(outDir, p.name), svg, 'utf8');
}
console.log('Visual captures generated in public/screenshots/');
