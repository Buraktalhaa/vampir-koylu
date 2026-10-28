import { router } from 'expo-router';
import { Moon, Sun } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Moment } from '@/components/art/Moment';
import { GroupHeader } from '@/components/role/GroupHeader';
import { RolePortrait } from '@/components/role/RolePortrait';
import { ActionBar } from '@/components/ui/ActionBar';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { findPlayer, type GameEvent, type GameState, type Phase, type PlayerId, type RoleId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { teamInlay, WIN_MOMENT } from '@/theme/art';
import { TEAM_VISUALS } from '@/theme/teams';
import { colors, fonts, gutter, phases, radius, space } from '@/theme/tokens';

/** Oyun sonu (tasarım 07): kazanan sahnesi, amblemli başlık, tur şeridi, herkesin rolü ve ayrıntılı olay özeti. */
export function GameOver({ game, onLeave }: { game: GameState; onLeave: () => void }) {
  const { t, language } = useLanguage();
  const winner = game.winner ?? 'village';
  const { icon: Emblem, fg } = TEAM_VISUALS[winner];
  // Tek başına kazanan (ör. asılan Deli) varsa başlıkta adı ve rolü yazar.
  const solo = game.winners?.map((id) => findPlayer(game, id)) ?? [];
  const title = solo.length
    ? solo.map((p) => t.game.soloWin(p.name, t.roles[p.roleId as RoleId].name)).join('\n')
    : t.game.wins(t.teams[winner].name);
  const leave = (to: '/new-game' | '/') => {
    onLeave();
    router.replace(to);
  };
  return (
    <Screen
      phase="day"
      footer={
        <ActionBar
          secondary={<Button label={t.game.mainMenu} variant="secondary" onPress={() => leave('/')} />}
          primary={<Button label={t.game.newGame} onPress={() => leave('/new-game')} />}
        />
      }
    >
      <View style={styles.hero}>
        <Moment id={WIN_MOMENT[winner]} inlay={teamInlay(winner)} variant="bare" />
        <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 10 10" pointerEvents="none">
          <Defs>
            <LinearGradient id="win-fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.68" stopColor={phases.day.bg} stopOpacity={0} />
              <Stop offset="1" stopColor={phases.day.bg} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect width="10" height="10" fill="url(#win-fade)" />
        </Svg>
      </View>
      <View style={styles.titleRow}>
        <Emblem size={32} />
        <AppText variant="display" color={fg} style={styles.title}>
          {title.toLocaleUpperCase(language)}
        </AppText>
      </View>
      <RoundStrip game={game} />
      <View style={styles.players}>
        {game.players.map((p, i) => (
          <Animated.View key={p.id} entering={FadeInUp.delay(200 + i * 80).duration(500)} style={[styles.player, !p.alive && styles.dead]}>
            <RolePortrait roleId={p.roleId as RoleId} size={34} />
            <View style={styles.flex1}>
              <AppText numberOfLines={1} style={[styles.name, !p.alive && styles.strike]}>
                {p.name}
              </AppText>
              <AppText variant="small" color={colors.text2} numberOfLines={1}>
                {t.roles[p.roleId as RoleId].name}
              </AppText>
            </View>
          </Animated.View>
        ))}
      </View>
      <GroupHeader title={t.game.timeline} />
      <Timeline game={game} />
    </Screen>
  );
}

/** Tur şeridi: her gece (ay) ve gün (güneş) için bir düğüm; altında o tur ölenler (yoksa "—"). */
function RoundStrip({ game }: { game: GameState }) {
  const deaths = game.events.filter((e) => e.type === 'death');
  const last = game.events.at(-1);
  if (!last) return null;
  const steps: { key: string; phase: Phase; label: string }[] = [];
  for (let round = 1; round <= last.round; round++) {
    for (const phase of ['night', 'day'] as const) {
      if (round === last.round && phase === 'day' && last.phase === 'night') break;
      const names = deaths.filter((d) => d.round === round && d.phase === phase).map((d) => findPlayer(game, d.playerId).name);
      steps.push({ key: `${round}-${phase}`, phase, label: names.join(', ') || '—' });
    }
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip} style={styles.stripBox}>
      {steps.map((s) => (
        <View key={s.key} style={styles.step}>
          <View style={[styles.node, s.phase === 'night' ? styles.nodeNight : styles.nodeDay]}>
            {s.phase === 'night' ? <Moon size={16} color={colors.moon} /> : <Sun size={16} color={colors.textInverse} />}
          </View>
          <AppText numberOfLines={1} color={colors.text2} style={styles.stepLabel}>
            {s.label}
          </AppText>
        </View>
      ))}
    </ScrollView>
  );
}

/** Olayları tur ve faza göre gruplar: "1. Gece", "1. Gün", ... */
export function Timeline({ game }: { game: GameState }) {
  const { t } = useLanguage();
  const name = (id?: PlayerId) => (id ? findPlayer(game, id).name : '');
  const roleName = (id: PlayerId) => t.roles[findPlayer(game, id).roleId as RoleId].name;

  const line = (e: GameEvent): string | null => {
    switch (e.type) {
      case 'ability': {
        const roleId = findPlayer(game, e.actorId).roleId as RoleId;
        const ability = t.roles[roleId].abilities?.[e.abilityId]?.name ?? e.abilityId;
        const targets = [e.targetId, e.secondTargetId].filter(Boolean).map((id) => name(id)).join(' & ');
        return t.game.usedAbility(`${name(e.actorId)} (${roleName(e.actorId)})`, ability, targets || undefined);
      }
      case 'saved':
        return t.game.saved(name(e.playerId));
      case 'death':
        return e.cause === 'lynch' ? t.game.hanged(name(e.playerId)) : t.game.died(name(e.playerId));
      default:
        return null;
    }
  };

  const groups: { key: string; title: string; items: string[] }[] = [];
  for (const e of game.events) {
    const text = line(e);
    if (!text) continue;
    const key = `${e.round}-${e.phase}`;
    let group = groups.at(-1);
    if (group?.key !== key) {
      group = { key, title: e.phase === 'night' ? t.game.night(e.round) : t.game.day(e.round), items: [] };
      groups.push(group);
    }
    group.items.push(text);
  }

  return (
    <View style={styles.timeline}>
      {groups.map((g) => (
        <View key={g.key} style={styles.timelineGroup}>
          <AppText variant="h3">{g.title}</AppText>
          {g.items.map((item, i) => (
            <AppText key={i} variant="small" color={colors.text2}>
              • {item}
            </AppText>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  strike: { textDecorationLine: 'line-through' },
  hero: { marginHorizontal: -gutter, marginTop: -space[2] },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2], marginTop: -space[10] },
  title: { flexShrink: 1, textAlign: 'center' },
  stripBox: { borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface1 },
  strip: { gap: space[3], padding: space[3] },
  step: { width: 64, alignItems: 'center', gap: space[1] },
  node: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  nodeNight: { backgroundColor: phases.night.mist, borderColor: '#7D6CB8' },
  nodeDay: { backgroundColor: colors.lamp.mid, borderColor: colors.lamp.core },
  stepLabel: { fontSize: 11, lineHeight: 14 },
  players: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space[3] },
  player: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 44, paddingRight: space[2] },
  dead: { opacity: 0.5 },
  name: { fontFamily: fonts.bodyBold },
  timeline: { gap: space[4] },
  timelineGroup: { gap: space[1] },
});
