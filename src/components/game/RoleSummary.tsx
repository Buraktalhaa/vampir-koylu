import { Crosshair, Info, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { RoleFigure } from '@/components/role/RoleFigure';
import { RolePortrait } from '@/components/role/RolePortrait';
import { TeamBadge } from '@/components/role/TeamBadge';
import { InfoBand } from '@/components/ui/InfoBand';
import { type GameState, getRole, isKnownTeammate, type Player, type RoleId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, motion, phases, radius, space } from '@/theme/tokens';

/**
 * Gece ekranının üstündeki rol özeti: madalyon, rol adı (+ seçilen yetenek), takım, açıklama
 * ve takımını tanıyan rollerde arkadaşlar. Rolünü ve yapacağını aynı ekranda görürsün; ızgarayı aşağı itmeyecek kadar kısa.
 */
export function RoleSummary({ game, player, abilityName }: { game: GameState; player: Player; abilityName?: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const roleId = player.roleId as RoleId;
  const mates = game.players.filter((p) => isKnownTeammate(player, p));
  // Rol Çalan: işaretlediği kişiyi hatırlat.
  const via = getRole(roleId).stealsRoleVia;
  const markId = via ? player.abilityState[via]?.lastTarget : undefined;
  const markedName = markId ? game.players.find((p) => p.id === markId)?.name : undefined;
  return (
    <View style={styles.summary}>
      <View style={styles.summaryHead}>
        <RolePortrait roleId={roleId} size={48} backdrop="night" hidden />
        <View style={styles.flex1}>
          <AppText variant="h2" numberOfLines={1}>
            {t.roles[roleId].name}
          </AppText>
          {abilityName ? (
            <AppText variant="small" color={phases.night.text2} numberOfLines={1}>
              {abilityName}
            </AppText>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.game.moreInfo}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen(!open)}
          hitSlop={8}
          style={[styles.infoBtn, open && styles.infoBtnOn]}
        >
          <Info size={18} color={open ? phases.night.bg : phases.night.text2} />
        </Pressable>
      </View>
      {markedName ? <InfoBand icon={Crosshair} tone="info" text={t.game.markedTarget(markedName)} /> : null}
      {player.convertedFrom ? (
        <InfoBand icon={Sparkles} tone="warning" text={t.game.roleChanged(t.roles[player.convertedFrom as RoleId].name, t.roles[roleId].name)} />
      ) : null}
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
        <Animated.View entering={FadeInDown.duration(motion.portraitEnter)} style={styles.tip}>
          <RoleFigure roleId={roleId} width={150} backdrop="night" />
          <TeamBadge team={getRole(roleId).team} />
          <AppText variant="small" color={colors.text2}>
            {t.roles[roleId].description}
          </AppText>
          <AppText variant="small">{t.roles[roleId].tip}</AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  strike: { textDecorationLine: 'line-through' },
  summary: { gap: space[2] },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  summaryMates: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space[2] },
  infoBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: phases.night.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnOn: { backgroundColor: phases.night.accent, borderColor: phases.night.accent },
  tip: { gap: space[3], padding: space[4], borderRadius: radius.md, borderWidth: 2, borderColor: phases.night.border, backgroundColor: phases.night.surface, alignItems: 'center' },
  mate: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
