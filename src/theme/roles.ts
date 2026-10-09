import { HandHeart, Swords, WandSparkles, Wheat } from 'lucide-react-native';

import { BatIcon } from '@/components/icons/BatIcon';
import type { Icon } from '@/components/icons/types';
import type { RoleId } from '@/game/roles';

/** Her karakterin ikonu. Yeni karakter eklenince TypeScript burada ikon ister. */
export const ROLE_ICONS: Record<RoleId, Icon> = {
  villager: Wheat,
  vampire: BatIcon,
  witch: WandSparkles,
  healer: HandHeart,
  avenger: Swords,
};
