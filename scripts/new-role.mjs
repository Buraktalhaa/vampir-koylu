#!/usr/bin/env node
/**
 * Yeni karakter iskeleti oluşturur.
 *
 *   npm run new-role -- <id> <takım>
 *   örn: npm run new-role -- hunter village
 *
 * takım: village | vampire | neutral
 *
 * Yaptıkları:
 *  1. src/game/roles/<id>.ts  — kural tanımı (şablon)
 *  2. src/game/roles/index.ts — karakter listesine ekler
 *  3. assets/portraits/<id>.svg ve <id>-small.svg — geçici portre (Köylü'nün kopyası; sonra çiz)
 *  4. src/i18n/locales/tr.ts ve en.ts — "TODO" metinleri (doldurulmadan testler geçmez)
 *  5. __tests__/role-<id>-test.ts — kural testleri için iskelet
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const TEAMS = ['village', 'vampire', 'neutral'];

const [id, team] = process.argv.slice(2);
if (!id || !/^[a-z][a-zA-Z0-9]*$/.test(id) || !TEAMS.includes(team)) {
  console.error('Kullanım: npm run new-role -- <id> <village|vampire|neutral>\n  id: küçük harfle başlayan camelCase (ör. hunter, vampireLord)');
  process.exit(1);
}

const path = (...p) => join(ROOT, ...p);
const read = (p) => readFileSync(path(p), 'utf8');
const write = (p, s) => writeFileSync(path(p), s);

const roleFile = `src/game/roles/${id}.ts`;
if (existsSync(path(roleFile))) {
  console.error(`Bu karakter zaten var: ${roleFile}`);
  process.exit(1);
}

/** `marker` satırını içeren nesnenin (girinti `indent`) kapanışından hemen önce ekler. */
function insertBeforeClose(source, marker, indent, block) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Bulunamadı: ${marker}`);
  const close = source.indexOf(`\n${indent}}`, start);
  return source.slice(0, close + 1) + block + source.slice(close + 1);
}

// 1) Kural tanımı
write(
  roleFile,
  `import { defineRole } from '@/game/roles/defineRole';

/** TODO: ${id} — karakterin ne yaptığını tek cümleyle yaz. */
export const ${id} = defineRole({
  id: '${id}',
  team: '${team}',
  // Gece yeteneği örneği (yoksa boş bırak):
  // abilities: [{ id: 'xxx', trigger: 'night', effect: 'kill' | 'protect' | 'investigate', cause: 'ability' }],
  abilities: [],
});
`,
);

// 2) Karakter listesi
let index = read('src/game/roles/index.ts');
index = index.replace(/(\nimport \{ \w+ \} from '@\/game\/roles\/\w+';)(?![\s\S]*\nimport \{ \w+ \} from '@\/game\/roles\/)/, `$1\nimport { ${id} } from '@/game/roles/${id}';`);
index = index.replace(/const ROLE_LIST = \[([^\]]*)\]/, (_, list) => `const ROLE_LIST = [${list.trim()}, ${id}]`);
write('src/game/roles/index.ts', index);

// 3) Geçici portre (design/puppet/PORTRE_KILAVUZU.md'ye göre gerçeğini çiz)
for (const suffix of ['', '-small']) {
  copyFileSync(path(`assets/portraits/villager${suffix}.svg`), path(`assets/portraits/${id}${suffix}.svg`));
}
execFileSync('node', [path('scripts/build-portraits.mjs')], { stdio: 'inherit' });

// 4) Metinler (TODO kalırsa i18n testi hata verir)
for (const lang of ['tr', 'en']) {
  const file = `src/i18n/locales/${lang}.ts`;
  const block = `    ${id}: {
      name: 'TODO ${id}',
      tip: 'TODO: ⓘ ile açılan detaylı açıklama',
      description: 'TODO: kısa açıklama',
      // abilities: { xxx: { name: 'TODO', prompt: 'TODO: gece sorusu', description: 'TODO' } },
    },
`;
  write(file, insertBeforeClose(read(file), '  roles: {', '  ', block));
}

// 5) Test iskeleti
write(
  `__tests__/role-${id}-test.ts`,
  `import { resolveDayVote, resolveNight } from '@/game';
import { alive, makeGame } from '@test-utils/game';

describe('${id}', () => {
  it.todo('kuralını test et (ör. gece yeteneği, kazanma koşulu)');

  it('oyuna eklenebiliyor', () => {
    const g = makeGame(['vampire', '${id}', 'villager', 'villager']);
    expect(g.players[1].roleId).toBe('${id}');
    // Örnek: resolveNight / resolveDayVote ile kuralı dene
    void resolveNight;
    void resolveDayVote;
    void alive;
  });
});
`,
);

console.log(`✔ ${id} (${team}) eklendi. Şimdi:
  1. ${roleFile} — kuralları yaz
  2. src/i18n/locales/tr.ts ve en.ts — TODO metinlerini doldur
  3. assets/portraits/${id}.svg + ${id}-small.svg — portreyi çiz (design/puppet/PORTRE_KILAVUZU.md), sonra npm run portraits
  4. __tests__/role-${id}-test.ts — testlerini yaz
  5. npm test`);
