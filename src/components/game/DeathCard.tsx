import { Flame } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import type { RoleId } from '@/game/roles';
import { colors, phases, radius, space } from '@/theme/tokens';

import { RolePill } from './RolePill';

type Props = {
  name: string;
  subtitle?: string;
  /** Açıklanacak rol (ayar kapalıysa null). */
  roleId?: RoleId | null;
  compact?: boolean;
};

/** Ağırbaşlı ölüm kartı: mum, soluk avatar, isim, (varsa) rol. Sabah, oylama ve intikam ekranlarında ortak. */
export function DeathCard({ name, subtitle, roleId, compact }: Props) {
  return (
    <View style={[styles.card, compact && styles.compact]}>
      <Flame size={compact ? 18 : 22} color={phases.day.accent} />
      <PlayerAvatar name={name} size={compact ? 56 : 96} dimmed />
      <AppText variant={compact ? 'h2' : 'display'} style={styles.center} numberOfLines={2}>
        {name.toLocaleUpperCase('tr')}
      </AppText>
      {subtitle ? (
        <AppText variant="small" color={colors.text2} style={styles.center}>
          {subtitle}
        </AppText>
      ) : null}
      {roleId ? <RolePill roleId={roleId} withTeam /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[6],
    paddingHorizontal: space[5],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#5A3420',
    backgroundColor: 'rgba(43, 21, 15, 0.7)',
  },
  compact: { flex: 1, paddingVertical: space[4], paddingHorizontal: space[2], gap: space[2] },
  center: { textAlign: 'center' },
});
