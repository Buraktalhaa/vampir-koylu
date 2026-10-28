import type { TeamId } from '@/game/types';
import { ART_XML } from '@/theme/art.generated';
import { puppet } from '@/theme/tokens';

/** Sahneler (390×844): menü, gece ve gündüz. Alt %40 koyu; yazı ve butonlar oraya gelir. */
export type SceneId = keyof typeof ART_XML.backdrops;
/** Dramatik anlar (320×240): ölüm, kimse ölmedi, asılma, beraberlik, kazananlar. */
export type MomentId = keyof typeof ART_XML.moments;

export const NIGHT_SCENES = ['night-1', 'night-2', 'night-3', 'night-4', 'night-5', 'night-6'] as const satisfies readonly SceneId[];
export const DAY_SCENES = ['day-1', 'day-2', 'day-3'] as const satisfies readonly SceneId[];

export const WIN_MOMENT: Record<TeamId, MomentId> = { village: 'win-village', vampire: 'win-vampire', neutral: 'win-neutral' };

export const SCENES = ART_XML.backdrops;
export const MOMENTS = ART_XML.moments;
export const EMBLEMS: Record<TeamId, string> = ART_XML.emblems;
export const LOGO = { lamp: ART_XML.brand.logo, silhouette: ART_XML.brand['logo-silhouette'] };

/** `#TEAM` yer tutucusunu gerçek renkle değiştirir (portreler, anlar, amblemler). */
export function paintTeam(xml: string, color: string): string {
  return xml.replaceAll('#TEAM', color);
}

/** Takım rengi; `hidden` ise takımı ele vermeyen nötr deri. */
export function teamInlay(team: TeamId | undefined, hidden = false): string {
  return hidden || !team ? puppet.hidden : puppet.team[team];
}

/** İsimden kararlı avatar (djb2): aynı oyuncu her ekranda aynı kukla başıyla görünür. */
export function avatarXml(name: string): string {
  let hash = 5381;
  for (const ch of name.toLocaleLowerCase('tr')) hash = ((hash * 33) ^ ch.charCodeAt(0)) >>> 0;
  return ART_XML.avatars[hash % ART_XML.avatars.length];
}

export function randomOf<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
