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

/** Extra illustrations for the samples gallery (no real photos). */
export const DEMO_BIRTHDAY = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
<defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe1ef"/><stop offset="1" stop-color="#ffd2a8"/></linearGradient></defs>
<rect width="600" height="900" fill="url(#b)"/>
<g opacity=".9"><circle cx="90" cy="120" r="8" fill="#f472b6"/><circle cx="520" cy="90" r="7" fill="#60a5fa"/><circle cx="470" cy="300" r="6" fill="#facc15"/><circle cx="120" cy="380" r="7" fill="#34d399"/><rect x="300" y="80" width="14" height="6" rx="3" fill="#a78bfa" transform="rotate(30 300 80)"/><rect x="200" y="250" width="14" height="6" rx="3" fill="#fb923c" transform="rotate(-20 200 250)"/></g>
<g><ellipse cx="150" cy="230" rx="62" ry="76" fill="#f472b6"/><path d="M150 306 q-10 120 20 250" stroke="#9d5c7c" stroke-width="3" fill="none"/>
<ellipse cx="455" cy="200" rx="58" ry="72" fill="#60a5fa"/><path d="M455 272 q15 120 -30 280" stroke="#5a7a9d" stroke-width="3" fill="none"/>
<ellipse cx="300" cy="150" rx="54" ry="66" fill="#facc15"/><path d="M300 216 q-8 140 0 330" stroke="#9d8a4a" stroke-width="3" fill="none"/></g>
<rect x="150" y="600" width="300" height="190" rx="24" fill="#fff"/><rect x="150" y="600" width="300" height="60" rx="24" fill="#f9a8d4"/>
<path d="M150 650 q37 30 75 0 q37 30 75 0 q37 30 75 0 q37 30 75 0" fill="#f9a8d4"/>
<g fill="#a78bfa"><rect x="215" y="540" width="16" height="64" rx="6"/><rect x="292" y="530" width="16" height="74" rx="6"/><rect x="369" y="540" width="16" height="64" rx="6"/></g>
<g fill="#fb923c"><ellipse cx="223" cy="528" rx="9" ry="14"/><ellipse cx="300" cy="518" rx="9" ry="14"/><ellipse cx="377" cy="528" rx="9" ry="14"/></g>
<g fill="#34d399"><circle cx="210" cy="720" r="9"/><circle cx="300" cy="740" r="9"/><circle cx="390" cy="720" r="9"/></g>
</svg>`);

export const DEMO_GRADUATION = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c7d2fe"/><stop offset="1" stop-color="#e9d5ff"/></linearGradient></defs>
<rect width="600" height="900" fill="url(#g)"/>
<g fill="#fff" opacity=".9"><path d="M100 140 l6 14 l15 2 l-11 10 l3 15 l-13 -8 l-13 8 l3 -15 l-11 -10 l15 -2z"/><path d="M480 220 l5 11 l12 2 l-9 8 l2 12 l-10 -6 l-10 6 l2 -12 l-9 -8 l12 -2z"/><path d="M430 90 l4 9 l10 1 l-7 7 l2 10 l-9 -5 l-9 5 l2 -10 l-7 -7 l10 -1z"/></g>
<ellipse cx="300" cy="860" rx="320" ry="120" fill="#a5b4fc"/>
<circle cx="300" cy="430" r="120" fill="#fcd9b8"/>
<path d="M180 430 q0 -140 120 -140 q120 0 120 140 q-20 -70 -120 -70 q-100 0 -120 70z" fill="#5b3a29"/>
<circle cx="258" cy="440" r="11" fill="#3b2a3a"/><circle cx="342" cy="440" r="11" fill="#3b2a3a"/>
<path d="M262 490 q38 30 76 0" stroke="#c2410c" stroke-width="7" fill="none" stroke-linecap="round"/>
<circle cx="228" cy="478" r="16" fill="#fda4af" opacity=".7"/><circle cx="372" cy="478" r="16" fill="#fda4af" opacity=".7"/>
<path d="M150 300 L300 230 L450 300 L300 370Z" fill="#312e81"/><rect x="245" y="320" width="110" height="40" fill="#312e81"/>
<path d="M440 300 v90" stroke="#facc15" stroke-width="5"/><circle cx="440" cy="398" r="12" fill="#facc15"/>
<path d="M180 640 q120 -90 240 0 l30 260 h-300z" fill="#4338ca"/>
<rect x="250" y="620" width="100" height="70" rx="10" fill="#fff" transform="rotate(-8 300 655)"/><path d="M262 640 h70 M262 660 h55" stroke="#c7d2fe" stroke-width="6" transform="rotate(-8 300 655)"/>
</svg>`);

export const DEMO_GRANDMA = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
<defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d1fae5"/><stop offset="1" stop-color="#fef9c3"/></linearGradient></defs>
<rect width="600" height="900" fill="url(#m)"/>
<g transform="translate(300 360)"><path d="M0 120 C-170 10 -170 -120 -80 -140 C-35 -150 -5 -115 0 -90 C5 -115 35 -150 80 -140 C170 -120 170 10 0 120Z" fill="#fb7185"/><path d="M-40 -95 q-40 10 -45 55" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".6"/></g>
<g><path d="M120 900 q10 -150 60 -260" stroke="#16a34a" stroke-width="8" fill="none"/><g transform="translate(180 630)" fill="#f472b6"><circle r="22" cx="0" cy="-26"/><circle r="22" cx="25" cy="-6"/><circle r="22" cx="15" cy="24"/><circle r="22" cx="-15" cy="24"/><circle r="22" cx="-25" cy="-6"/><circle r="16" fill="#fde047"/></g></g>
<g><path d="M300 900 q-5 -130 10 -210" stroke="#16a34a" stroke-width="8" fill="none"/><g transform="translate(310 680)" fill="#60a5fa"><circle r="20" cx="0" cy="-24"/><circle r="20" cx="23" cy="-6"/><circle r="20" cx="14" cy="22"/><circle r="20" cx="-14" cy="22"/><circle r="20" cx="-23" cy="-6"/><circle r="14" fill="#fde047"/></g></g>
<g><path d="M470 900 q-10 -150 -50 -250" stroke="#16a34a" stroke-width="8" fill="none"/><g transform="translate(420 640)" fill="#a78bfa"><circle r="22" cx="0" cy="-26"/><circle r="22" cx="25" cy="-6"/><circle r="22" cx="15" cy="24"/><circle r="22" cx="-15" cy="24"/><circle r="22" cx="-25" cy="-6"/><circle r="16" fill="#fde047"/></g></g>
<g fill="#facc15"><circle cx="110" cy="120" r="6"/><circle cx="500" cy="140" r="6"/><circle cx="480" cy="460" r="5"/><circle cx="110" cy="440" r="5"/></g>
</svg>`);

export const DEMO_SCHOOL = svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bae6fd"/><stop offset="0.7" stop-color="#e0f2fe"/><stop offset="1" stop-color="#bbf7d0"/></linearGradient></defs>
<rect width="600" height="900" fill="url(#s)"/>
<circle cx="480" cy="150" r="60" fill="#fde047"/><g stroke="#fde047" stroke-width="8" stroke-linecap="round"><path d="M480 60 v-25 M480 240 v25 M390 150 h-25 M570 150 h25"/></g>
<g fill="#fff"><ellipse cx="140" cy="160" rx="70" ry="24"/><ellipse cx="185" cy="142" rx="44" ry="26"/></g>
<rect x="0" y="720" width="600" height="180" fill="#86efac"/><rect x="0" y="700" width="600" height="40" fill="#94a3b8"/>
<g transform="translate(80 470)"><rect width="440" height="230" rx="30" fill="#facc15"/><rect x="0" y="150" width="440" height="22" fill="#f59e0b"/>
<g fill="#e0f2fe"><rect x="30" y="34" width="80" height="70" rx="12"/><rect x="130" y="34" width="80" height="70" rx="12"/><rect x="230" y="34" width="80" height="70" rx="12"/></g>
<rect x="335" y="34" width="75" height="150" rx="12" fill="#e0f2fe"/>
<g fill="#fcd9b8"><circle cx="70" cy="74" r="20"/><circle cx="170" cy="74" r="20"/><circle cx="270" cy="74" r="20"/></g>
<g fill="#334155"><circle cx="90" cy="232" r="36"/><circle cx="350" cy="232" r="36"/></g><g fill="#cbd5e1"><circle cx="90" cy="232" r="14"/><circle cx="350" cy="232" r="14"/></g></g>
<path d="M130 340 q40 -40 80 0" stroke="#fb7185" stroke-width="10" fill="none" stroke-linecap="round"/>
</svg>`);
