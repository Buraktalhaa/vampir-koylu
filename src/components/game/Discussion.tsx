import { Info, Moon, SkipForward, Sun, Timer, Vote } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { CountdownRing } from '@/components/ui/CountdownRing';
import { PlayerPicker } from '@/components/player/PlayerPicker';
import { Screen } from '@/components/ui/Screen';
import { PhaseHeader } from '@/components/game/PhaseHeader';
import { alivePlayers, type GameState } from '@/game';
import { useCountdown } from '@/hooks/useCountdown';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, phases, space } from '@/theme/tokens';

import { ActionBar } from '@/components/ui/ActionBar';
import { InfoBand } from '@/components/ui/InfoBand';
import { GroupHeader } from '@/components/role/GroupHeader';
import { hapticWarning } from '@/feedback/haptics';

/** Tartışma süresi bitince oylamaya geçmeden önceki kısa geri sayım. */
const AUTO_VOTE_SECONDS = 3;

type DiscussionProps = {
  game: GameState;
  /** false: oylamasız gün (1. gün tanışma) — süre bitince doğrudan geceye geçilir. */
  voteToday: boolean;
  onVote: () => void;
  onNight: () => void;
};

export function Discussion({ game, voteToday, onVote, onNight }: DiscussionProps) {
  const { t } = useLanguage();
  const [timeUp, setTimeUp] = useState(false);
  const { remaining, total, addSeconds } = useCountdown(game.settings.discussionSeconds, () => {
    hapticWarning();
    if (voteToday) setTimeUp(true);
    else onNight();
  });
  const alive = alivePlayers(game).length;
  const dead = game.players.length - alive;

  const confirmSkip = () =>
    Alert.alert(t.game.skipVoteTitle, t.game.skipVoteMessage, [
      { text: t.game.cancel, style: 'cancel' },
      { text: t.game.skipVote, onPress: onNight },
    ]);

  const addMinute = <Button label={t.game.addTime} variant="secondary" onPress={() => addSeconds(60)} />;
  let footer: ReactNode;
  if (!voteToday) {
    footer = <ActionBar secondary={addMinute} primary={<Button label={t.game.toNight} icon={Moon} onPress={onNight} />} />;
  } else if (timeUp) {
    footer = (
      <>
        <AutoVoteBand
          onAddMinute={() => {
            setTimeUp(false);
            addSeconds(60);
          }}
          onElapsed={onVote}
        />
        <Button label={t.game.startNow} icon={Vote} onPress={onVote} />
      </>
    );
  } else {
    footer = (
      <>
        <ActionBar secondary={addMinute} primary={<Button label={t.game.toVote} onPress={onVote} />} />
        <Button label={t.game.skipVote} variant="tertiary" icon={SkipForward} onPress={confirmSkip} />
      </>
    );
  }

  const living = game.players.filter((p) => p.alive);
  return (
    <Screen phase="day" footer={footer}>
      <PhaseHeader icon={Sun} phase="day" title={t.game.day(game.round)} subtitle={voteToday ? t.game.discussSub(alive) : t.game.introSub} />
      <CountdownRing remaining={remaining} total={total} label={remaining > 0 ? t.game.remaining : t.game.timeUp} />
      {!voteToday ? <InfoBand icon={Info} text={t.game.introInfo} /> : null}
      <GroupHeader title={t.game.aliveDead(alive, dead)} />
      <PlayerPicker items={living.map((player) => ({ player }))} phase="day" columns={4} />
    </Screen>
  );
}

/** Süre doldu bandı: birkaç saniye sonra oylama kendiliğinden başlar, "+1 dk" ile ertelenebilir. */
function AutoVoteBand({ onAddMinute, onElapsed }: { onAddMinute: () => void; onElapsed: () => void }) {
  const { t } = useLanguage();
  const { remaining } = useCountdown(AUTO_VOTE_SECONDS, onElapsed);
  return (
    <View style={styles.autoBand}>
      <Timer size={18} color={phases.day.accent} />
      <AppText variant="small" style={styles.flex1}>
        {t.game.autoVote(remaining)}
      </AppText>
      <Pressable accessibilityRole="button" onPress={onAddMinute} hitSlop={8}>
        <AppText variant="button" color={phases.day.accent}>
          {t.game.addTime}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  autoBand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    padding: space[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning.line,
    backgroundColor: colors.warning.bg,
  },
});
