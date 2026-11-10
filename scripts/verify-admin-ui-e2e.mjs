/**
 * THREADLY - Real Browser Headless Chrome E2E Verification & Screenshot Capture
 * Tests /admin against live production build (`next start`):
 * 1. Unauthorized access -> 404
 * 2. Superadmin login (andariftri7@gmail.com) -> /admin redirect
 * 3. BAGIAN 1: Cleaned metrics & removed redundant cards/tab
 * 4. BAGIAN 2: AI Quota Monitor table, progress bars, Aman/Hampir Habis/Token Habis badges, WA & Email links
 * 5. BAGIAN 3: Recharts AreaChart & DonutChart rendering
 * 6. BAGIAN 4: Editable Payment Method Allocations modal -> Save -> Persist across reload -> Dynamic % bar chart
 * 7. BAGIAN 5: SheetJS .xlsx Excel download (unfiltered + filtered) verified with real XLSX.readFile
 * 8. Responsive mobile (390px) no horizontal overflow + Light/Dark mode PNG screenshots
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const PORT = 3099;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CDP_PORT = 9299;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sleep = ms => new Promise(r => setTimeout(r, ms));

let passed = 0;
let failed = 0;
function check(cond, label) {
  if (cond) {
    console.log(`  [PASS] ${label}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${label}`);
    failed++;
  }
}

async function waitForHttp(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return true;
    } catch {
      // retry
    }
    await sleep(300);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.exceptions = [];
  }

  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
        if (msg.method === 'Runtime.exceptionThrown') {
          this.exceptions.push(msg.params?.exceptionDetails?.text || 'RuntimeException');
        }
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout for ${method}`));
      }, 15000);
      this.pending.set(id, {
        resolve: val => {
          clearTimeout(timer);
          resolve(val);
        },
        reject: err => {
          clearTimeout(timer);
          reject(err);
        },
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evalJs(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`JS Eval error: ${res.exceptionDetails.text}`);
    }
    return res.result?.value;
  }

  async screenshot(outFile, fullPage = false) {
    let clip;
    if (fullPage) {
      const metrics = await this.send('Page.getLayoutMetrics');
      const contentSize = metrics.cssContentSize || metrics.contentSize;
      clip = {
        x: 0,
        y: 0,
        width: Math.ceil(contentSize.width),
        height: Math.min(3500, Math.ceil(contentSize.height)),
        scale: 1,
      };
    }
    const { data } = await this.send('Page.captureScreenshot', {
      format: 'png',
      ...(clip ? { clip, captureBeyondViewport: true } : {}),
    });
    fs.writeFileSync(outFile, Buffer.from(data, 'base64'));
  }

  close() {
    try {
      this.ws.close();
    } catch {
      // ignore
    }
  }
}

async function main() {
  const tmpProfileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'threadly-chrome-'));
  const tmpDownloadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'threadly-dl-'));
  const screenshotsDir = path.resolve('public/screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log('1. Starting Next.js production server on port', PORT);
  const nextProc = spawn('cmd.exe', ['/c', `npx.cmd next start -p ${PORT} -H 127.0.0.1`], {
    cwd: process.cwd(),
    stdio: 'pipe',
  });

  let chromeProc = null;
  let cdp = null;

  try {
    await waitForHttp(`${BASE_URL}/`, 30000);
    console.log('   Next.js server ready.');

    console.log('2. Launching Headless Chrome...');
    chromeProc = spawn(CHROME_PATH, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${tmpProfileDir}`,
      '--window-size=1280,900',
      'about:blank',
    ]);

    await waitForHttp(`http://127.0.0.1:${CDP_PORT}/json/version`, 15000);
    const targetsRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];

    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');
    await cdp.send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: tmpDownloadDir,
      eventsEnabled: true,
    });
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // Test 1: Unauthorized /admin and /api/admin return 404
    console.log('\n3. Testing unauthorized /admin and /api/admin return 404...');
    const unauthRes = await fetch(`${BASE_URL}/admin`);
    const unauthBody = await unauthRes.text();
    check(unauthRes.status === 404 && unauthBody.includes('Halaman Tidak Ditemukan'), `Unauthenticated HTTP GET /admin returns 404 (got ${unauthRes.status})`);
    const unauthApiRes = await fetch(`${BASE_URL}/api/admin`);
    check(unauthApiRes.status === 404, `Unauthenticated HTTP GET /api/admin returns 404 (got ${unauthApiRes.status})`);

    // Test 2: Visit /login, load seed data, sign in as andariftri7@gmail.com
    console.log('\n4. Logging in as Super Admin (andariftri7@gmail.com)...');
    await cdp.send('Page.navigate', { url: `${BASE_URL}/login` });
    await sleep(1800);

    // Ensure dark mode & hide floating PWA banner so screenshots are unobstructed
    await cdp.evalJs(`localStorage.setItem('threadly_theme', 'dark'); localStorage.setItem('threadly_pwa_dismissed', 'true')`);

    // Fill email & password via React-compatible native value setter and submit form
    await cdp.evalJs(`
      (function() {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const emailEl = document.querySelector('input[type="email"]');
        const passEl = document.querySelector('input[type="password"]');
        setter.call(emailEl, 'andariftri7@gmail.com');
        emailEl.dispatchEvent(new Event('input', { bubbles: true }));
        setter.call(passEl, 'AdminPassword123!');
        passEl.dispatchEvent(new Event('input', { bubbles: true }));
      })()
    `);
    await sleep(300);
    await cdp.evalJs(`document.querySelector('form button[type="submit"]').click()`);
    await sleep(2500);

    // Reload once so dark theme class and seeded aiRuns are cleanly applied
    const currentUrl = await cdp.evalJs(`window.location.pathname`);
    check(currentUrl === '/admin', `Superadmin login redirects to /admin (actual: ${currentUrl})`);
    await cdp.send('Page.reload', { ignoreCache: false });
    await sleep(2000);

    // Test 3: BAGIAN 1 Verification in live DOM
    console.log('\n5. Verifying BAGIAN 1 (Cleanup & Top Metrics) in live DOM...');
    const bodyTextOverview = await cdp.evalJs(`document.body.innerText`);
    check(bodyTextOverview.includes('TOTAL TOKO'), 'Live DOM renders "TOTAL TOKO" card');
    check(bodyTextOverview.includes('TOTAL KONSUMSI TOKEN AI PLATFORM'), 'Live DOM renders "TOTAL KONSUMSI TOKEN AI PLATFORM" card');
    check(bodyTextOverview.includes('148.800'), 'Live DOM displays aggregated AI tokens (148.800)');
    check(!bodyTextOverview.toUpperCase().includes('TOTAL PELANGGAN'), 'Live DOM removed "TOTAL PELANGGAN" card');
    check(!bodyTextOverview.toUpperCase().includes('TOTAL PESANAN'), 'Live DOM removed "TOTAL PESANAN" card');
    check(!bodyTextOverview.toUpperCase().includes('AUDIT KEAMANAN'), 'Live DOM removed "AUDIT KEAMANAN" card');
    check(!bodyTextOverview.includes('Audit Log Kepatuhan Privasi'), 'Live DOM removed "Audit Log Kepatuhan Privasi" tab');
    check(!/\p{Extended_Pictographic}/u.test(bodyTextOverview), 'Live DOM overview tab contains ZERO emoji');

    await cdp.screenshot(path.join(screenshotsDir, 'admin-overview-dark.png'), true);
    console.log('   Saved screenshot: public/screenshots/admin-overview-dark.png');

    // Test 4: BAGIAN 3, 4, 5 — Finance Tab, Recharts, Editable Allocations, Excel Export
    console.log('\n6. Verifying BAGIAN 3, 4 & 5 (Finance Charts, Editable Allocations, SheetJS Excel)...');
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Laporan Keuangan Interaktif')).click()
    `);
    await sleep(1200);

    const financeStats = await cdp.evalJs(`
      ({
        svgCount: document.querySelectorAll('.recharts-surface').length,
        text: document.body.innerText
      })
    `);
    check(financeStats.svgCount >= 3, `Recharts rendered >= 3 chart SVGs (Area, Donut, Horizontal Bar) (actual: ${financeStats.svgCount})`);
    check(financeStats.text.includes('Tren Pertumbuhan Akumulasi Pemasukan Platform'), 'Area Chart heading rendered');
    check(financeStats.text.includes('Porsi Pendapatan Paket'), 'Donut Chart heading rendered');
    check(financeStats.text.includes('Kelola Alokasi Pembayaran'), 'Button "Kelola Alokasi Pembayaran" rendered');
    check(financeStats.text.includes('Unduh File Excel'), 'Button "Unduh File Excel" rendered');
    check(!financeStats.text.includes('19 Nov 2026'), 'No future-dated Lunas transactions (19 Nov 2026) appear in table');
    check(!/\p{Extended_Pictographic}/u.test(financeStats.text), 'Live DOM finance tab contains ZERO emoji');

    await cdp.screenshot(path.join(screenshotsDir, 'admin-finance-dark.png'), true);
    console.log('   Saved screenshot: public/screenshots/admin-finance-dark.png');

    // Edge case: Bulan Ini filter -> single-point AreaChart MUST still render visible dot circles
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Bulan Ini').click()
    `);
    await sleep(600);
    const singlePointDots = await cdp.evalJs(`document.querySelectorAll('.recharts-area-dots circle, .recharts-dot').length`);
    check(singlePointDots >= 1, `Single-period AreaChart (Bulan Ini) renders visible dot circles (found: ${singlePointDots})`);
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Semua Waktu').click()
    `);
    await sleep(400);

    // Open Kelola Alokasi Pembayaran Modal
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kelola Alokasi Pembayaran')).click()
    `);
    await sleep(500);
    const modalText = await cdp.evalJs(`document.body.innerText`);
    check(
      modalText.includes('Virtual Account') &&
      modalText.includes('E-Wallet (QRIS/GoPay/OVO/ShopeePay)') &&
      modalText.includes('Auto-Debit') &&
      modalText.includes('Transfer Bank'),
      'Modal displays all 4 editable payment method categories'
    );
    await cdp.screenshot(path.join(screenshotsDir, 'admin-allocation-modal-dark.png'), false);
    console.log('   Saved screenshot: public/screenshots/admin-allocation-modal-dark.png');

    // Edge case: Test setting ALL 4 payment methods to 0 -> verify 0% without NaN
    await cdp.evalJs(`
      (function() {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const numInputs = Array.from(document.querySelectorAll('input[type="number"]'));
        numInputs.forEach(inp => {
          setter.call(inp, '0');
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        });
      })()
    `);
    await sleep(250);
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Simpan Perubahan')).click()
    `);
    await sleep(700);
    const zeroSaveText = await cdp.evalJs(`document.body.innerText`);
    check(!zeroSaveText.includes('NaN') && zeroSaveText.includes('0% dari total alokasi'), 'Zeroed allocations render 0% cleanly without NaN');

    // Re-open modal and verify clearing input with empty string "" then typing 500000 / 12 works cleanly
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Kelola Alokasi Pembayaran')).click()
    `);
    await sleep(400);
    await cdp.evalJs(`
      (function() {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const numInputs = Array.from(document.querySelectorAll('input[type="number"]'));
        // First clear to empty string to test typing UX
        if (numInputs[2]) {
          setter.call(numInputs[2], '');
          numInputs[2].dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `);
    const clearedVal = await cdp.evalJs(`document.querySelectorAll('input[type="number"]')[2]?.value`);
    check(clearedVal === '', 'Clearing numeric input in modal allows empty string without snapping to 0');

    // Restore realistic values and set E-Wallet to 500000 / 12
    await cdp.evalJs(`
      (function() {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const numInputs = Array.from(document.querySelectorAll('input[type="number"]'));
        const vals = ['85000', '3', '500000', '12', '85000', '3', '85000', '3'];
        vals.forEach((v, idx) => {
          if (numInputs[idx]) {
            setter.call(numInputs[idx], v);
            numInputs[idx].dispatchEvent(new Event('input', { bubbles: true }));
            numInputs[idx].dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      })()
    `);
    await sleep(300);
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Simpan Perubahan')).click()
    `);
    await sleep(800);

    // Verify dynamic update AND persistence even after wiping localStorage (proving server persistence!)
    const afterSaveText = await cdp.evalJs(`document.body.innerText`);
    check(afterSaveText.includes('Rp500.000') && afterSaveText.includes('12 trx'), 'Edited payment allocation updated immediately on page');

    await cdp.evalJs(`localStorage.removeItem('threadly_platform_payment_allocations')`);
    await cdp.send('Page.reload', { ignoreCache: false });
    await sleep(1600);
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Laporan Keuangan Interaktif')).click()
    `);
    await sleep(900);
    const afterReloadText = await cdp.evalJs(`document.body.innerText`);
    check(afterReloadText.includes('Rp500.000') && afterReloadText.includes('12 trx'), 'Saved payment allocation persisted across page reload even with wiped localStorage (server API persistence)');

    // Test BAGIAN 5: Unfiltered Excel download
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Unduh File Excel')).click()
    `);
    let downloadedFile = null;
    for (let i = 0; i < 20; i++) {
      const files = fs.readdirSync(tmpDownloadDir).filter(f => f.endsWith('.xlsx'));
      if (files.length > 0) {
        downloadedFile = files[0];
        break;
      }
      await sleep(250);
    }
    check(Boolean(downloadedFile && /^Laporan_Transaksi_Threadly_\d{4}-\d{2}-\d{2}\.xlsx$/.test(downloadedFile)),
      `Excel downloaded with required naming format: ${downloadedFile}`);

    if (downloadedFile) {
      const wbAll = XLSX.readFile(path.join(tmpDownloadDir, downloadedFile));
      const sheetAll = wbAll.Sheets[wbAll.SheetNames[0]];
      const rowsAll = XLSX.utils.sheet_to_json(sheetAll);
      const headersAll = XLSX.utils.sheet_to_json(sheetAll, { header: 1 })[0];
      check(
        JSON.stringify(headersAll) === JSON.stringify(['No Tagihan', 'Nama Toko', 'Paket', 'Periode', 'Metode Bayar', 'Nominal', 'Tanggal', 'Status']),
        `Excel contains exact 8 required columns: ${JSON.stringify(headersAll)}`
      );
      check(rowsAll.length >= 10, `Unfiltered Excel exported all subscription rows (${rowsAll.length} rows)`);
      fs.unlinkSync(path.join(tmpDownloadDir, downloadedFile));
    }

    // Filter by Paket Pro and test filtered Excel export
    await cdp.evalJs(`
      (function() {
        const sel = document.querySelector('select[aria-label="Filter Paket Langganan"]');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        setter.call(sel, 'pro');
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      })()
    `);
    await sleep(500);
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Unduh File Excel')).click()
    `);
    let filteredExcelFile = null;
    for (let i = 0; i < 20; i++) {
      const files = fs.readdirSync(tmpDownloadDir).filter(f => f.endsWith('.xlsx'));
      if (files.length > 0) {
        filteredExcelFile = files[0];
        break;
      }
      await sleep(250);
    }
    if (filteredExcelFile) {
      const wbPro = XLSX.readFile(path.join(tmpDownloadDir, filteredExcelFile));
      const rowsPro = XLSX.utils.sheet_to_json(wbPro.Sheets[wbPro.SheetNames[0]]);
      const allArePro = rowsPro.length > 0 && rowsPro.every(r => r['Paket'] === 'Paket Pro');
      check(allArePro, `Filtered Excel (Paket Pro) exported ONLY Pro transactions (${rowsPro.length} rows)`);
      fs.unlinkSync(path.join(tmpDownloadDir, filteredExcelFile));
    } else {
      check(false, 'Filtered Excel download succeeded');
    }

    // Edge case: Export .xlsx when search filter yields 0 rows
    await cdp.evalJs(`
      (function() {
        const inp = document.querySelector('input[placeholder="Cari transaksi / toko..."]');
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(inp, 'TokoYangTidakAdaXYZ999');
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      })()
    `);
    await sleep(400);
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Unduh File Excel')).click()
    `);
    let emptyExcelFile = null;
    for (let i = 0; i < 20; i++) {
      const files = fs.readdirSync(tmpDownloadDir).filter(f => f.endsWith('.xlsx'));
      if (files.length > 0) {
        emptyExcelFile = files[0];
        break;
      }
      await sleep(250);
    }
    if (emptyExcelFile) {
      const wbEmpty = XLSX.readFile(path.join(tmpDownloadDir, emptyExcelFile));
      const sheetEmpty = wbEmpty.Sheets[wbEmpty.SheetNames[0]];
      const rowsEmpty = XLSX.utils.sheet_to_json(sheetEmpty);
      const headersEmpty = XLSX.utils.sheet_to_json(sheetEmpty, { header: 1 })[0];
      check(headersEmpty.length === 8 && rowsEmpty.length === 0, 'Empty search Excel export preserves 8 headers with 0 rows');
      fs.unlinkSync(path.join(tmpDownloadDir, emptyExcelFile));
    } else {
      check(false, 'Empty search Excel download succeeded');
    }

    // Clear search and plan filter before Light Mode screenshot
    await cdp.evalJs(`
      (function() {
        const sel = document.querySelector('select[aria-label="Filter Paket Langganan"]');
        const selSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        selSetter.call(sel, 'all');
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        const inp = document.querySelector('input[placeholder="Cari transaksi / toko..."]');
        const inpSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        inpSetter.call(inp, '');
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      })()
    `);

    // Test Light Mode on Finance Tab & Screenshot
    await cdp.evalJs(`localStorage.setItem('threadly_theme', 'light')`);
    await cdp.send('Page.reload', { ignoreCache: false });
    await sleep(1600);
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Laporan Keuangan Interaktif')).click()
    `);
    await sleep(1000);
    const isLightClass = await cdp.evalJs(`!document.documentElement.classList.contains('dark')`);
    check(isLightClass, 'Theme toggle / Light Mode activates cleanly without dark class');
    await cdp.screenshot(path.join(screenshotsDir, 'admin-finance-light.png'), true);
    console.log('   Saved screenshot: public/screenshots/admin-finance-light.png');

    // Switch back to Dark Mode for AI Quota Tab
    await cdp.evalJs(`localStorage.setItem('threadly_theme', 'dark')`);
    await cdp.send('Page.reload', { ignoreCache: false });
    await sleep(1600);

    // Test 5: BAGIAN 2 — AI Logs / Quota Monitoring Tab & WA/Email Links
    console.log('\n7. Verifying BAGIAN 2 (AI Token Quota Table & WhatsApp/Email Links)...');
    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Log Pemakaian AI')).click()
    `);
    await sleep(800);

    const aiTabAudit = await cdp.evalJs(`
      (function() {
        const text = document.body.innerText;
        const waLinks = Array.from(document.querySelectorAll('a[href^="https://wa.me/"]')).map(a => a.getAttribute('href'));
        const mailLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]')).map(a => a.getAttribute('href'));
        return { text, waLinks, mailLinks };
      })()
    `);
    check(aiTabAudit.text.includes('Token Habis') && aiTabAudit.text.includes('Hampir Habis') && aiTabAudit.text.includes('Aman'),
      'AI Quota table renders all 3 quota statuses (Token Habis, Hampir Habis, Aman)');
    check(aiTabAudit.waLinks.length >= 3, `Rendered ${aiTabAudit.waLinks.length} WhatsApp notification links`);
    const sampleWaDecoded = decodeURIComponent(aiTabAudit.waLinks[0] || '');
    check(
      aiTabAudit.waLinks[0]?.startsWith('https://wa.me/62') &&
      sampleWaDecoded.includes('kuota AI asisten Threadly CRM kamu untuk periode ini telah habis / mencapai batas'),
      'WhatsApp link formats normalized 62... number and required auto-draft message'
    );
    check(aiTabAudit.mailLinks.length >= 3, `Rendered ${aiTabAudit.mailLinks.length} mailto: notification links`);
    const mailPrefix = (aiTabAudit.mailLinks[0] || '').split('?')[0];
    check(
      mailPrefix.includes('@') &&
      !mailPrefix.includes('%40') &&
      aiTabAudit.mailLinks[0]?.includes('subject=Pemberitahuan%20Kuota%20AI%20Threadly%20CRM') &&
      decodeURIComponent(aiTabAudit.mailLinks[0] || '').includes('kuota AI asisten Threadly CRM kamu untuk periode ini telah habis / mencapai batas'),
      'Email mailto link preserves raw @ address and includes required subject & reminder body'
    );
    check(!/\p{Extended_Pictographic}/u.test(aiTabAudit.text), 'Live DOM AI Quota tab contains ZERO emoji');

    await cdp.screenshot(path.join(screenshotsDir, 'admin-ai-quota-dark.png'), true);
    console.log('   Saved screenshot: public/screenshots/admin-ai-quota-dark.png');

    // Test 6: Mobile Viewport 390x844 responsiveness (AI Quota + Finance Tabs)
    console.log('\n8. Verifying Mobile 390x844 responsiveness & screenshots...');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await sleep(500);
    const mobileAiOverflow = await cdp.evalJs(`document.documentElement.scrollWidth <= window.innerWidth`);
    check(mobileAiOverflow, 'Mobile 390px AI Quota layout has zero horizontal overflow');
    await cdp.screenshot(path.join(screenshotsDir, 'admin-mobile.png'), true);
    console.log('   Saved screenshot: public/screenshots/admin-mobile.png');

    await cdp.evalJs(`
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Laporan Keuangan Interaktif')).click()
    `);
    await sleep(900);
    const mobileFinanceOverflow = await cdp.evalJs(`document.documentElement.scrollWidth <= window.innerWidth`);
    check(mobileFinanceOverflow, 'Mobile 390px Finance Charts layout has zero horizontal overflow');

    // Reset server-side fallback setting so workspace stays clean
    await cdp.evalJs(`
      fetch('/api/admin/payment-allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true })
      })
    `);
    await sleep(300);

    // Test 7: Verify payment link target /settings?tab=billing&upgrade=pro as Store Owner
    console.log('\n9. Verifying /settings?tab=billing&upgrade=pro payment link target...');
    await cdp.evalJs(`
      localStorage.removeItem('threadly_user');
      document.cookie = 'threadly_auth=; path=/; max-age=0; SameSite=Lax';
    `);
    await cdp.send('Page.navigate', { url: `${BASE_URL}/login` });
    await sleep(1400);
    await cdp.evalJs(`
      (function() {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const emailEl = document.querySelector('input[type="email"]');
        const passEl = document.querySelector('input[type="password"]');
        setter.call(emailEl, 'owner.koleksilokal@threadly.id');
        emailEl.dispatchEvent(new Event('input', { bubbles: true }));
        setter.call(passEl, 'OwnerPassword123!');
        passEl.dispatchEvent(new Event('input', { bubbles: true }));
      })()
    `);
    await sleep(250);
    await cdp.evalJs(`document.querySelector('form button[type="submit"]').click()`);
    await sleep(1800);
    await cdp.send('Page.navigate', { url: `${BASE_URL}/settings?tab=billing&upgrade=pro&toko=koleksilokal` });
    await sleep(1500);
    const billingText = await cdp.evalJs(`document.body.innerText`);
    check(
      billingText.includes('Paket Aktif & Konsumsi Token AI Bulanan') &&
      billingText.includes('Pemberitahuan Kuota AI Asisten Threadly') &&
      billingText.includes('15.300 / 15.000'),
      'Payment link /settings?tab=billing&upgrade=pro opens billing & AI quota upgrade panel cleanly'
    );

    check(cdp.exceptions.length === 0, `Zero uncaught browser runtime exceptions (found: ${cdp.exceptions.length})`);
  } finally {
    cdp?.close();
    try {
      chromeProc?.kill();
    } catch {}
    try {
      // Kill next server process tree on Windows
      spawn('cmd.exe', ['/c', `taskkill /PID ${nextProc.pid} /T /F`]);
    } catch {}
    try {
      fs.rmSync(tmpProfileDir, { recursive: true, force: true });
      fs.rmSync(tmpDownloadDir, { recursive: true, force: true });
    } catch {}
  }

  console.log(`\n=========================================`);
  console.log(`E2E Browser Verification: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=========================================`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('E2E Fatal Error:', err);
  process.exit(1);
});
