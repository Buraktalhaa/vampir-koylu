import { Droplet, House, type LucideIcon } from 'lucide-react-native';

import type { TeamId } from '@/game/types';

import { colors } from './tokens';

/** Takım dili: renk + sembol + etiket (bilgi asla yalnız renkte değil). Etiket i18n'den gelir. */
export const TEAM_VISUALS: Record<TeamId, { icon: LucideIcon; fg: string; line: string; bg: string }> = {
  village: { icon: House, ...colors.team.village },
  vampire: { icon: Droplet, ...colors.team.vampire },
};
