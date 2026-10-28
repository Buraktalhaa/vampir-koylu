import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Moment } from '@/components/art/Moment';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { RolePortrait } from '@/components/role/RolePortrait';
import { TeamBadge } from '@/components/role/TeamBadge';
import { AppText } from '@/components/ui/AppText';
import { ROLES, type RoleId } from '@/game/roles';
import { useLanguage } from '@/i18n/LanguageProvider';
import { type MomentId, teamInlay } from '@/theme/art';
import { usePhase } from '@/theme/PhaseContext';
import { colors, motion, phases, radius, space } from '@/theme/tokens';

type Props = {
  name: string;
  subtitle?: string;
  /** Açıklanacak rol (ayar kapalıysa null). */
  roleId?: RoleId | null;
  /** Kartın üstündeki an görseli (ör. sabah: düşmüş kukla). Kakması rol açıklanıyorsa takım rengi, değilse nötr deri. */
  moment?: MomentId;
  /** Birden çok kart sırayla belirir (kuklalar tek tek düşer). */
  index?: number;
};

/** Ölüm kartı (tasarım 05): an görseli + madalyon (rol açıklanmıyorsa oyuncu avatarı) + ad + alt satır + takım etiketi. */
export function DeathCard({ name, subtitle, roleId, moment, index = 0 }: Props) {
  const { language } = useLanguage();
  const theme = phases[usePhase()];
  const team = roleId ? ROLES[roleId].team : undefined;
  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 180).duration(motion.deathDrop)}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      {moment ? <Moment id={moment} inlay={teamInlay(team, !roleId)} variant="bare" style={styles.moment} /> : null}
      <View style={styles.row}>
        {roleId ? <RolePortrait roleId={roleId} size={56} /> : <PlayerAvatar name={name} size={56} dimmed />}
        <View style={styles.text}>
          <AppText variant="h1" numberOfLines={1} adjustsFontSizeToFit>
            {name.toLocaleUpperCase(language)}
          </AppText>
          {subtitle ? (
            <AppText variant="small" color={theme.text2}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
      {team ? <TeamBadge team={team} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space[3], padding: 14, borderRadius: radius.md, borderWidth: 2, boxShadow: '0px 12px 14px rgba(0, 0, 0, 0.55)' },
  moment: { borderRadius: 10, backgroundColor: colors.bg0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  text: { flex: 1, gap: 2 },
});
