import { Vote } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { Screen } from '@/components/ui/Screen';
import { Stepper } from '@/components/ui/Stepper';
import { PhaseHeader } from '@/components/game/PhaseHeader';
import { alivePlayers, getRole, type GameState, type PlayerId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, fonts, radius, space } from '@/theme/tokens';
import { Chip } from '@/components/ui/Chip';

/** Açık oylama: telefon ortada; toplam oy hayattaki oyuncu sayısını aşamaz. */
export function OpenVote({ game, onDone }: { game: GameState; onDone: (counts: Record<PlayerId, number>) => void }) {
  const { t } = useLanguage();
  const [counts, setCounts] = useState<Record<PlayerId, number>>({});
  const alive = alivePlayers(game);
  // Toplam verilebilecek oy: her yaşayanın oy ağırlığı (ör. Belediye Başkanı 2).
  const totalVotes = alive.reduce((sum, p) => sum + (getRole(p.roleId).voteWeight ?? 1), 0);
  const given = Object.values(counts).reduce((a, b) => a + b, 0);
  const max = Math.max(0, ...Object.values(counts));
  const leaders = alive.filter((p) => max > 0 && counts[p.id] === max);
  const tie = leaders.length > 1;
  const change = (id: PlayerId, delta: number) => setCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + delta) }));

  return (
    <Screen
      phase="day"
      footer={
        <Button
          label={leaders.length === 1 ? t.game.finishWill(leaders[0].name) : t.game.finishNobody}
          onPress={() => onDone(counts)}
        />
      }
    >
      <PhaseHeader icon={Vote} phase="day" title={t.game.day(game.round)} subtitle={t.game.openSub} />
      <View style={styles.titleRow}>
        <AppText variant="h1" style={styles.flex1}>
          {t.game.openTitle}
        </AppText>
        <AppText variant="small" color={colors.text2}>
          {t.game.votesGiven(given, totalVotes)}
        </AppText>
      </View>
      {tie ? (
        <AppText variant="small" color={colors.warning.fg}>
          {t.game.tie}
        </AppText>
      ) : given < totalVotes ? (
        <AppText variant="small" color={colors.lamp.core}>
          {t.game.notVoted(totalVotes - given)}
        </AppText>
      ) : null}
      <View style={styles.list}>
        {alive.map((p) => {
          const n = counts[p.id] ?? 0;
          const isLeader = leaders.some((l) => l.id === p.id);
          return (
            <View key={p.id} style={[styles.row, isLeader && (tie ? styles.rowTie : styles.rowLeader)]}>
              {isLeader && !tie ? <LeaderGlow /> : null}
              <PlayerAvatar name={p.name} size={44} />
              <AppText numberOfLines={1} style={[styles.flex1, styles.name]}>
                {p.name}
              </AppText>
              {isLeader && tie ? <Chip label={t.game.equal} color={colors.warning.fg} shape="tag" /> : null}
              <View style={styles.stepper}>
                <Stepper
                  value={String(n)}
                  valueColor={isLeader && !tie ? colors.lamp.core : colors.text1}
                  onMinus={() => change(p.id, -1)}
                  onPlus={() => change(p.id, 1)}
                  minusDisabled={n === 0}
                  plusDisabled={given >= totalVotes}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

/** Önde olan satırda soldan sızan kandil ışığı. */
function LeaderGlow() {
  return (
    <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 10 10">
      <Defs>
        <LinearGradient id="vote-leader" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={colors.lamp.mid} stopOpacity={0.28} />
          <Stop offset="0.7" stopColor={colors.lamp.mid} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect width="10" height="10" fill="url(#vote-leader)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: space[2] },
  list: { gap: space[2] },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
    overflow: 'hidden',
  },
  rowLeader: { borderColor: colors.lamp.mid },
  rowTie: { borderColor: colors.warning.fg, borderStyle: 'dashed' },
  name: { fontFamily: fonts.bodyBold },
  stepper: { width: 116 },
});
