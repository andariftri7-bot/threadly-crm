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
  const isAdmin = p.name.startsWith('admin-page');
  const svg = isAdmin
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <rect width="800" height="500" fill="${p.bg}"/>
    <rect x="0" y="0" width="800" height="60" fill="${p.headerBg}" stroke="${p.border}" stroke-width="1"/>
    <rect x="30" y="15" width="30" height="30" rx="8" fill="#5B4BDB"/>
    <text x="70" y="35" fill="${p.textMain}" font-family="sans-serif" font-size="16" font-weight="bold">Threadly Platform Super Admin</text>
    <rect x="650" y="15" width="120" height="30" rx="8" fill="${p.heroBg}"/>
    <text x="670" y="34" fill="${p.heroText}" font-family="sans-serif" font-size="11" font-weight="bold">Platform Root</text>

    <text x="30" y="95" fill="${p.textMain}" font-family="sans-serif" font-size="18" font-weight="bold">${p.title}</text>
    <text x="30" y="116" fill="${p.textMuted}" font-family="sans-serif" font-size="12">Metrik Bersih (Total Toko &amp; Token AI), Grafik Recharts, Kuota AI, Alokasi Pembayaran, Ekspor .XLSX</text>

    <!-- 2 Top Cleaned Metric Cards -->
    <rect x="30" y="135" width="360" height="86" rx="14" fill="${p.cardBg}" stroke="${p.border}" stroke-width="1.5"/>
    <text x="50" y="160" fill="${p.textMuted}" font-family="sans-serif" font-size="11" font-weight="bold">TOTAL TOKO</text>
    <text x="50" y="192" fill="${p.textMain}" font-family="sans-serif" font-size="26" font-weight="900">3</text>
    <text x="85" y="192" fill="#15803D" font-family="sans-serif" font-size="11" font-weight="bold">3 toko aktif beroperasional</text>

    <rect x="410" y="135" width="360" height="86" rx="14" fill="${p.cardBg}" stroke="${p.border}" stroke-width="1.5"/>
    <text x="430" y="160" fill="${p.textMuted}" font-family="sans-serif" font-size="11" font-weight="bold">TOTAL KONSUMSI TOKEN AI PLATFORM</text>
    <text x="430" y="192" fill="#6D5BE8" font-family="sans-serif" font-size="26" font-weight="900">148.800</text>
    <text x="550" y="192" fill="${p.textMuted}" font-family="sans-serif" font-size="11">75 eksekusi AI</text>

    <!-- Chart Preview & AI Quota Monitor -->
    <rect x="30" y="238" width="460" height="232" rx="14" fill="${p.cardBg}" stroke="${p.border}" stroke-width="1.5"/>
    <text x="50" y="264" fill="${p.textMain}" font-family="sans-serif" font-size="13" font-weight="bold">Tren Akumulasi Pemasukan Platform &amp; Alokasi Pembayaran</text>
    <polyline points="55,410 135,385 215,355 295,325 375,295 460,280" fill="none" stroke="#6D5BE8" stroke-width="3"/>
    <rect x="55" y="425" width="135" height="28" rx="8" fill="#5B4BDB"/>
    <text x="72" y="443" fill="#FFFFFF" font-family="sans-serif" font-size="11" font-weight="bold">Unduh File Excel</text>
    <rect x="205" y="425" width="165" height="28" rx="8" fill="${p.heroBg}" stroke="#C9A96E" stroke-width="1"/>
    <text x="218" y="443" fill="${p.heroText}" font-family="sans-serif" font-size="11" font-weight="bold">Kelola Alokasi Pembayaran</text>

    <rect x="510" y="238" width="260" height="232" rx="14" fill="${p.cardBg}" stroke="${p.border}" stroke-width="1.5"/>
    <text x="528" y="264" fill="${p.textMain}" font-family="sans-serif" font-size="13" font-weight="bold">Kuota Token AI &amp; Notifikasi</text>
    <rect x="528" y="282" width="224" height="50" rx="8" fill="${p.bg}" stroke="${p.border}" stroke-width="1"/>
    <text x="540" y="302" fill="${p.textMain}" font-family="sans-serif" font-size="11" font-weight="bold">Koleksi Lokal (Standar)</text>
    <rect x="665" y="288" width="76" height="18" rx="9" fill="#FFE4E6"/>
    <text x="674" y="301" fill="#881337" font-family="sans-serif" font-size="9" font-weight="bold">Token Habis</text>
    <rect x="540" y="314" width="200" height="6" rx="3" fill="#DC2626"/>

    <rect x="528" y="344" width="224" height="50" rx="8" fill="${p.bg}" stroke="${p.border}" stroke-width="1"/>
    <text x="540" y="364" fill="${p.textMain}" font-family="sans-serif" font-size="11" font-weight="bold">Batik Heritage (Pro)</text>
    <rect x="665" y="350" width="76" height="18" rx="9" fill="#FEF3C7"/>
    <text x="671" y="363" fill="#78350F" font-family="sans-serif" font-size="9" font-weight="bold">Hampir Habis</text>
    <rect x="540" y="376" width="172" height="6" rx="3" fill="#F59E0B"/>

    <rect x="528" y="406" width="224" height="50" rx="8" fill="${p.bg}" stroke="${p.border}" stroke-width="1"/>
    <text x="540" y="426" fill="${p.textMain}" font-family="sans-serif" font-size="11" font-weight="bold">Urban Thrift (Standar)</text>
    <rect x="688" y="412" width="52" height="18" rx="9" fill="#D1FAE5"/>
    <text x="701" y="425" fill="#064E3B" font-family="sans-serif" font-size="9" font-weight="bold">Aman</text>
    <rect x="540" y="438" width="60" height="6" rx="3" fill="#16A34A"/>
  </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
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

// Generate Mobile Visual Captures (390x844 iPhone 12/13/14 size)
const mobilePages = [
  {
    name: 'landing-page-mobile.svg',
    title: 'Landing Page (Mobile 390px)',
    bg: '#FAF9F6',
    headerBg: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#334155',
    cardBg: '#FFFFFF',
    border: '#E2E8F0',
  },
  {
    name: 'dashboard-page-mobile.svg',
    title: 'Dashboard Toko (Mobile 390px)',
    bg: '#FAF9F6',
    headerBg: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#334155',
    cardBg: '#FFFFFF',
    border: '#E2E8F0',
    hasBottomNav: true,
  },
  {
    name: 'customers-page-mobile.svg',
    title: 'Pelanggan Toko (Mobile 390px)',
    bg: '#FAF9F6',
    headerBg: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#334155',
    cardBg: '#FFFFFF',
    border: '#E2E8F0',
    hasBottomNav: true,
  },
  {
    name: 'admin-page-mobile.svg',
    title: 'Super Admin (Mobile 390px)',
    bg: '#FAF9F6',
    headerBg: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#334155',
    cardBg: '#FFFFFF',
    border: '#E2E8F0',
    isAdminMobile: true,
  },
];

for (const mp of mobilePages) {
  const svg = mp.isAdminMobile
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">
    <rect width="390" height="844" fill="${mp.bg}"/>
    <rect x="0" y="0" width="390" height="70" fill="${mp.headerBg}" stroke="${mp.border}" stroke-width="1"/>
    <rect x="20" y="22" width="28" height="28" rx="8" fill="#5B4BDB"/>
    <text x="56" y="41" fill="${mp.textMain}" font-family="sans-serif" font-size="14" font-weight="bold">Threadly Super Admin</text>
    <text x="20" y="102" fill="${mp.textMain}" font-family="sans-serif" font-size="16" font-weight="bold">${mp.title}</text>
    <text x="20" y="122" fill="${mp.textMuted}" font-family="sans-serif" font-size="11">Total Toko, Token AI, Kuota AI &amp; Ekspor .XLSX</text>
    <rect x="20" y="140" width="168" height="82" rx="12" fill="${mp.cardBg}" stroke="${mp.border}" stroke-width="1.5"/>
    <text x="32" y="164" fill="${mp.textMuted}" font-family="sans-serif" font-size="10" font-weight="bold">TOTAL TOKO</text>
    <text x="32" y="196" fill="${mp.textMain}" font-family="sans-serif" font-size="22" font-weight="900">3</text>
    <rect x="202" y="140" width="168" height="82" rx="12" fill="${mp.cardBg}" stroke="${mp.border}" stroke-width="1.5"/>
    <text x="214" y="164" fill="${mp.textMuted}" font-family="sans-serif" font-size="9" font-weight="bold">TOKEN AI PLATFORM</text>
    <text x="214" y="196" fill="#5B4BDB" font-family="sans-serif" font-size="20" font-weight="900">148.800</text>
    <rect x="20" y="240" width="350" height="175" rx="14" fill="${mp.cardBg}" stroke="${mp.border}" stroke-width="1.5"/>
    <text x="34" y="266" fill="${mp.textMain}" font-family="sans-serif" font-size="13" font-weight="bold">Koleksi Lokal Boutique</text>
    <rect x="275" y="250" width="80" height="22" rx="11" fill="#FFE4E6"/>
    <text x="284" y="264" fill="#881337" font-family="sans-serif" font-size="10" font-weight="bold">Token Habis</text>
    <text x="34" y="292" fill="${mp.textMuted}" font-family="sans-serif" font-size="11">15.300 / 15.000 token (102%)</text>
    <rect x="34" y="304" width="320" height="8" rx="4" fill="#DC2626"/>
    <rect x="34" y="330" width="160" height="34" rx="8" fill="#047857"/>
    <text x="48" y="351" fill="#FFFFFF" font-family="sans-serif" font-size="11" font-weight="bold">Notifikasi WhatsApp</text>
    <rect x="204" y="330" width="150" height="34" rx="8" fill="#F1F5F9" stroke="${mp.border}" stroke-width="1"/>
    <text x="242" y="351" fill="${mp.textMain}" font-family="sans-serif" font-size="11" font-weight="bold">Kirim Email</text>
    <rect x="20" y="432" width="350" height="145" rx="14" fill="${mp.cardBg}" stroke="${mp.border}" stroke-width="1.5"/>
    <text x="34" y="458" fill="${mp.textMain}" font-family="sans-serif" font-size="13" font-weight="bold">Batik Heritage Solo (Pro)</text>
    <rect x="268" y="442" width="86" height="22" rx="11" fill="#FEF3C7"/>
    <text x="276" y="456" fill="#78350F" font-family="sans-serif" font-size="10" font-weight="bold">Hampir Habis</text>
    <text x="34" y="484" fill="${mp.textMuted}" font-family="sans-serif" font-size="11">129.000 / 150.000 token (86%)</text>
    <rect x="34" y="496" width="275" height="8" rx="4" fill="#F59E0B"/>
    <rect x="34" y="520" width="160" height="34" rx="8" fill="#5B4BDB"/>
    <text x="64" y="541" fill="#FFFFFF" font-family="sans-serif" font-size="11" font-weight="bold">Unduh File Excel</text>
  </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">
    <rect width="390" height="844" fill="${mp.bg}"/>
    <!-- Safe Area / Header -->
    <rect x="0" y="0" width="390" height="70" fill="${mp.headerBg}" stroke="${mp.border}" stroke-width="1"/>
    <rect x="20" y="24" width="28" height="28" rx="8" fill="#5B4BDB"/>
    <text x="56" y="43" fill="${mp.textMain}" font-family="sans-serif" font-size="16" font-weight="bold">Threadly</text>
    <rect x="334" y="24" width="36" height="28" rx="6" fill="#F1F5F9" stroke="${mp.border}" stroke-width="1"/>
    <line x1="342" y1="33" x2="362" y2="33" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
    <line x1="342" y1="38" x2="362" y2="38" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
    <line x1="342" y1="43" x2="362" y2="43" stroke="#475569" stroke-width="2" stroke-linecap="round"/>

    <!-- Content Area -->
    <text x="20" y="105" fill="${mp.textMain}" font-family="sans-serif" font-size="18" font-weight="bold">${mp.title}</text>
    <text x="20" y="125" fill="${mp.textMuted}" font-family="sans-serif" font-size="12">Desain Mobile-First Tanpa Guliran Horizontal</text>

    <!-- Main Mobile Card -->
    <rect x="20" y="145" width="350" height="130" rx="16" fill="${mp.cardBg}" stroke="${mp.border}" stroke-width="1.5"/>
    <text x="36" y="175" fill="${mp.textMain}" font-family="sans-serif" font-size="16" font-weight="bold">Ringkasan Kinerja Toko</text>
    <text x="36" y="198" fill="${mp.textMuted}" font-family="sans-serif" font-size="12">Responsif pada viewport 360px - 430px</text>
    <rect x="36" y="220" width="120" height="36" rx="8" fill="#5B4BDB"/>
    <text x="56" y="243" fill="#FFFFFF" font-family="sans-serif" font-size="12" font-weight="bold">Aksi Utama</text>

    <!-- 2 Column Mobile Stat Grid -->
    <rect x="20" y="290" width="168" height="90" rx="12" fill="${mp.cardBg}" stroke="${mp.border}" stroke-width="1.5"/>
    <text x="32" y="315" fill="${mp.textMuted}" font-family="sans-serif" font-size="11" font-weight="bold">PELANGGAN</text>
    <text x="32" y="345" fill="${mp.textMain}" font-family="sans-serif" font-size="20" font-weight="900">328</text>

    <rect x="202" y="290" width="168" height="90" rx="12" fill="${mp.cardBg}" stroke="${mp.border}" stroke-width="1.5"/>
    <text x="214" y="315" fill="${mp.textMuted}" font-family="sans-serif" font-size="11" font-weight="bold">PESANAN</text>
    <text x="214" y="345" fill="${mp.textMain}" font-family="sans-serif" font-size="20" font-weight="900">64</text>

    <!-- Mobile Card List Item 1 -->
    <rect x="20" y="395" width="350" height="85" rx="12" fill="${mp.cardBg}" stroke="${mp.border}" stroke-width="1.5"/>
    <text x="36" y="425" fill="${mp.textMain}" font-family="sans-serif" font-size="14" font-weight="bold">Dinda Ayu Putri</text>
    <text x="36" y="445" fill="${mp.textMuted}" font-family="sans-serif" font-size="12">081234567890 - 4 Pesanan</text>
    <rect x="270" y="415" width="85" height="24" rx="12" fill="#D1FAE5"/>
    <text x="285" y="431" fill="#064E3B" font-family="sans-serif" font-size="10" font-weight="bold">LANGGANAN</text>

    <!-- Mobile Card List Item 2 -->
    <rect x="20" y="495" width="350" height="85" rx="12" fill="${mp.cardBg}" stroke="${mp.border}" stroke-width="1.5"/>
    <text x="36" y="525" fill="${mp.textMain}" font-family="sans-serif" font-size="14" font-weight="bold">Budi Santoso</text>
    <text x="36" y="545" fill="${mp.textMuted}" font-family="sans-serif" font-size="12">082198765432 - 1 Pesanan</text>
    <rect x="290" y="515" width="65" height="24" rx="12" fill="#FEF3C7"/>
    <text x="305" y="531" fill="#78350F" font-family="sans-serif" font-size="10" font-weight="bold">BARU</text>

    ${mp.hasBottomNav ? `
    <!-- Mobile Floating Action Button (FAB) -->
    <circle cx="330" cy="710" r="28" fill="#5B4BDB"/>
    <line x1="330" y1="698" x2="330" y2="722" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    <line x1="318" y1="710" x2="342" y2="710" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>

    <!-- Bottom Navigation Bar (5 tabs) -->
    <rect x="0" y="760" width="390" height="84" fill="#FFFFFF" stroke="${mp.border}" stroke-width="1"/>
    <!-- Tab 1 -->
    <rect x="20" y="772" width="24" height="20" rx="4" fill="#5B4BDB"/>
    <text x="14" y="806" fill="#5B4BDB" font-family="sans-serif" font-size="10" font-weight="bold">Beranda</text>
    <!-- Tab 2 -->
    <circle cx="115" cy="782" r="9" fill="#94A3B8"/>
    <text x="96" y="806" fill="#64748B" font-family="sans-serif" font-size="10">Pelanggan</text>
    <!-- Tab 3 -->
    <rect x="190" y="774" width="18" height="16" rx="2" fill="#94A3B8"/>
    <text x="183" y="806" fill="#64748B" font-family="sans-serif" font-size="10">Pesanan</text>
    <!-- Tab 4 -->
    <circle cx="275" cy="782" r="9" fill="#94A3B8"/>
    <text x="262" y="806" fill="#64748B" font-family="sans-serif" font-size="10">Produk</text>
    <!-- Tab 5 -->
    <line x1="345" y1="777" x2="365" y2="777" stroke="#94A3B8" stroke-width="2"/>
    <line x1="345" y1="782" x2="365" y2="782" stroke="#94A3B8" stroke-width="2"/>
    <line x1="345" y1="787" x2="365" y2="787" stroke="#94A3B8" stroke-width="2"/>
    <text x="343" y="806" fill="#64748B" font-family="sans-serif" font-size="10">Lainnya</text>
    ` : ''}
  </svg>`;

  fs.writeFileSync(path.join(outDir, mp.name), svg, 'utf8');
}

console.log('Desktop and mobile visual captures generated in public/screenshots/');
