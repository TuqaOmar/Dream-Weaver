/**
 * Card frame geometry + artwork.
 *
 * The frame is drawn as an SVG (viewBox 1000×1500) so the exact same artwork
 * is used on screen and in the downloadable PNG. The photo, QR tile and name
 * label are layered on top using the coordinates below.
 */

export type FrameTheme = 'rainbow' | 'gold' | 'navy';

export const FRAME_THEMES: FrameTheme[] = ['rainbow', 'gold', 'navy'];

export const VB = { w: 1000, h: 1500 };

export const GEO = {
  outerRadius: 60,
  mat: { x: 50, y: 50, w: 900, h: 1400, r: 44 },
  photo: { x: 64, y: 64, w: 872, h: 1372, r: 34 },
  qrTile: { x: 40, y: 1138, w: 270, h: 322, r: 22, pad: 18, qr: 234 },
  caption: { y: 1424, size: 25 },
  name: { right: 920, bottom: 1410, h: 66, padX: 30, size: 36, r: 33 },
};

export const pct = {
  x: (v: number) => `${(v / VB.w) * 100}%`,
  y: (v: number) => `${(v / VB.h) * 100}%`,
  /** size relative to card width, as container-query units */
  cq: (v: number) => `${(v / VB.w) * 100}cqw`,
};

interface ThemeSpec {
  label: { ar: string; en: string };
  swatch: string;
  mat: string;
  defs: string;
  background: string;
  decorations: string;
}

const SPARKLE =
  'M0,-1 C0.12,-0.12 0.12,-0.12 1,0 C0.12,0.12 0.12,0.12 0,1 C-0.12,0.12 -0.12,0.12 -1,0 C-0.12,-0.12 -0.12,-0.12 0,-1Z';
const HEART =
  'M0,0.85 C-0.95,0.2 -1,-0.4 -0.55,-0.78 C-0.25,-1.02 0,-0.78 0,-0.5 C0,-0.78 0.25,-1.02 0.55,-0.78 C1,-0.4 0.95,0.2 0,0.85Z';
const STAR = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 1 : 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(Math.cos(a) * r).toFixed(3)},${(Math.sin(a) * r).toFixed(3)}`);
  }
  return `M${pts.join(' L')}Z`;
})();

type Deco = [shape: 'sparkle' | 'heart' | 'star' | 'dot', x: number, y: number, size: number, rot?: number];

// Ornaments sit on the frame band (outside the photo).
const DECOS: Deco[] = [
  ['sparkle', 120, 26, 20], ['heart', 250, 25, 15, -12], ['star', 400, 25, 14], ['dot', 470, 25, 4],
  ['sparkle', 560, 26, 18], ['heart', 700, 25, 14, 10], ['star', 830, 25, 13], ['sparkle', 930, 30, 16],
  ['heart', 25, 260, 14, -10], ['sparkle', 25, 470, 17], ['star', 25, 690, 13], ['dot', 25, 790, 4], ['heart', 25, 960, 14, 12],
  ['star', 975, 200, 13], ['heart', 975, 420, 14, 10], ['sparkle', 975, 640, 17], ['dot', 975, 760, 4],
  ['heart', 975, 900, 14, -10], ['star', 975, 1100, 13], ['sparkle', 975, 1300, 17],
  ['sparkle', 420, 1475, 17], ['heart', 560, 1475, 14, 8], ['star', 700, 1475, 13], ['dot', 780, 1475, 4], ['sparkle', 860, 1474, 16],
];

function decorations(color: string, opacity: number, filter = DECOS): string {
  return filter
    .map(([shape, x, y, s, rot = 0]) => {
      if (shape === 'dot') return `<circle cx="${x}" cy="${y}" r="${s}" fill="${color}" opacity="${opacity}"/>`;
      const d = shape === 'sparkle' ? SPARKLE : shape === 'heart' ? HEART : STAR;
      return `<path d="${d}" fill="${color}" opacity="${opacity}" transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"/>`;
    })
    .join('');
}

const THEMES: Record<FrameTheme, ThemeSpec> = {
  rainbow: {
    label: { ar: 'ألوان الطفولة', en: 'Rainbow' },
    swatch: 'linear-gradient(135deg,#ef5fa7,#ffd04a,#5fd3a5,#3fc6dc,#ff7c88)',
    mat: '#fffdf8',
    defs: `
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ec5ea8"/><stop offset="0.3" stop-color="#ffd24d"/>
        <stop offset="0.56" stop-color="#77d6a6"/><stop offset="0.78" stop-color="#42c8da"/>
        <stop offset="1" stop-color="#ff7d8a"/>
      </linearGradient>
      <radialGradient id="g1" cx="0.08" cy="0.1" r="0.45"><stop offset="0" stop-color="#ee47a0" stop-opacity="0.9"/><stop offset="1" stop-color="#ee47a0" stop-opacity="0"/></radialGradient>
      <radialGradient id="g2" cx="0.95" cy="0.4" r="0.4"><stop offset="0" stop-color="#37caa3" stop-opacity="0.85"/><stop offset="1" stop-color="#37caa3" stop-opacity="0"/></radialGradient>
      <radialGradient id="g3" cx="0.88" cy="0.95" r="0.45"><stop offset="0" stop-color="#ff6f7d" stop-opacity="0.9"/><stop offset="1" stop-color="#ff6f7d" stop-opacity="0"/></radialGradient>
      <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="1.5" fill="#fff" opacity="0.45"/></pattern>`,
    background: `<rect width="1000" height="1500" fill="url(#bg)"/><rect width="1000" height="1500" fill="url(#g1)"/><rect width="1000" height="1500" fill="url(#g2)"/><rect width="1000" height="1500" fill="url(#g3)"/><rect width="1000" height="1500" fill="url(#dots)"/>`,
    decorations: decorations('#ffffff', 0.92),
  },
  gold: {
    label: { ar: 'ذهبي كلاسيك', en: 'Classic gold' },
    swatch: 'linear-gradient(135deg,#f6ead6,#d6b07a,#f3e3c4)',
    mat: '#fffaf1',
    defs: `
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f7ecd9"/><stop offset="0.35" stop-color="#e2c393"/>
        <stop offset="0.65" stop-color="#cfa66c"/><stop offset="1" stop-color="#f1dfbd"/>
      </linearGradient>
      <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="1.3" fill="#fff" opacity="0.35"/></pattern>`,
    background: `<rect width="1000" height="1500" fill="url(#bg)"/><rect width="1000" height="1500" fill="url(#dots)"/><rect x="18" y="18" width="964" height="1464" rx="46" fill="none" stroke="#fffaf0" stroke-opacity="0.75" stroke-width="3"/>`,
    decorations: decorations('#fffaf0', 0.9, DECOS.filter(([s]) => s === 'star' || s === 'sparkle')),
  },
  navy: {
    label: { ar: 'كحلي أنيق', en: 'Midnight' },
    swatch: 'linear-gradient(135deg,#1c2541,#34446b,#c9a66b)',
    mat: '#fbf7ef',
    defs: `
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#18203a"/><stop offset="0.55" stop-color="#2b3a60"/><stop offset="1" stop-color="#1c2541"/>
      </linearGradient>
      <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="1.2" fill="#c9a66b" opacity="0.28"/></pattern>`,
    background: `<rect width="1000" height="1500" fill="url(#bg)"/><rect width="1000" height="1500" fill="url(#dots)"/><rect x="18" y="18" width="964" height="1464" rx="46" fill="none" stroke="#c9a66b" stroke-opacity="0.8" stroke-width="3"/>`,
    decorations: decorations('#d8b77c', 0.95, DECOS.filter(([s]) => s === 'star' || s === 'sparkle')),
  },
};

export function themeLabel(theme: FrameTheme, lang: 'ar' | 'en') {
  return THEMES[theme].label[lang];
}
export function themeSwatch(theme: FrameTheme) {
  return THEMES[theme].swatch;
}
export function themeMat(theme: FrameTheme) {
  return THEMES[theme].mat;
}

/** Full frame artwork (background, ornaments and the white mat). */
export function buildFrameSvg(theme: FrameTheme): string {
  const t = THEMES[theme];
  const { mat } = GEO;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB.w} ${VB.h}" width="${VB.w}" height="${VB.h}">
<defs>${t.defs}<clipPath id="outer"><rect width="1000" height="1500" rx="${GEO.outerRadius}"/></clipPath></defs>
<g clip-path="url(#outer)">${t.background}${t.decorations}</g>
<rect x="${mat.x}" y="${mat.y}" width="${mat.w}" height="${mat.h}" rx="${mat.r}" fill="${t.mat}"/>
</svg>`;
}

export function frameSvgDataUrl(theme: FrameTheme): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildFrameSvg(theme))}`;
}

// ---------------------------------------------------------------------------
// Theme persistence (per card, client side)
// ---------------------------------------------------------------------------

export function loadTheme(cardId: string | undefined): FrameTheme {
  try {
    const v = cardId ? localStorage.getItem(`frame-theme:${cardId}`) : null;
    if (v && (FRAME_THEMES as string[]).includes(v)) return v as FrameTheme;
  } catch {
    /* storage unavailable */
  }
  return 'rainbow';
}

export function saveTheme(cardId: string, theme: FrameTheme) {
  try {
    localStorage.setItem(`frame-theme:${cardId}`, theme);
  } catch {
    /* storage unavailable */
  }
}

// ---------------------------------------------------------------------------
// PNG export
// ---------------------------------------------------------------------------

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export interface RenderOptions {
  theme: FrameTheme;
  photoUrl: string;
  qrCodeUrl?: string | null;
  childName?: string;
  caption: string;
  isRTL: boolean;
  scale?: number;
}

export async function renderCardToCanvas(opts: RenderOptions): Promise<HTMLCanvasElement> {
  const s = opts.scale ?? 1.6;
  const canvas = document.createElement('canvas');
  canvas.width = VB.w * s;
  canvas.height = VB.h * s;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.scale(s, s);

  try {
    await Promise.all([
      document.fonts?.load(`600 ${GEO.name.size}px "Amiri"`),
      document.fonts?.load(`600 ${GEO.name.size}px "Fraunces"`),
      document.fonts?.load(`600 ${GEO.caption.size}px "IBM Plex Sans Arabic"`),
    ]);
  } catch {
    /* fonts are optional */
  }

  // 1. frame
  const frame = await loadImage(frameSvgDataUrl(opts.theme));
  ctx.drawImage(frame, 0, 0, VB.w, VB.h);

  // 2. photo — blurred fill + full (uncropped) photo on top
  const { photo } = GEO;
  const img = await loadImage(opts.photoUrl);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  ctx.save();
  roundRect(ctx, photo.x, photo.y, photo.w, photo.h, photo.r);
  ctx.clip();
  ctx.fillStyle = '#efe6dc';
  ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
  const cover = Math.max(photo.w / iw, photo.h / ih) * 1.15;
  ctx.filter = 'blur(28px)';
  ctx.globalAlpha = 0.75;
  ctx.drawImage(img, photo.x + (photo.w - iw * cover) / 2, photo.y + (photo.h - ih * cover) / 2, iw * cover, ih * cover);
  ctx.filter = 'none';
  ctx.globalAlpha = 1;
  const contain = Math.min(photo.w / iw, photo.h / ih);
  ctx.drawImage(img, photo.x + (photo.w - iw * contain) / 2, photo.y + (photo.h - ih * contain) / 2, iw * contain, ih * contain);
  ctx.restore();

  // 3. name label
  if (opts.childName?.trim()) {
    const n = GEO.name;
    ctx.font = `600 ${n.size}px "Amiri", "Fraunces", serif`;
    ctx.direction = opts.isRTL ? 'rtl' : 'ltr';
    const tw = Math.min(ctx.measureText(opts.childName).width, 520);
    const w = tw + n.padX * 2;
    const x = n.right - w;
    const y = n.bottom - n.h;
    ctx.save();
    ctx.shadowColor = 'rgba(20,24,40,0.18)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    roundRect(ctx, x, y, w, n.h, n.r);
    ctx.fillStyle = 'rgba(255,253,248,0.94)';
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#1c2333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.childName, x + w / 2, y + n.h / 2 + 2, 520);
  }

  // 4. QR tile
  if (opts.qrCodeUrl) {
    const q = GEO.qrTile;
    ctx.save();
    ctx.shadowColor = 'rgba(20,24,40,0.22)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    roundRect(ctx, q.x, q.y, q.w, q.h, q.r);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
    const qr = await loadImage(opts.qrCodeUrl);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qr, q.x + q.pad, q.y + q.pad, q.qr, q.qr);
    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = '#1c2333';
    ctx.font = `600 ${GEO.caption.size}px "IBM Plex Sans Arabic", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.direction = opts.isRTL ? 'rtl' : 'ltr';
    ctx.fillText(opts.caption, q.x + q.w / 2, GEO.caption.y, q.w - 20);
  }

  return canvas;
}
