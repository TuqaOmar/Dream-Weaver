/** Illustrations used on the landing page preview (no real photos). */

const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export const DEMO_PHOTO = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3f0"/><stop offset="0.6" stop-color="#fde6c8"/><stop offset="1" stop-color="#f7c9a0"/></linearGradient>
<linearGradient id="h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cc9a0"/><stop offset="1" stop-color="#5fa880"/></linearGradient>
<linearGradient id="h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb38b"/><stop offset="1" stop-color="#3f8a68"/></linearGradient>
</defs>
<rect width="600" height="900" fill="url(#sky)"/>
<circle cx="430" cy="250" r="70" fill="#ffe7a6"/>
<circle cx="430" cy="250" r="110" fill="#ffe7a6" opacity=".25"/>
<g fill="#fff" opacity=".85"><ellipse cx="140" cy="170" rx="70" ry="22"/><ellipse cx="185" cy="155" rx="45" ry="24"/><ellipse cx="470" cy="420" rx="60" ry="18"/></g>
<path d="M0 640 C120 560 260 600 360 640 C460 680 540 620 600 600 L600 900 L0 900Z" fill="url(#h1)"/>
<path d="M0 730 C150 680 250 720 380 760 C480 790 560 760 600 740 L600 900 L0 900Z" fill="url(#h2)"/>
<path d="M300 330 L360 400 L300 480 L240 400Z" fill="#ef6b8a"/><path d="M300 330 L300 480 M240 400 L360 400" stroke="#fff" stroke-width="4" opacity=".7"/>
<path d="M300 480 C290 540 330 580 300 640 C280 690 320 720 300 760" stroke="#5a4a6a" stroke-width="3" fill="none"/>
<g fill="#ffd24d"><path d="M285 540 l14 -8 l-2 16z"/><path d="M312 610 l-14 -8 l2 16z"/></g>
<g transform="translate(300 770)"><circle r="22" cy="-58" fill="#4b3a5a"/><path d="M-26 0 C-26 -30 -14 -36 0 -36 C14 -36 26 -30 26 0Z" fill="#ef6b8a"/></g>
</svg>`);

/** A decorative (non-scannable) QR-like pattern. */
export const DEMO_QR = (() => {
  const n = 25;
  let cells = '';
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const finder = (x: number, y: number) =>
    `<rect x="${x}" y="${y}" width="7" height="7" fill="#1c2333"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#1c2333"/>`;
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!inFinder(x, y) && rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  return svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="#fff"/><g fill="#1c2333">${cells}</g>${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`,
  );
})();
