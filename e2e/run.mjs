// End-to-end test for Future Card.
// Expects two running servers:
//   DRIVE_APP (default http://127.0.0.1:8080) – Google Drive configured (pointing at mock-google.mjs)
//   SITE_APP  (default http://127.0.0.1:8081) – no Drive configured (fallback to the listening page)
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const DRIVE_APP = process.env.DRIVE_APP || 'http://127.0.0.1:8080';
const SITE_APP = process.env.SITE_APP || 'http://127.0.0.1:8081';
const MOCK = process.env.MOCK_GOOGLE || 'http://127.0.0.1:9999';
const OUT = path.resolve('artifacts');
fs.mkdirSync(OUT, { recursive: true });

let passed = 0;
const failures = [];
async function step(name, fn) {
  process.stdout.write(`• ${name} … `);
  try {
    await fn();
    passed += 1;
    console.log('ok');
  } catch (err) {
    failures.push({ name, err });
    console.log('FAILED');
    console.error(err);
  }
}

// ---------------------------------------------------------------- fixtures
function makePhoto(file) {
  const w = 900, h = 1200;
  const png = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (w * y + x) << 2;
      png.data[i] = 120 + Math.round((x / w) * 120);
      png.data[i + 1] = 160 + Math.round((y / h) * 60);
      png.data[i + 2] = 210 - Math.round((y / h) * 80);
      png.data[i + 3] = 255;
      const dx = x - w / 2, dy = y - h * 0.45;
      if (dx * dx + dy * dy < 160 * 160) { png.data[i] = 245; png.data[i + 1] = 200; png.data[i + 2] = 150; }
    }
  }
  fs.writeFileSync(file, PNG.sync.write(png));
}

function makeWav(file, seconds = 2) {
  const rate = 16000, n = rate * seconds;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 440 * i) / rate) * 8000), 44 + i * 2);
  fs.writeFileSync(file, buf);
}

const REAL_PHOTO = path.resolve('fixtures/photo.jpg');
const PHOTO = fs.existsSync(REAL_PHOTO) ? REAL_PHOTO : path.join(OUT, 'fixture-photo.png');
const AUDIO = path.join(OUT, 'fixture-voice.wav');
if (PHOTO !== REAL_PHOTO) makePhoto(PHOTO);
makeWav(AUDIO);

function decodeQrFromPng(buffer) {
  const png = PNG.sync.read(buffer);
  const res = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  return res?.data ?? null;
}
function decodeQrDataUrl(dataUrl) {
  return decodeQrFromPng(Buffer.from(dataUrl.split(',')[1], 'base64'));
}

// ------------------------------------------------------------------ helpers
async function createCard(page, base, { name, mode, driveLink, lang = 'ar', shotPrefix }) {
  await page.goto(`${base}/create`);
  await page.evaluate((l) => localStorage.setItem('lang', l), lang);
  await page.reload();
  await page.setInputFiles('[data-testid="input-photo"]', PHOTO);
  await page.fill('[data-testid="input-child-name"]', name);
  if (shotPrefix) await page.screenshot({ path: path.join(OUT, `${shotPrefix}-1-photo.png`), fullPage: true });
  await page.click('[data-testid="button-next-1"]');

  await page.click(`[data-testid="tab-${mode}"]`);
  if (mode === 'upload') {
    await page.setInputFiles('[data-testid="input-audio"]', AUDIO);
    await page.waitForSelector('[data-testid="audio-player"]');
  } else if (mode === 'drive') {
    await page.fill('[data-testid="input-drive-link"]', driveLink);
  } else if (mode === 'record') {
    await page.click('[data-testid="button-record"]');
    await page.waitForTimeout(2200);
    await page.click('[data-testid="button-record"]');
    await page.waitForSelector('[data-testid="audio-player"]');
  }
  await page.fill('#parent-message', 'رسالة تجريبية ♡');
  if (shotPrefix) await page.screenshot({ path: path.join(OUT, `${shotPrefix}-2-voice.png`), fullPage: true });
  await page.click('[data-testid="button-finish"]');
  await page.waitForURL(/\/card\/[0-9a-f-]+$/, { timeout: 30000 });
  await page.waitForSelector('[data-testid="qr-destination"] img');
  const id = page.url().split('/card/')[1];
  return id;
}

async function qrFromCardPage(page) {
  const src = await page.getAttribute('[data-testid="qr-destination"] img', 'src');
  assert.ok(src?.startsWith('data:image/png'), 'QR should be a PNG data URL');
  return decodeQrDataUrl(src);
}

// --------------------------------------------------------------------- run
const browser = await chromium.launch({
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, permissions: ['microphone'] });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push(String(e)));

await step('API: /api/config reports Drive enabled / disabled', async () => {
  const a = await (await fetch(`${DRIVE_APP}/api/config`)).json();
  const b = await (await fetch(`${SITE_APP}/api/config`)).json();
  assert.equal(a.driveEnabled, true);
  assert.equal(b.driveEnabled, false);
});

await step('API: Drive links are normalised in every common format', async () => {
  const cases = {
    'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQr/view?usp=sharing': 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQr/view?usp=sharing',
    'https://drive.google.com/open?id=1AbCdEfGhIjKlMnOpQr': 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQr/view?usp=sharing',
    'https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOpQr': 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQr/view?usp=sharing',
    'https://drive.google.com/file/u/0/d/1AbCdEfGhIjKlMnOpQr/edit': 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQr/view?usp=sharing',
    'https://drive.google.com/drive/folders/1FolderIdAbcdefgh?usp=drive_link': 'https://drive.google.com/drive/folders/1FolderIdAbcdefgh?usp=sharing',
  };
  for (const [input, expected] of Object.entries(cases)) {
    const res = await fetch(`${SITE_APP}/api/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childName: 'link-test', voiceMessageUrl: input }),
    });
    assert.equal(res.status, 201);
    const card = await res.json();
    assert.equal(card.voiceMessageUrl, expected, input);
    const gen = await (await fetch(`${SITE_APP}/api/cards/${card.id}/generate`, { method: 'POST' })).json();
    assert.equal(decodeQrDataUrl(gen.qrCodeUrl), expected, `QR for ${input}`);
    await fetch(`${SITE_APP}/api/cards/${card.id}`, { method: 'DELETE' });
  }
});

await step('Home page renders (ar + en)', async () => {
  await page.goto(DRIVE_APP);
  await page.evaluate(() => localStorage.setItem('lang', 'ar'));
  await page.reload();
  await page.waitForSelector('[data-testid="cta-create"]');
  assert.equal(await page.getAttribute('html', 'dir'), 'rtl');
  await page.screenshot({ path: path.join(OUT, 'home-ar.png'), fullPage: true });
  await page.click('[data-testid="lang-en"]');
  assert.equal(await page.getAttribute('html', 'dir'), 'ltr');
  await page.screenshot({ path: path.join(OUT, 'home-en.png'), fullPage: true });
});

let driveCardId;
await step('Upload audio → stored on Google Drive → QR opens the Drive file', async () => {
  driveCardId = await createCard(page, DRIVE_APP, { name: 'أريج', mode: 'upload', shotPrefix: 'flow-upload' });
  assert.match(await page.textContent('[data-testid="qr-destination-kind"]'), /Google Drive/);
  const qr = await qrFromCardPage(page);
  assert.match(qr, /^https:\/\/drive\.google\.com\/file\/d\/MockDriveFile\d{4}xyz\/view\?usp=sharing$/);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'card-drive-ar.png'), fullPage: true });

  const calls = await (await fetch(`${MOCK}/__calls`)).json();
  const upload = calls.find((c) => c.path === '/upload/drive/v3/files');
  assert.ok(upload, 'Drive upload endpoint was called');
  assert.equal(upload.query.uploadType, 'multipart');
  assert.match(upload.text, /"name":"أريج - \d{4}-\d{2}-\d{2}\.wav"/);
  assert.ok(upload.size > 60000, 'audio bytes were sent');
  const perm = calls.find((c) => c.path.endsWith('/permissions'));
  assert.deepEqual(JSON.parse(perm.text), { role: 'reader', type: 'anyone' });
});

await step('Downloaded PNG card contains a scannable QR pointing to Drive', async () => {
  for (const theme of ['rainbow', 'gold', 'navy']) {
    await page.click(`[data-testid="theme-${theme}"]`);
    const [download] = await Promise.all([page.waitForEvent('download'), page.click('[data-testid="button-download"]')]);
    const file = path.join(OUT, `download-${theme}.png`);
    await download.saveAs(file);
    const decoded = decodeQrFromPng(fs.readFileSync(file));
    assert.match(decoded ?? '', /^https:\/\/drive\.google\.com\/file\/d\/MockDriveFile/, `theme ${theme}`);
  }
  await page.screenshot({ path: path.join(OUT, 'card-theme-navy.png'), fullPage: true });
});

await step('Old /listen link for a Drive card redirects to Google Drive', async () => {
  await page.route('https://drive.google.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>drive-mock</h1>' }));
  await page.goto(`${DRIVE_APP}/listen/${driveCardId}`);
  await page.waitForURL(/drive\.google\.com\/file\/d\/MockDriveFile/, { timeout: 10000 });
  await page.unroute('https://drive.google.com/**');
});

await step('Pasted Drive link → QR opens exactly that Drive file', async () => {
  await createCard(page, SITE_APP, {
    name: 'Omar',
    mode: 'drive',
    lang: 'en',
    driveLink: 'https://drive.google.com/open?id=1PastedLinkAbcdEfgh',
    shotPrefix: 'flow-drive-link',
  });
  assert.equal(await qrFromCardPage(page), 'https://drive.google.com/file/d/1PastedLinkAbcdEfgh/view?usp=sharing');
  await page.screenshot({ path: path.join(OUT, 'card-drive-link-en.png'), fullPage: true });
});

await step('Changing the Drive link on the card regenerates the QR', async () => {
  await page.click('[data-testid="button-edit-link"]');
  await page.fill('[data-testid="input-edit-drive"]', 'https://drive.google.com/file/d/1ChangedLinkXyz123/view');
  await page.click('[data-testid="button-save-drive"]');
  await page.waitForFunction(() => document.querySelector('[data-testid="qr-target"]')?.textContent?.includes('1ChangedLinkXyz123'));
  await page.waitForTimeout(500);
  assert.equal(await qrFromCardPage(page), 'https://drive.google.com/file/d/1ChangedLinkXyz123/view?usp=sharing');
});

await step('Microphone recording without Drive → QR opens the listening page that plays it', async () => {
  const id = await createCard(page, SITE_APP, { name: 'Lina', mode: 'record', lang: 'en', shotPrefix: 'flow-record' });
  const qr = await qrFromCardPage(page);
  assert.equal(qr, `${SITE_APP}/listen/${id}`);
  const mobile = await browser.newContext({ ...devices['iPhone 13'] });
  const phone = await mobile.newPage();
  await phone.goto(qr);
  await phone.waitForSelector('[data-testid="listen-name"]');
  assert.equal(await phone.textContent('[data-testid="listen-name"]'), 'Lina');
  await phone.waitForSelector('[data-testid="audio-player"]');
  const src = await phone.getAttribute('audio', 'src');
  assert.ok(src?.startsWith('data:audio/'), 'audio is embedded');
  await phone.screenshot({ path: path.join(OUT, 'listen-mobile.png'), fullPage: true });
  await mobile.close();
});

await step('Dashboard lists the cards', async () => {
  await page.goto(`${DRIVE_APP}/dashboard`);
  await page.waitForSelector('[data-testid="memory-frame"]');
  await page.screenshot({ path: path.join(OUT, 'dashboard.png'), fullPage: true });
});

await step('Mobile layout of the create wizard and card page', async () => {
  const mobile = await browser.newContext({ ...devices['iPhone 13'] });
  const p = await mobile.newPage();
  await p.goto(`${DRIVE_APP}/`);
  await p.screenshot({ path: path.join(OUT, 'mobile-home.png'), fullPage: true });
  await p.goto(`${DRIVE_APP}/card/${driveCardId}`);
  await p.waitForSelector('[data-testid="qr-destination"] img');
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, 'mobile-card.png'), fullPage: true });
  await mobile.close();
});

await step('Too-large audio file is rejected with a clear message', async () => {
  const big = path.join(OUT, 'big.wav');
  makeWav(big, 80); // ~2.5 MB > 2 MB site limit
  await page.goto(`${SITE_APP}/create`);
  await page.setInputFiles('[data-testid="input-photo"]', PHOTO);
  await page.fill('[data-testid="input-child-name"]', 'Big');
  await page.click('[data-testid="button-next-1"]');
  await page.click('[data-testid="tab-upload"]');
  await page.setInputFiles('[data-testid="input-audio"]', big);
  await page.waitForSelector('[data-testid="voice-error"]');
  fs.rmSync(big);
});

await step('No unexpected console errors', async () => {
  const relevant = consoleErrors.filter((e) => !/favicon|fonts\.g|drive\.google|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|Failed to load resource/i.test(e));
  assert.deepEqual(relevant, []);
});

await browser.close();
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
