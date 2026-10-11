import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import { Alert, BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Discussion } from '@/components/game/Discussion';
import { GameOver } from '@/components/game/GameOver';
import { Handoff } from '@/components/game/Handoff';
import { MorningReport } from '@/components/game/MorningReport';
import { NightTurn } from '@/components/game/NightTurn';
import { OpenVote } from '@/components/game/OpenVote';
import { Avenged, RevengePick } from '@/components/game/Revenge';
import { SecretVote } from '@/components/game/SecretVote';
import { Verdict } from '@/components/game/Verdict';
import {
  type ActionSubmission,
  alivePlayers,
  countVotes,
  deathsSince,
  findPlayer,
  type GameState,
  type PlayerId,
  resolveDayVote,
  resolveDayVoteCounts,
  resolveNight,
  resolveTrigger,
  skipNight,
  skipTrigger,
} from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import type { Flow, Session, Stage } from '@/store/session';
import { colors, radius, space } from '@/theme/tokens';

export default function GameScreen() {
  const { t } = useLanguage();
  const { session, updateSession, endSession } = useGame();
  useKeepAwake();

  const confirmQuit = useCallback(() => {
    Alert.alert(t.game.quitTitle, t.game.quitMessage, [
      { text: t.game.cancel, style: 'cancel' },
      {
        text: t.game.quit,
        style: 'destructive',
        onPress: () => {
          endSession();
          router.replace('/');
        },
      },
    ]);
  }, [t, endSession]);

  // Android geri tuşu oyunu onaysız kapatmasın.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmQuit();
      return true;
    });
    return () => sub.remove();
  }, [confirmQuit]);

  if (!session) {
    return <Screen footer={<Button label={t.game.mainMenu} onPress={() => router.replace('/')} />}>{null}</Screen>;
  }

  return (
    <View style={styles.root}>
      <GameFlow session={session} update={updateSession} onLeave={endSession} />
      {session.flow.stage !== 'end' ? <QuitButton onPress={confirmQuit} /> : null}
    </View>
  );
}

function QuitButton({ onPress }: { onPress: () => void }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.game.quit}
      onPress={onPress}
      hitSlop={8}
      style={[styles.quit, { top: insets.top + space[3] }]}
    >
      <X size={18} color={colors.text3} />
    </Pressable>
  );
}

type FlowProps = {
  session: Session;
  update: (fn: (s: Session) => Session) => void;
  onLeave: () => void;
};

/** Oyunun aşama makinesi. Tüm durum `session` içinde; her adım kaydedilir. */
function GameFlow({ session, update, onLeave }: FlowProps) {
  const { t } = useLanguage();
  const { game, flow } = session;
  const { stage, queue, turn, shown, submissions, votes, eventsFrom, tally } = flow;

  const turnPlayer = queue[turn] ? findPlayer(game, queue[turn]) : undefined;
  const turnLabel = t.game.turnOf(turn + 1, queue.length);

  const set = (patch: Partial<Flow>, nextGame?: GameState) =>
    update((s) => ({ game: nextGame ?? s.game, flow: { ...s.flow, ...patch } }));

  const beginStage = (next: Stage, state: GameState) =>
    set({ stage: next, queue: alivePlayers(state).map((p) => p.id), turn: 0, shown: false }, state);

  /** Sıradaki oyuncuya geçer; sıra bittiyse `onDone` çalışır. */
  const advance = (patch: Partial<Flow>, onDone: () => void) => {
    if (turn + 1 < queue.length) set({ ...patch, turn: turn + 1, shown: false });
    else onDone();
  };

  const afterResolution = (next: GameState, nextStage: Stage, extra: Partial<Flow> = {}) =>
    set(
      { stage: nextStage, eventsFrom: game.events.length, submissions: [], votes: {}, ...extra },
      next,
    );

  const toNight = (state: GameState) => (state.winner ? set({ stage: 'end' }, state) : beginStage('night', state));

  // --- Telefon dolaşan aşamalar: önce devir ekranı ---
  // Gizli oylamada devir ekranı yok: oy veren kişi ekranda yazar, oy verince sıradakine geçilir.
  const passesPhone = stage === 'reveal' || stage === 'night' || stage === 'revenge';
  if (passesPhone && turnPlayer && !shown) {
    return (
      <Handoff
        key={`${stage}-${turn}`}
        name={turnPlayer.name}
        index={turn}
        total={queue.length}
        onReveal={() => set({ shown: true })}
      />
    );
  }

  // Rol açılışı ve gece aynı ekran: üstte rol bilgisi, altta yapılacak iş (yoksa açıklama + "Anladım").
  if ((stage === 'night' || stage === 'reveal') && turnPlayer) {
    const atReveal = stage === 'reveal';
    // İlk gece yetenekler kapalıysa rol açılışı bitince oylamasız 1. gün başlar.
    const finish =
      atReveal && !game.settings.firstNightActions
        ? () => set({ stage: 'discussion' }, skipNight(game))
        : (subs: ActionSubmission[]) => afterResolution(resolveNight(game, subs), 'morning');
    return (
      <NightTurn
        key={turnPlayer.id}
        game={game}
        player={turnPlayer}
        turnLabel={turnLabel}
        submissions={submissions}
        atReveal={atReveal}
        onDone={(sub) => {
          const subs = sub ? [...submissions, sub] : submissions;
          advance({ submissions: subs }, () => finish(subs));
        }}
      />
    );
  }

  if (stage === 'morning') {
    return <MorningReport game={game} deaths={deathsSince(game, eventsFrom)} onDone={() => set({ stage: game.winner ? 'end' : 'discussion' })} />;
  }

  if (stage === 'discussion') {
    // İlk gece yetenekler kapalıysa 1. gün sadece tanışma: oylama yok, sonra ilk gerçek gece.
    const voteToday = game.settings.firstNightActions || game.round > 1;
    return (
      <Discussion
        key={game.round}
        game={game}
        voteToday={voteToday}
        onVote={() => beginStage('vote', game)}
        onNight={() => toNight(resolveDayVote(game, {}))}
      />
    );
  }

  if (stage === 'vote' && game.settings.voteMode === 'open') {
    return (
      <OpenVote
        game={game}
        onDone={(counts) => afterResolution(resolveDayVoteCounts(game, counts), 'verdict', { tally: counts })}
      />
    );
  }

  if (stage === 'vote' && turnPlayer) {
    const castVote = (next: Record<PlayerId, PlayerId>) =>
      advance({ votes: next }, () => afterResolution(resolveDayVote(game, next), 'verdict', { tally: countVotes(next) }));
    return (
      <SecretVote
        key={turnPlayer.id}
        game={game}
        voter={turnPlayer}
        subtitle={t.game.secretSub(turn + 1, queue.length)}
        onConfirm={(targetId) => castVote({ ...votes, [turnPlayer.id]: targetId })}
        onPass={() => castVote(votes)}
      />
    );
  }

  if (stage === 'verdict') {
    const pending = game.pendingTriggers[0];
    return (
      <Verdict
        game={game}
        deaths={deathsSince(game, eventsFrom)}
        tally={tally}
        pendingFor={pending ? findPlayer(game, pending.actorId) : undefined}
        onDone={() => (pending ? set({ stage: 'revenge', queue: [pending.actorId], turn: 0, shown: false }) : toNight(game))}
      />
    );
  }

  if (stage === 'revenge' && turnPlayer) {
    const pending = game.pendingTriggers[0];
    return (
      <RevengePick
        game={game}
        avenger={turnPlayer}
        abilityId={pending.abilityId}
        onConfirm={(targetId) => set({ stage: 'avenged', eventsFrom: game.events.length }, resolveTrigger(game, pending, targetId))}
        onPass={() => toNight(skipTrigger(game, pending))}
      />
    );
  }

  if (stage === 'avenged') {
    return <Avenged game={game} deaths={deathsSince(game, eventsFrom)} onDone={() => toNight(game)} />;
  }

  return <GameOver game={game} onLeave={onLeave} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  quit: {
    position: 'absolute',
    right: space[4],
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
