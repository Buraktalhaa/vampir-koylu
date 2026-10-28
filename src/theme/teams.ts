import { TEAM_EMBLEMS } from '@/components/icons/TeamEmblem';
import type { Icon } from '@/components/icons/types';
import type { TeamId } from '@/game/types';

import { colors } from '@/theme/tokens';

/** Takım dili: renk + amblem + etiket (bilgi asla yalnız renkte değil). Etiket i18n'den gelir. */
export const TEAM_VISUALS: Record<TeamId, { icon: Icon; fg: string; line: string; bg: string }> = {
  village: { icon: TEAM_EMBLEMS.village, ...colors.team.village },
  vampire: { icon: TEAM_EMBLEMS.vampire, ...colors.team.vampire },
  neutral: { icon: TEAM_EMBLEMS.neutral, ...colors.team.neutral },
};
