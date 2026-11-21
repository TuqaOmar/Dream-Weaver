// Marketing screenshots of the live site (high resolution).
import fs from 'node:fs';
import path from 'node:path';
import { chromium, devices } from 'playwright';

const BASE = (process.env.LIVE_URL || '').replace(/\/$/, '');
const OUT = path.resolve('shots'); fs.mkdirSync(OUT, { recursive: true });
const PHOTO = path.join(OUT, '_photo.jpg');
const r = await fetch('https://images.unsplash.com/photo-1621878166843-d060a5ff51ea?w=1400&q=85');
fs.writeFileSync(PHOTO, Buffer.from(await r.arrayBuffer()));
function wav(file, seconds = 3) {
  const rate = 16000, n = rate * seconds, buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 330 * i) / rate) * Math.sin(Math.PI * i / n) * 9000), 44 + i * 2);
  fs.writeFileSync(file, buf);
}
const AUDIO = path.join(OUT, '_voice.wav'); wav(AUDIO);

const browser = await chromium.launch();
const settle = (p, ms = 2500) => p.waitForTimeout(ms);
async function revealAll(p) {
  const h = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 300) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(120); }
  await p.evaluate(() => window.scrollTo(0, 0)); await settle(p, 1500);
}

// Desktop
const desk = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2, locale: 'ar' });
await desk.addInitScript(() => localStorage.setItem('lang', 'ar'));
const d = await desk.newPage();
await d.goto(BASE + '/', { waitUntil: 'networkidle' }); await settle(d, 3500);
await d.screenshot({ path: path.join(OUT, '1-hero-desktop.png') });
await revealAll(d);
await d.screenshot({ path: path.join(OUT, '2-home-full.png'), fullPage: true });
const samples = d.locator('[data-testid="samples"]'); await samples.scrollIntoViewIfNeeded(); await settle(d, 2500);
await samples.screenshot({ path: path.join(OUT, '3-samples.png') });

// Create a real card
await d.goto(BASE + '/create', { waitUntil: 'networkidle' }); await settle(d, 1000);
await d.setInputFiles('[data-testid="input-photo"]', PHOTO);
await d.fill('[data-testid="input-child-name"]', 'سَنَد');
await settle(d, 600);
await d.screenshot({ path: path.join(OUT, '4-create-step1.png') });
await d.click('[data-testid="button-next-1"]'); await settle(d, 800);
await d.click('[data-testid="tab-upload"]');
await d.setInputFiles('[data-testid="input-audio"]', AUDIO);
await d.waitForSelector('[data-testid="audio-player"]'); await settle(d, 600);
await d.screenshot({ path: path.join(OUT, '5-create-voice.png') });
await d.click('[data-testid="button-finish"]');
await d.waitForURL(/\/card\//, { timeout: 60000 });
await d.waitForSelector('[data-testid="qr-destination"] img', { timeout: 30000 });
await settle(d, 700);
await d.screenshot({ path: path.join(OUT, '6-card-confetti.png') });
await settle(d, 3500);
await d.screenshot({ path: path.join(OUT, '7-card-page.png') });
await d.locator('[data-testid="memory-frame"]').first().screenshot({ path: path.join(OUT, '8-card-only.png') });
const cardId = d.url().split('/card/')[1];
const key = await d.evaluate(() => localStorage.getItem('future-card:owner-key'));

// Phone: listen page + home
const phoneCtx = await browser.newContext({ ...devices['iPhone 13'], locale: 'ar' });
await phoneCtx.addInitScript(() => localStorage.setItem('lang', 'ar'));
const ph = await phoneCtx.newPage();
await ph.goto(`${BASE}/listen/${cardId}`, { waitUntil: 'networkidle' }); await settle(ph, 2500);
await ph.screenshot({ path: path.join(OUT, '9-phone-listen.png') });
await ph.goto(BASE + '/', { waitUntil: 'networkidle' }); await settle(ph, 3000);
await ph.screenshot({ path: path.join(OUT, '10-phone-home.png') });

// clean up the demo card
await fetch(`${BASE}/api/cards/${cardId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${key}` } });
fs.rmSync(PHOTO); fs.rmSync(AUDIO);
await browser.close();
console.log('done', fs.readdirSync(OUT));
