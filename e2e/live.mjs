// Smoke test against a deployed site. Usage: LIVE_URL=https://… node live.mjs
// Creates ONE test card named "__live-check__" and deletes it at the end.
import fs from 'node:fs';
import path from 'node:path';
import { chromium, devices } from 'playwright';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

const BASE = (process.env.LIVE_URL || '').replace(/\/$/, '');
if (!BASE) throw new Error('LIVE_URL missing');
const OUT = path.resolve('artifacts/live');
fs.mkdirSync(OUT, { recursive: true });
const report = { base: BASE, checks: [] };
const log = (name, ok, detail) => {
  report.checks.push({ name, ok, detail });
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ' — ' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 600) : ''}`);
};

function wav(file, seconds = 2) {
  const rate = 16000, n = rate * seconds, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 440 * i) / rate) * 8000), 44 + i * 2);
  fs.writeFileSync(file, buf);
}
const AUDIO = path.join(OUT, 'voice.wav');
wav(AUDIO);
const PHOTO = path.resolve('fixtures/photo.jpg');
const decode = (dataUrl) => {
  const png = PNG.sync.read(Buffer.from(dataUrl.split(',')[1], 'base64'));
  return jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data ?? null;
};

async function api(p, init) {
  try {
    const r = await fetch(BASE + p, init);
    const text = await r.text();
    return { status: r.status, text };
  } catch (e) {
    return { status: 0, text: String(e) };
  }
}

// ---------------------------------------------------------------- API
for (const p of ['/api/healthz', '/api/config', '/api/cards/stats/summary']) {
  const r = await api(p);
  log(`GET ${p}`, r.status === 200, `${r.status} ${r.text.slice(0, 300)}`);
}

// ---------------------------------------------------------------- UI
const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['microphone'] });
const page = await ctx.newPage();
const errors = [];
const failedRequests = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
page.on('response', async (r) => {
  if (r.status() >= 400 && r.url().startsWith(BASE)) {
    let body = '';
    try { body = (await r.text()).slice(0, 400); } catch {}
    failedRequests.push(`${r.request().method()} ${r.url().replace(BASE, '')} → ${r.status()} ${body}`);
  }
});

for (const [name, p] of [['home', '/'], ['create', '/create'], ['dashboard', '/dashboard']]) {
  const r = await page.goto(BASE + p, { waitUntil: 'networkidle' }).catch((e) => e);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  log(`page ${p}`, !(r instanceof Error) && r?.status() < 400, r instanceof Error ? String(r) : r?.status());
}

let cardId = null;
const newUi = (await page.goto(BASE + '/create').then(() => page.$('[data-testid="input-photo"]'))) !== null;
log('new UI deployed', newUi);

try {
  if (newUi) {
    await page.setInputFiles('[data-testid="input-photo"]', PHOTO);
    await page.fill('[data-testid="input-child-name"]', '__live-check__');
    await page.click('[data-testid="button-next-1"]');
    await page.click('[data-testid="tab-upload"]');
    await page.setInputFiles('[data-testid="input-audio"]', AUDIO);
    await page.waitForSelector('[data-testid="audio-player"]');
    await page.screenshot({ path: path.join(OUT, 'create-voice.png'), fullPage: true });
    await page.click('[data-testid="button-finish"]');
    await page.waitForURL(/\/card\//, { timeout: 45000 });
    cardId = page.url().split('/card/')[1];
    await page.waitForSelector('[data-testid="qr-destination"] img', { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'card.png'), fullPage: true });
  } else {
    // old UI: try the real flow through the page
    const fileInputs = await page.$$('input[type=file]');
    await fileInputs[0].setInputFiles(PHOTO);
    await page.fill('[data-testid="input-child-name"]', '__live-check__');
    await page.screenshot({ path: path.join(OUT, 'old-create-1.png'), fullPage: true });
    await page.getByRole('button', { name: /متابعة|Continue/ }).last().click();
    await page.waitForTimeout(800);
    const audioInput = (await page.$$('input[type=file][accept^="audio"]'))[0];
    await audioInput.setInputFiles(AUDIO);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, 'old-create-2.png'), fullPage: true });
    await page.getByRole('button', { name: /متابعة|Continue/ }).last().click();
    await page.waitForURL(/\/card\//, { timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT, 'old-after-create.png'), fullPage: true });
    if (page.url().includes('/card/')) cardId = page.url().split('/card/')[1];
  }
  log('create card through UI', !!cardId, page.url());
} catch (e) {
  await page.screenshot({ path: path.join(OUT, 'create-failure.png'), fullPage: true }).catch(() => {});
  log('create card through UI', false, String(e));
}

if (cardId) {
  const r = await api(`/api/cards/${cardId}`);
  let card = null;
  try { card = JSON.parse(r.text); } catch {}
  const target = card?.qrCodeUrl ? decode(card.qrCodeUrl) : null;
  log('QR decodes', !!target, target);
  log('voice stored', !!card?.voiceMessageUrl, card?.voiceMessageUrl?.slice(0, 80));
  if (target) {
    // scan from a different phone (no Vercel login)
    const phoneCtx = await browser.newContext({ ...devices['iPhone 13'] });
    const phone = await phoneCtx.newPage();
    const pr = await phone.goto(target, { waitUntil: 'networkidle' }).catch((e) => e);
    await phone.waitForTimeout(1500);
    await phone.screenshot({ path: path.join(OUT, 'scan-result.png'), fullPage: true });
    const status = pr instanceof Error ? String(pr) : pr?.status();
    const audioOk = await phone.$('audio[src^="data:audio"], audio[src^="http"], iframe[src*="drive.google.com"]');
    log('scanned QR opens on another phone', !(pr instanceof Error) && status < 400 && !/vercel\.com\/login|sso/i.test(phone.url()), `${status} → ${phone.url()}`);
    log('scanned page plays the voice', !!audioOk || phone.url().includes('drive.google.com'));
    await phoneCtx.close();
  }
  const d = await api(`/api/cards/${cardId}`, { method: 'DELETE' });
  log('cleanup test card', d.status === 204, d.status);
}

log('browser console errors', errors.length === 0, errors.slice(0, 8));
log('failed API requests', failedRequests.length === 0, failedRequests.slice(0, 8));

await browser.close();
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
fs.rmSync(AUDIO);
