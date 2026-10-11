/**
 * Ana menü arka planı: kanlı dolunay, uçurumda vampir şatosu, ışıkları yanan köy, sis ve yarasa sürüsü.
 * 360×780 SVG; ekranın altına hizalanır, üstte logo için boş gökyüzü kalır.
 */
const W = 360;
const H = 780;

const C = {
  skyTop: '#07060D',
  skyMid: '#141038',
  skyLow: '#2E1F5E',
  moon: '#F6E3DA',
  moonRim: '#FF7A86',
  far: '#2E1F5E',
  mid: '#1A1442',
  near: '#0A0912',
  light: '#F2A541',
  blood: '#B3182E',
  star: '#CBD5FF',
};

function stars(): string {
  let s = 7;
  const r = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: 60 }, () => {
    const x = (r() * W).toFixed(0);
    const y = (r() * 420).toFixed(0);
    return `<circle cx="${x}" cy="${y}" r="${(0.5 + r() * 1.2).toFixed(1)}" fill="${C.star}" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`;
  }).join('');
}

function bat(x: number, y: number, s: number): string {
  return `<path transform="translate(${x} ${y}) scale(${s})" fill="${C.near}" d="M0 0 q-6 -6 -14 -4 q4 3 3 7 q4 -3 7 0 q2 -3 4 -3 q2 0 4 3 q3 -3 7 0 q-1 -4 3 -7 q-8 -2 -14 4z"/>`;
}

function house(x: number, y: number, w: number, h: number, lit: boolean): string {
  return (
    `<path d="M${x - 3} ${y} L${x + w / 2} ${y - h * 0.65} L${x + w + 3} ${y} Z" fill="${C.near}"/>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.near}"/>` +
    (lit ? `<rect x="${x + w * 0.38}" y="${y + h * 0.3}" width="${w * 0.24}" height="${h * 0.3}" fill="${C.light}"/>` : '')
  );
}

function pine(x: number, base: number, h: number, color: string): string {
  const w = h * 0.42;
  return `<path fill="${color}" d="M${x} ${base - h} L${x + w * 0.5} ${base - h * 0.55} L${x + w * 0.28} ${base - h * 0.55} L${x + w * 0.7} ${base - h * 0.12} L${x - w * 0.7} ${base - h * 0.12} L${x - w * 0.28} ${base - h * 0.55} L${x - w * 0.5} ${base - h * 0.55} Z"/><rect x="${x - 2}" y="${base - h * 0.12}" width="4" height="${h * 0.12}" fill="${color}"/>`;
}

export const MENU_ART_XML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.skyTop}"/>
    <stop offset="0.45" stop-color="${C.skyMid}"/>
    <stop offset="0.75" stop-color="${C.skyLow}"/>
    <stop offset="1" stop-color="${C.near}"/>
  </linearGradient>
  <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.moonRim}" stop-opacity="0.45"/>
    <stop offset="0.5" stop-color="${C.blood}" stop-opacity="0.18"/>
    <stop offset="1" stop-color="${C.blood}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="moonFace" cx="0.4" cy="0.35" r="0.7">
    <stop offset="0" stop-color="#FFF4EE"/>
    <stop offset="0.7" stop-color="${C.moon}"/>
    <stop offset="1" stop-color="#E9B9B0"/>
  </radialGradient>
  <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.far}" stop-opacity="0"/>
    <stop offset="0.5" stop-color="#5A4A8F" stop-opacity="0.35"/>
    <stop offset="1" stop-color="${C.far}" stop-opacity="0"/>
  </linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
${stars()}
<circle cx="200" cy="380" r="230" fill="url(#moonGlow)"/>
<circle cx="200" cy="380" r="112" fill="url(#moonFace)"/>
<circle cx="168" cy="350" r="16" fill="#E9C9C0" opacity="0.6"/>
<circle cx="232" cy="402" r="22" fill="#E9C9C0" opacity="0.45"/>
<circle cx="214" cy="335" r="8" fill="#E9C9C0" opacity="0.5"/>
${bat(120, 300, 1.3)}${bat(150, 270, 0.9)}${bat(255, 290, 1.1)}${bat(285, 320, 0.7)}${bat(95, 345, 0.6)}${bat(300, 250, 0.6)}
<path fill="${C.far}" opacity="0.9" d="M0 560 L50 520 L95 545 L150 500 L205 540 L255 505 L310 535 L360 515 V780 H0 Z"/>
<path fill="${C.near}" d="M210 780 V560 L235 548 L262 520 L300 512 L330 470 L360 462 V780 Z"/>
<path fill="${C.near}" d="M262 520 V430 H272 V418 H280 V430 H290 V418 H298 V430 H308 V520 Z"/>
<path fill="${C.near}" d="M298 520 V390 L312 355 L326 390 V520 Z"/>
<path fill="${C.near}" d="M246 528 V470 L256 452 L266 470 V528 Z"/>
<rect x="280" y="450" width="7" height="11" fill="${C.light}"/><rect x="309" y="405" width="6" height="10" fill="${C.blood}"/><rect x="253" y="485" width="5" height="8" fill="${C.light}"/>
<path fill="${C.mid}" d="M0 640 Q60 600 130 615 T240 600 L240 780 H0 Z"/>
${house(22, 612, 30, 24, true)}${house(64, 620, 26, 20, false)}${house(100, 606, 34, 28, true)}${house(148, 618, 28, 22, true)}
<path d="M186 630 V570 L197 550 L208 570 V630 Z" fill="${C.near}"/><path d="M197 528 L201 550 H193 Z" fill="${C.near}"/><rect x="194" y="585" width="6" height="9" fill="${C.light}"/>
<rect x="0" y="600" width="${W}" height="140" fill="url(#fog)"/>
${[10, 45, 80, 300, 335].map((x, i) => pine(x, 720, 140 + (i % 2) * 40, C.near)).join('')}
<path fill="${C.near}" d="M0 700 Q90 670 180 690 T360 680 V780 H0 Z"/>
</svg>`;
