import { ROLE_IDS } from '@/game/roles';
import { inlayColor, paintTeam, PORTRAITS } from '@/theme/portraits';

/** react-native-svg'nin çizemediği ya da kılavuzun yasakladığı etiketler. */
const FORBIDDEN = /<(filter|mask|foreignObject|text|image|style)\b|class=/;

describe('portreler', () => {
  it.each(ROLE_IDS)('%s: büyük ve küçük portre kurallara uygun', (id) => {
    for (const xml of [PORTRAITS[id].large, PORTRAITS[id].small]) {
      expect(xml).toContain('#TEAM');
      expect(xml).not.toMatch(FORBIDDEN);
      expect(paintTeam(xml, inlayColor(id))).not.toContain('#TEAM');
    }
    expect(PORTRAITS[id].large).toContain('viewBox="0 0 240 320"');
    expect(PORTRAITS[id].small).toContain('viewBox="0 0 64 64"');
  });

  it('gizli bağlamda takım rengi görünmez', () => {
    expect(inlayColor('vampire', true)).toBe(inlayColor('villager', true));
  });
});
