/**
 * Devir ve bekleme ekranlarının arka planındaki gece manzaraları.
 * Her biri 360×640 bir SVG; rolden bağımsız, rastgele seçilir (kimin ne olduğunu ele vermez).
 */
const W = 360;
const H = 640;

const C = {
  skyTop: '#0E1338',
  skyMid: '#141038',
  skyBottom: '#07060D',
  moon: '#EEF1FF',
  moonGlow: '#CBD5FF',
  far: '#2E1F5E',
  mid: '#1A1442',
  near: '#0A0912',
  light: '#F2A541',
  star: '#CBD5FF',
};

/** Tekrarlanabilir sözde rastgele: her sahnenin yıldızları hep aynı yerde. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function stars(seed: number, count = 34, maxY = 380): string {
  const r = rng(seed);
  return Array.from({ length: count }, () => {
    const x = (r() * W).toFixed(0);
    const y = (r() * maxY).toFixed(0);
    const size = (0.6 + r() * 1.3).toFixed(1);
    const o = (0.3 + r() * 0.6).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${size}" fill="${C.star}" opacity="${o}"/>`;
  }).join('');
}

function sky(id: string): string {
  return `<defs>
    <linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.skyTop}"/>
      <stop offset="0.55" stop-color="${C.skyMid}"/>
      <stop offset="1" stop-color="${C.skyBottom}"/>
    </linearGradient>
    <linearGradient id="fog${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.far}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${C.far}" stop-opacity="0.35"/>
      <stop offset="1" stop-color="${C.far}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="glow${id}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${C.moonGlow}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${C.moonGlow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky${id})"/>`;
}

function moon(id: string, x: number, y: number, r: number, crescent = false): string {
  const glow = `<circle cx="${x}" cy="${y}" r="${r * 3}" fill="url(#glow${id})"/>`;
  if (!crescent) return `${glow}<circle cx="${x}" cy="${y}" r="${r}" fill="${C.moon}"/>`;
  const mask = `<mask id="cres${id}"><rect width="${W}" height="${H}" fill="white"/><circle cx="${x + r * 0.45}" cy="${y - r * 0.25}" r="${r * 0.9}" fill="black"/></mask>`;
  return `${glow}${mask}<circle cx="${x}" cy="${y}" r="${r}" fill="${C.moon}" mask="url(#cres${id})"/>`;
}

function bat(x: number, y: number, s = 1): string {
  return `<path transform="translate(${x} ${y}) scale(${s})" fill="${C.near}" d="M0 0 q-6 -6 -14 -4 q4 3 3 7 q4 -3 7 0 q2 -3 4 -3 q2 0 4 3 q3 -3 7 0 q-1 -4 3 -7 q-8 -2 -14 4z"/>`;
}

function house(x: number, y: number, w = 34, h = 26, lit = true): string {
  const roof = `<path d="M${x - 4} ${y} L${x + w / 2} ${y - h * 0.7} L${x + w + 4} ${y} Z" fill="${C.near}"/>`;
  const body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.near}"/>`;
  const win = lit ? `<rect x="${x + w * 0.35}" y="${y + h * 0.3}" width="${w * 0.25}" height="${h * 0.3}" fill="${C.light}"/>` : '';
  return roof + body + win;
}

function pine(x: number, base: number, h: number, color = C.near): string {
  const w = h * 0.45;
  return `<path fill="${color}" d="M${x} ${base - h} L${x + w * 0.5} ${base - h * 0.55} L${x + w * 0.3} ${base - h * 0.55} L${x + w * 0.7} ${base - h * 0.15} L${x - w * 0.7} ${base - h * 0.15} L${x - w * 0.3} ${base - h * 0.55} L${x - w * 0.5} ${base - h * 0.55} Z"/><rect x="${x - 2}" y="${base - h * 0.15}" width="4" height="${h * 0.15}" fill="${color}"/>`;
}

function hill(y: number, amp: number, color: string, opacity = 1): string {
  return `<path fill="${color}" opacity="${opacity}" d="M0 ${y} Q${W * 0.25} ${y - amp} ${W * 0.5} ${y - amp * 0.3} T${W} ${y - amp * 0.6} V${H} H0 Z"/>`;
}

function fog(id: string, y: number): string {
  return `<rect x="0" y="${y}" width="${W}" height="120" fill="url(#fog${id})"/>`;
}

const scenes: ((id: string) => string)[] = [
  // 0 · Uyuyan köy
  (id) =>
    sky(id) + stars(1) + moon(id, 90, 150, 34) +
    hill(470, 60, C.far, 0.8) + hill(520, 40, C.mid) +
    house(40, 500) + house(100, 512, 30, 22, false) + house(250, 498) + house(300, 510, 28, 22) +
    `<path d="M180 510 V440 L192 418 L204 440 V510 Z" fill="${C.near}"/><path d="M192 392 L196 418 H188 Z" fill="${C.near}"/><rect x="189" y="456" width="6" height="9" fill="${C.light}"/>` +
    `<rect x="0" y="530" width="${W}" height="110" fill="${C.near}"/>` + bat(240, 120, 0.9) + bat(275, 150, 0.7),
  // 1 · Uçurumdaki şato
  (id) =>
    sky(id) + stars(2) + moon(id, 250, 170, 48) +
    `<path fill="${C.near}" d="M0 640 V470 L60 455 L110 420 L150 425 L170 400 V640 Z"/>` +
    `<path fill="${C.near}" d="M90 420 V330 H100 V318 H108 V330 H118 V318 H126 V330 H136 V420 Z"/><path fill="${C.near}" d="M126 420 V290 L138 262 L150 290 V420 Z"/>` +
    `<rect x="108" y="350" width="7" height="10" fill="${C.light}"/><rect x="135" y="310" width="6" height="9" fill="${C.light}"/>` +
    hill(560, 30, C.mid) + fog(id, 500) + bat(210, 230, 0.8) + bat(300, 260, 0.6),
  // 2 · Çam ormanı
  (id) =>
    sky(id) + stars(3) + moon(id, 180, 140, 30, true) +
    hill(460, 30, C.far, 0.7) +
    [20, 70, 120, 230, 290, 340].map((x, i) => pine(x, 500, 120 + (i % 3) * 25, C.mid)).join('') +
    [0, 50, 95, 150, 205, 260, 315, 360].map((x, i) => pine(x, 600, 160 + (i % 2) * 40)).join('') +
    `<rect x="0" y="595" width="${W}" height="45" fill="${C.near}"/>` + fog(id, 470),
  // 3 · Mezarlık
  (id) =>
    sky(id) + stars(4) + moon(id, 270, 130, 36) +
    hill(500, 25, C.mid) +
    [40, 95, 150, 210, 265, 320].map((x, i) =>
      i % 2
        ? `<path fill="${C.near}" d="M${x} ${560} V${520} a14 14 0 0 1 28 0 V${560} Z"/>`
        : `<path fill="${C.near}" d="M${x + 11} 562 V508 H${x + 17} V522 H${x + 30} V528 H${x + 17} V562 Z"/>`,
    ).join('') +
    `<rect x="0" y="560" width="${W}" height="80" fill="${C.near}"/>` +
    Array.from({ length: 19 }, (_, i) => `<rect x="${i * 20}" y="545" width="3" height="40" fill="${C.near}"/>`).join('') +
    `<rect x="0" y="552" width="${W}" height="3" fill="${C.near}"/>` + fog(id, 520) + bat(120, 200, 0.8),
  // 4 · Göl ve dağlar
  (id) =>
    sky(id) + stars(5, 40, 320) + moon(id, 180, 200, 40) +
    `<path fill="${C.far}" d="M0 430 L70 330 L120 390 L190 300 L260 380 L310 340 L360 400 V430 Z"/>` +
    `<rect x="0" y="430" width="${W}" height="210" fill="${C.mid}"/>` +
    `<ellipse cx="180" cy="500" rx="26" ry="60" fill="${C.moon}" opacity="0.18"/><rect x="150" y="470" width="60" height="2" fill="${C.moon}" opacity="0.35"/><rect x="160" y="500" width="40" height="2" fill="${C.moon}" opacity="0.25"/>` +
    `<path fill="${C.near}" d="M0 560 Q90 545 180 560 T360 555 V640 H0 Z"/>` + pine(30, 565, 90) + pine(330, 565, 110),
  // 5 · Tepedeki değirmen
  (id) =>
    sky(id) + stars(6) + moon(id, 80, 180, 32, true) +
    hill(520, 90, C.mid) +
    `<path fill="${C.near}" d="M235 470 L255 470 L262 390 L228 390 Z"/><path d="M245 395 L245 330 M245 395 L300 395 M245 395 L245 460 M245 395 L190 395" stroke="${C.near}" stroke-width="7"/>` +
    `<rect x="241" y="430" width="7" height="10" fill="${C.light}"/>` +
    `<path fill="${C.near}" d="M0 640 V560 Q120 520 240 560 T360 545 V640 Z"/>` + bat(140, 140, 0.9) + bat(170, 120, 0.6) + bat(300, 230, 0.8),
  // 6 · Kuyu ve yaşlı ağaç
  (id) =>
    sky(id) + stars(7) + moon(id, 260, 150, 42) +
    hill(540, 20, C.mid) +
    `<path fill="${C.near}" d="M70 560 V420 Q60 380 30 360 M70 440 Q90 400 130 385" stroke="${C.near}" stroke-width="10"/><path d="M70 470 Q40 440 20 445" stroke="${C.near}" stroke-width="6" fill="none"/>` +
    `<rect x="200" y="510" width="70" height="50" fill="${C.near}"/><path d="M195 470 H275" stroke="${C.near}" stroke-width="6"/><path d="M205 470 V510 M265 470 V510" stroke="${C.near}" stroke-width="5"/>` +
    `<rect x="0" y="560" width="${W}" height="80" fill="${C.near}"/>` + bat(118, 375, 0.6),
  // 7 · Dev ay önünde kilise kulesi
  (id) =>
    sky(id) + stars(8) + moon(id, 180, 260, 110) +
    `<path fill="${C.near}" d="M150 640 V330 L180 250 L210 330 V640 Z"/><path fill="${C.near}" d="M178 210 h4 v20 h10 v4 h-10 v14 h-4 v-14 h-10 v-4 h10 Z"/><rect x="172" y="380" width="16" height="24" rx="8" fill="${C.light}"/>` +
    house(30, 560, 60, 40) + house(260, 555, 70, 45, false) +
    `<rect x="0" y="600" width="${W}" height="40" fill="${C.near}"/>` + bat(110, 200) + bat(260, 180, 0.8) + bat(230, 330, 0.6),
  // 8 · Sıradağlar ve gözetleme kulesi
  (id) =>
    sky(id) + stars(9) + moon(id, 290, 120, 26, true) +
    `<path fill="${C.far}" d="M0 420 L60 360 L110 400 L170 320 L230 390 L290 340 L360 380 V640 H0 Z" opacity="0.8"/>` +
    `<path fill="${C.mid}" d="M0 480 L80 420 L140 460 L220 400 L300 450 L360 430 V640 H0 Z"/>` +
    `<path fill="${C.near}" d="M95 560 L110 450 H140 L155 560 Z"/><path fill="${C.near}" d="M100 450 H150 L125 425 Z"/><rect x="120" y="470" width="10" height="12" fill="${C.light}"/>` +
    `<rect x="0" y="555" width="${W}" height="85" fill="${C.near}"/>` + fog(id, 500),
  // 9 · Perili ev
  (id) =>
    sky(id) + stars(10) + moon(id, 100, 140, 38) +
    hill(540, 30, C.mid) +
    `<path fill="${C.near}" d="M150 560 V430 L215 380 L280 430 V560 Z"/><path fill="${C.near}" d="M180 400 V360 H196 V388 Z"/>` +
    `<rect x="170" y="450" width="18" height="22" fill="${C.light}"/><rect x="240" y="450" width="18" height="22" fill="${C.light}" opacity="0.6"/><rect x="205" y="500" width="22" height="60" fill="#140F24"/>` +
    `<path d="M70 560 V470 M70 500 L40 470 M70 490 L100 455 M70 520 L50 505" stroke="${C.near}" stroke-width="6" fill="none"/>` +
    `<rect x="0" y="560" width="${W}" height="80" fill="${C.near}"/>` + bat(250, 330, 0.8) + bat(285, 300, 0.6) + fog(id, 530),
];

export const SCENE_COUNT = scenes.length;

export function nightSceneXml(index: number): string {
  const i = ((index % SCENE_COUNT) + SCENE_COUNT) % SCENE_COUNT;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">${scenes[i](`s${i}`)}</svg>`;
}
