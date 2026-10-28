import { ROLES, type RoleId } from '@/game/roles';
import { PORTRAIT_XML } from '@/theme/portraits.generated';
import { puppet } from '@/theme/tokens';

export { paintTeam } from '@/theme/art';

/** Portrenin hareketli parçaları (bkz. design/puppet/PORTRE_KILAVUZU.md §5). */
export type PuppetPart = 'head' | 'hat' | 'arm' | 'flame' | 'bat' | 'drum';

export type Portrait = {
  large: string;
  small: string;
  /** Parçanın döndüğü nokta (240×320 viewBox'ında). */
  pivots: Readonly<Partial<Record<PuppetPart, readonly [number, number]>>>;
  /** Büyük portre, çizim sırasıyla katmanlara bölünmüş; `chain` katmanı hareket ettiren parçalar (dıştan içe). */
  layers: readonly { chain: readonly PuppetPart[]; xml: string }[];
};

/**
 * Her karakterin gölge kukla portresi (büyük 240×320, küçük 64×64).
 * Yeni karakterin SVG'si yoksa TypeScript burada hata verir: assets/portraits/<id>.svg + <id>-small.svg ekle, `npm run portraits`.
 */
export const PORTRAITS: Record<RoleId, Portrait> = PORTRAIT_XML;

/** Karakterin kakma rengi; `hidden` ise takımı ele vermeyen nötr deri. */
export function inlayColor(roleId: RoleId, hidden = false): string {
  return hidden ? puppet.hidden : puppet.team[ROLES[roleId].team];
}
