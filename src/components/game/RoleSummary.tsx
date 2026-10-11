import { Info } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { RolePortrait } from '@/components/role/RolePortrait';
import { TeamBadge } from '@/components/role/TeamBadge';
import { type GameState, getRole, isKnownTeammate, type Player, type RoleId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, phases, radius, space } from '@/theme/tokens';

/**
 * Gece ekranının üstündeki rol özeti: madalyon, rol adı (+ seçilen yetenek), takım, açıklama
 * ve takımını tanıyan rollerde arkadaşlar. Rolünü ve yapacağını aynı ekranda görürsün; ızgarayı aşağı itmeyecek kadar kısa.
 */
export function RoleSummary({ game, player, abilityName }: { game: GameState; player: Player; abilityName?: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const roleId = player.roleId as RoleId;
  const mates = game.players.filter((p) => isKnownTeammate(player, p));
  return (
    <View style={styles.summary}>
      <View style={styles.summaryHead}>
        <RolePortrait roleId={roleId} size={36} />
        <AppText variant="h3" numberOfLines={1} style={styles.flexShrink}>
          {abilityName ? `${t.roles[roleId].name} · ${abilityName}` : t.roles[roleId].name}
        </AppText>
        <TeamBadge team={getRole(roleId).team} />
        <View style={styles.flex1} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.game.moreInfo}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen(!open)}
          hitSlop={8}
          style={[styles.infoBtn, open && styles.infoBtnOn]}
        >
          <Info size={16} color={open ? colors.textInverse : colors.text2} />
        </Pressable>
      </View>
      {mates.length ? (
        <View style={styles.summaryMates}>
          <AppText variant="caption" color={colors.text3}>
            {t.game.teammates}:
          </AppText>
          {mates.map((m) => (
            <View key={m.id} style={styles.mate}>
              <PlayerAvatar name={m.name} size={20} dimmed={!m.alive} />
              <AppText variant="small" color={m.alive ? colors.text1 : colors.text3} style={!m.alive && styles.strike}>
                {m.name}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
      {open ? (
        <View style={styles.tip}>
          <AppText variant="small" color={colors.text2}>
            {t.roles[roleId].description}
          </AppText>
          <AppText variant="small">{t.roles[roleId].tip}</AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  strike: { textDecorationLine: 'line-through' },
  summary: {
    gap: space[2],
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  summaryMates: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[2] },
  infoBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnOn: { backgroundColor: phases.night.accent, borderColor: phases.night.accent },
  tip: { gap: space[2], padding: space[3], borderRadius: radius.sm, backgroundColor: colors.surface2, borderLeftWidth: 3, borderLeftColor: phases.night.accent },
  mate: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
