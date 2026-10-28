#!/usr/bin/env node
/**
 * assets/art/**\/*.svg → src/theme/art.generated.ts
 *
 *   npm run art
 *
 * Sahneler, dramatik anlar, takım amblemleri, oyuncu avatarları ve logo metin olarak gömülür (SvgXml ile çizilir).
 * Yorumlar atılır; `#TEAM` yer tutucusu korunur. Çizimleri yeniden üretmek için: python3 scripts/art/<betik>.py
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIR = join(ROOT, 'assets/art');
const OUT = join(ROOT, 'src/theme/art.generated.ts');

const minify = (xml) =>
  xml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .trim();

/** Klasördeki SVG'ler: dosya adı (uzantısız) → içerik. */
function folder(name) {
  const files = readdirSync(join(DIR, name)).filter((f) => f.endsWith('.svg')).sort();
  return Object.fromEntries(files.map((f) => [f.replace(/\.svg$/, ''), minify(readFileSync(join(DIR, name, f), 'utf8'))]));
}

const art = {
  backdrops: folder('backdrops'),
  moments: folder('moments'),
  emblems: folder('emblems'),
  avatars: Object.values(folder('avatars')),
  brand: folder('brand'),
};

const entries = (obj, indent) =>
  Object.entries(obj)
    .map(([k, v]) => `${indent}${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join('\n');

writeFileSync(
  OUT,
  `// Bu dosya scripts/build-art.mjs ile üretilir; elle düzenleme. Kaynak: assets/art/**/*.svg
export const ART_XML = {
  backdrops: {
${entries(art.backdrops, '    ')}
  },
  moments: {
${entries(art.moments, '    ')}
  },
  emblems: {
${entries(art.emblems, '    ')}
  },
  avatars: [
${art.avatars.map((v) => `    ${JSON.stringify(v)},`).join('\n')}
  ],
  brand: {
${entries(art.brand, '    ')}
  },
} as const;
`,
);
const count = Object.values(art).reduce((n, v) => n + (Array.isArray(v) ? v.length : Object.keys(v).length), 0);
console.log(`✔ ${count} çizim → src/theme/art.generated.ts`);
