#!/usr/bin/env node
/**
 * assets/portraits/*.svg → src/theme/portraits.generated.ts
 *
 *   npm run portraits
 *
 * SVG'ler SvgXml ile çizildiği için metin olarak gömülür (ek Metro dönüştürücüsü gerekmez).
 * Yorumlar ve gereksiz boşluklar atılır. `#TEAM` yer tutucusu korunur; renk çizimde verilir.
 * Portreleri yeniden üretmek için: python3 scripts/art/portraits.py assets/portraits
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIR = join(ROOT, 'assets/portraits');
const OUT = join(ROOT, 'src/theme/portraits.generated.ts');

const minify = (xml) =>
  xml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .trim();

/**
 * Büyük portreyi hareket için sıralı katmanlara böler. Her `<g id="…">` (arm, head, hat, flame…) ayrı katman olur;
 * `chain` o katmanı hareket ettiren grupları dıştan içe sıralar (ör. alev kolla birlikte: ['arm', 'flame']).
 * Pivot, grubun ilk yorumundan okunur: `<!-- pivot: x,y -->`.
 */
function splitLayers(id, xml) {
  const open = xml.match(/^<svg[^>]*>/)?.[0];
  const inner = xml.slice(open.length).replace(/<\/svg>\s*$/, '');
  if (/<defs|<g(?! id=)/.test(inner)) throw new Error(`${id}: katmanlara bölmek için <defs> ve id'siz <g> kullanılmamalı`);
  const layers = [];
  const pivots = {};
  const chain = [];
  let buf = '';
  const flush = () => {
    const body = minify(buf);
    if (body) layers.push({ chain: [...chain], xml: `${open}${body}</svg>` });
    buf = '';
  };
  const re = /<g id="(\w+)">(?:<!--\s*pivot:\s*([\d.]+),\s*([\d.]+)[\s\S]*?-->)?|<\/g>/g;
  let last = 0;
  for (const m of inner.matchAll(re)) {
    buf += inner.slice(last, m.index);
    last = m.index + m[0].length;
    flush();
    if (m[0] === '</g>') chain.pop();
    else {
      chain.push(m[1]);
      if (!m[2]) throw new Error(`${id}: "${m[1]}" grubunun pivot yorumu yok`);
      pivots[m[1]] = [Number(m[2]), Number(m[3])];
    }
  }
  buf += inner.slice(last);
  flush();
  return { layers, pivots };
}

const portraits = {};
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.svg')).sort()) {
  const [, id, small] = file.match(/^(\w+?)(-small)?\.svg$/) ?? [];
  if (!id) throw new Error(`Beklenmeyen dosya adı: ${file}`);
  const raw = readFileSync(join(DIR, file), 'utf8');
  const entry = (portraits[id] ??= {});
  entry[small ? 'small' : 'large'] = minify(raw);
  if (!small) Object.assign(entry, splitLayers(id, raw));
}

for (const [id, p] of Object.entries(portraits)) {
  if (!p.large || !p.small) throw new Error(`${id}: hem ${id}.svg hem ${id}-small.svg gerekli`);
}

const body = Object.entries(portraits)
  .map(
    ([id, p]) =>
      `  ${id}: {\n    large: ${JSON.stringify(p.large)},\n    small: ${JSON.stringify(p.small)},\n` +
      `    pivots: ${JSON.stringify(p.pivots)},\n    layers: [\n${p.layers.map((l) => `      { chain: ${JSON.stringify(l.chain)}, xml: ${JSON.stringify(l.xml)} },`).join('\n')}\n    ],\n  },`,
  )
  .join('\n');

writeFileSync(
  OUT,
  `// Bu dosya scripts/build-portraits.mjs ile üretilir; elle düzenleme. Kaynak: assets/portraits/*.svg\nexport const PORTRAIT_XML = {\n${body}\n} as const;\n`,
);
console.log(`✔ ${Object.keys(portraits).length} portre → src/theme/portraits.generated.ts`);
