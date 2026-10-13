import { ROLE_IDS, ROLES } from '@/game';
import { LOCALES } from '@/i18n';

describe.each(Object.entries(LOCALES))('Çeviri: %s', (_, t) => {
  it.each(ROLE_IDS)('%s için isim, açıklama ve detaylı açıklama var', (id) => {
    expect(t.roles[id].name).toBeTruthy();
    expect(t.roles[id].description).toBeTruthy();
    expect(t.roles[id].tip).toBeTruthy();
  });

  it.each(ROLE_IDS)('%s rolünün her yeteneğinin adı ve açıklaması var', (id) => {
    for (const ability of ROLES[id].abilities) {
      expect(t.roles[id].abilities?.[ability.id]?.name).toBeTruthy();
      expect(t.roles[id].abilities?.[ability.id]?.description).toBeTruthy();
    }
  });

  it('hiçbir metinde TODO kalmamış (yeni karakter iskeleti doldurulmuş)', () => {
    const todos: string[] = [];
    const walk = (value: unknown, path: string) => {
      if (typeof value === 'string' && value.includes('TODO')) todos.push(path);
      else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
    };
    walk(t.roles, 'roles');
    expect(todos).toEqual([]);
  });

  it('20 tane iki seçenekli soru var', () => {
    expect(t.quiz).toHaveLength(20);
    for (const q of t.quiz) expect(q.q && q.a && q.b).toBeTruthy();
  });
});
