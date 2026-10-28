import { SvgXml } from 'react-native-svg';

import type { Icon, IconProps } from '@/components/icons/types';
import type { TeamId } from '@/game/types';
import { EMBLEMS, paintTeam, teamInlay } from '@/theme/art';

/**
 * Takım amblemi (ev / yarasa ve kan damlası / maske): açık gövde + takım renginde kakma.
 * İkon arayüzüyle aynı (size); gövde her zaman açık kalır ki koyu zeminde okunsun.
 */
function emblem(team: TeamId): Icon {
  const xml = paintTeam(EMBLEMS[team], teamInlay(team));
  function TeamEmblem({ size = 20 }: IconProps) {
    return <SvgXml xml={xml} width={size} height={size} />;
  }
  return TeamEmblem;
}

export const TEAM_EMBLEMS: Record<TeamId, Icon> = {
  village: emblem('village'),
  vampire: emblem('vampire'),
  neutral: emblem('neutral'),
};
