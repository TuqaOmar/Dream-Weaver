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

// Layout: thick decorated border, photo filling the window (cropped to fit),
// thicker bottom band, plain white QR square on the bottom-left corner.
export const GEO = {
  outerRadius: 70,
  mat: { x: 72, y: 82, w: 856, h: 1268, r: 58 },
  photo: { x: 86, y: 96, w: 828, h: 1240, r: 46 },
  qrTile: { x: 46, y: 1118, w: 300, h: 300, r: 14, pad: 20, qr: 260 },
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

// Ornaments sit on the frame band (outside the photo); the bottom-left corner
// is left clear for the QR square.
const DECOS: Deco[] = [
  // top band
  ['heart', 90, 48, 24, -14], ['sparkle', 190, 40, 18], ['dot', 250, 52, 5], ['heart', 320, 44, 16, 10],
  ['sparkle', 420, 42, 22], ['star', 520, 46, 14], ['heart', 610, 40, 18, -8], ['dot', 680, 54, 5],
  ['sparkle', 760, 42, 20], ['heart', 860, 46, 16, 12], ['sparkle', 945, 70, 16],
  // left band
  ['sparkle', 36, 180, 18], ['heart', 34, 300, 16, -10], ['dot', 38, 380, 5], ['sparkle', 36, 470, 20],
  ['heart', 34, 590, 15, 12], ['star', 36, 700, 13], ['sparkle', 36, 820, 18], ['heart', 34, 940, 16, -8], ['dot', 38, 1040, 5],
  // right band
  ['heart', 964, 190, 16, 10], ['sparkle', 964, 300, 20], ['dot', 962, 400, 5], ['heart', 964, 500, 15, -10],
  ['sparkle', 964, 620, 18], ['star', 964, 730, 13], ['heart', 964, 850, 16, 8], ['sparkle', 964, 970, 20],
  ['dot', 962, 1070, 5], ['heart', 964, 1170, 15, -12], ['sparkle', 964, 1290, 18],
  // bottom band (right of the QR)
  ['sparkle', 410, 1400, 22], ['heart', 500, 1440, 18, -10], ['dot', 470, 1372, 5], ['sparkle', 580, 1385, 16],
  ['heart', 650, 1420, 22, 8], ['star', 730, 1380, 14], ['sparkle', 800, 1440, 20], ['heart', 870, 1395, 16, -6],
  ['dot', 930, 1440, 5], ['sparkle', 560, 1470, 14], ['heart', 380, 1470, 14, 6],
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
    swatch: 'linear-gradient(135deg,#f9a8d4,#fde68a,#a7f3d0,#a5d8ff,#d8b4fe)',
    mat: '#ffffff',
    // Soft watercolour: a pastel base with large blurred colour washes on top.
    defs: `
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffc2dd"/><stop offset="0.28" stop-color="#ffe6a8"/>
        <stop offset="0.52" stop-color="#bff0d6"/><stop offset="0.76" stop-color="#bfe0ff"/>
        <stop offset="1" stop-color="#e2c8ff"/>
      </linearGradient>
      <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="55"/></filter>
      <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.10 0"/></filter>
      <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.6" fill="#fff" opacity="0.35"/></pattern>`,
    background: `<rect width="1000" height="1500" fill="url(#bg)"/>
      <g filter="url(#soft)" opacity="0.85">
        <ellipse cx="80" cy="120" rx="260" ry="230" fill="#ff9cc9"/>
        <ellipse cx="560" cy="40" rx="260" ry="140" fill="#ffd27a"/>
        <ellipse cx="960" cy="180" rx="200" ry="260" fill="#ffb38a"/>
        <ellipse cx="990" cy="620" rx="170" ry="300" fill="#8fe3c0"/>
        <ellipse cx="980" cy="1080" rx="190" ry="280" fill="#86c9ff"/>
        <ellipse cx="760" cy="1480" rx="320" ry="170" fill="#a9b8ff"/>
        <ellipse cx="300" cy="1470" rx="300" ry="170" fill="#7fd8e8"/>
        <ellipse cx="20" cy="1180" rx="170" ry="260" fill="#d6a8ff"/>
        <ellipse cx="10" cy="660" rx="150" ry="280" fill="#ffb0d8"/>
      </g>
      <rect width="1000" height="1500" fill="url(#dots)"/>
      <rect width="1000" height="1500" filter="url(#paper)"/>`,
    decorations: decorations('#ffffff', 0.95),
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

  // 1. frame
  const frame = await loadImage(frameSvgDataUrl(opts.theme));
  ctx.drawImage(frame, 0, 0, VB.w, VB.h);

  // 2. photo — fills the window (cropped to fit, centred)
  const { photo } = GEO;
  const img = await loadImage(opts.photoUrl);
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  ctx.save();
  roundRect(ctx, photo.x, photo.y, photo.w, photo.h, photo.r);
  ctx.clip();
  ctx.fillStyle = '#efe6dc';
  ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
  const cover = Math.max(photo.w / iw, photo.h / ih);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, photo.x + (photo.w - iw * cover) / 2, photo.y + (photo.h - ih * cover) / 2, iw * cover, ih * cover);
  ctx.restore();

  // 3. QR — plain white square on the bottom-left corner
  if (opts.qrCodeUrl) {
    const q = GEO.qrTile;
    ctx.save();
    ctx.shadowColor = 'rgba(20,24,40,0.18)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    roundRect(ctx, q.x, q.y, q.w, q.h, q.r);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
    const qr = await loadImage(opts.qrCodeUrl);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qr, q.x + q.pad, q.y + q.pad, q.qr, q.qr);
    ctx.imageSmoothingEnabled = true;
  }

  return canvas;
}
