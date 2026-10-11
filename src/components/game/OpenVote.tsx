import { Vote } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { Screen } from '@/components/ui/Screen';
import { Stepper } from '@/components/ui/Stepper';
import { PhaseHeader } from '@/components/game/PhaseHeader';
import { alivePlayers, type GameState, type PlayerId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, phases, radius, space } from '@/theme/tokens';
import { Chip } from '@/components/ui/Chip';

/** Açık oylama: telefon ortada; toplam oy hayattaki oyuncu sayısını aşamaz. */
export function OpenVote({ game, onDone }: { game: GameState; onDone: (counts: Record<PlayerId, number>) => void }) {
  const { t } = useLanguage();
  const [counts, setCounts] = useState<Record<PlayerId, number>>({});
  const alive = alivePlayers(game);
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
          phase="day"
          onPress={() => onDone(counts)}
        />
      }
    >
      <PhaseHeader icon={Vote} phase="day" title={t.game.day(game.round)} subtitle={t.game.openSub} />
      <AppText variant="h1">{t.game.openTitle}</AppText>
      <View style={styles.sectionHead}>
        <AppText variant="small" color={colors.text2}>
          {t.game.votesGiven(given, alive.length)}
        </AppText>
        {tie ? (
          <AppText variant="small" color={colors.warning.fg}>
            {t.game.tie}
          </AppText>
        ) : given < alive.length ? (
          <AppText variant="small" color={phases.day.accent}>
            {t.game.notVoted(alive.length - given)}
          </AppText>
        ) : null}
      </View>
      <View style={styles.openGrid}>
        {alive.map((p) => {
          const n = counts[p.id] ?? 0;
          const isLeader = leaders.some((l) => l.id === p.id);
          return (
            <View key={p.id} style={styles.openCell}>
              <View
                style={[
                  styles.openCard,
                  isLeader && !tie && { borderColor: phases.day.accent, borderWidth: 2, backgroundColor: phases.day.selectBg },
                  isLeader && tie && styles.openTie,
                ]}
              >
                <View style={styles.openHead}>
                  <PlayerAvatar name={p.name} size={28} />
                  <AppText variant="button" numberOfLines={1} style={styles.flex1}>
                    {p.name}
                  </AppText>
                  {isLeader ? (
                    <Chip
                      label={tie ? t.game.equal : t.game.leader}
                      color={tie ? colors.warning.fg : colors.textInverse}
                      borderColor={tie ? colors.warning.fg : phases.day.accent}
                      background={tie ? colors.warning.bg : phases.day.accent}
                    />
                  ) : null}
                </View>
                <Stepper
                  value={String(n)}
                  onMinus={() => change(p.id, -1)}
                  onPlus={() => change(p.id, 1)}
                  minusDisabled={n === 0}
                  plusDisabled={given >= alive.length}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  openGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  openCell: { width: '50%', padding: 5 },
  openCard: {
    gap: space[3],
    padding: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  openTie: { borderColor: colors.warning.fg, borderWidth: 2, borderStyle: 'dashed' },
  openHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
