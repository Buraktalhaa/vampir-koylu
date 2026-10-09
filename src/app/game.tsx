import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { Moon, Sun, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { CountdownRing } from '@/components/CountdownRing';
import { Button } from '@/components/Button';
import { PlayerPicker } from '@/components/PlayerPicker';
import { RoleCard } from '@/components/RoleCard';
import { RolePortrait } from '@/components/RolePortrait';
import { Screen } from '@/components/Screen';
import { Stepper } from '@/components/Stepper';
import {
  alivePlayers,
  availableNightAbilities,
  findPlayer,
  getRole,
  getValidTargets,
  needsTarget,
  publicRoleOf,
  resolveDayVote,
  resolveDayVoteCounts,
  resolveNight,
  resolveTrigger,
  skipNight,
  teamOf,
  type Ability,
  type ActionSubmission,
  type GameEvent,
  type GameState,
  type Phase,
  type Player,
  type PlayerId,
  type RoleId,
} from '@/game';
import { useCountdown } from '@/hooks/useCountdown';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import type { Flow, Session, Stage } from '@/store/session';
import { colors, phases, radius, space } from '@/theme/tokens';

const NIGHT_STAGES: Stage[] = ['reveal', 'night', 'morning'];

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
    return (
      <Screen footer={<Button label={t.game.mainMenu} onPress={() => router.replace('/')} />}>{null}</Screen>
    );
  }

  return (
    <View style={styles.root}>
      <GameFlow session={session} update={updateSession} onLeave={() => endSession()} />
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
      style={[styles.quit, { top: insets.top + space[2] }]}
    >
      <X size={20} color={colors.text3} />
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
  const { stage, queue, turn, shown, submissions, votes, eventsFrom, acting } = flow;

  const phase: Phase = NIGHT_STAGES.includes(stage) ? 'night' : 'day';
  const turnPlayer = queue[turn] ? findPlayer(game, queue[turn]) : undefined;

  const set = (patch: Partial<Flow>, nextGame?: GameState) =>
    update((s) => ({ game: nextGame ?? s.game, flow: { ...s.flow, ...patch } }));

  const beginStage = (next: Stage, state: GameState) =>
    set({ stage: next, queue: alivePlayers(state).map((p) => p.id), turn: 0, shown: false, acting: false }, state);

  /** Sıradaki oyuncuya geçer; sıra bittiyse `onDone` çalışır. */
  const advance = (patch: Partial<Flow>, onDone: () => void) => {
    if (turn + 1 < queue.length) set({ ...patch, turn: turn + 1, shown: false, acting: false });
    else onDone();
  };

  const afterResolution = (next: GameState, nextStage: Stage) =>
    set({ stage: next.winner ? 'end' : nextStage, eventsFrom: game.events.length, submissions: [], votes: {}, acting: false }, next);

  /** Gece işlemini toplar; sıra bittiyse geceyi çözer. */
  const submitNight = (sub?: ActionSubmission) => {
    const subs = sub ? [...submissions, sub] : submissions;
    advance({ submissions: subs }, () => afterResolution(resolveNight(game, subs), 'morning'));
  };

  // --- Telefon dolaşan aşamalar: önce devir ekranı ---
  const passesPhone =
    stage === 'reveal' || stage === 'night' || stage === 'revenge' || (stage === 'vote' && game.settings.voteMode === 'secret');
  if (passesPhone && turnPlayer && !shown) {
    return <Handoff name={turnPlayer.name} phase={phase} onReveal={() => set({ shown: true })} />;
  }

  if ((stage === 'night' || (stage === 'reveal' && acting)) && turnPlayer) {
    return <NightTurn key={turnPlayer.id} game={game} player={turnPlayer} submissions={submissions} onDone={submitNight} />;
  }

  if (stage === 'reveal' && turnPlayer) {
    const actsTonight = game.settings.firstNightActions;
    const role = getRole(turnPlayer.roleId);
    const mates = role.knowsTeammates
      ? game.players.filter((p) => p.id !== turnPlayer.id && teamOf(p) === role.team)
      : [];
    // İlk gece yetenekler kapalıysa: herkes rolünü gördükten sonra 1. gün (oylamasız) başlar.
    const finishRevealOnly = () => set({ stage: 'discussion' }, skipNight(game));
    return (
      <Screen
        phase={phase}
        footer={
          <Button
            label={actsTonight ? t.game.continue : t.game.hideAndPass}
            phase={phase}
            onPress={() => (actsTonight ? set({ acting: true }) : advance({}, finishRevealOnly))}
          />
        }
      >
        <AppText variant="h2">{turnPlayer.name}</AppText>
        <RoleCard roleId={turnPlayer.roleId as RoleId} size="large" />
        {mates.length ? (
          <>
            <AppText variant="caption" color={colors.text3}>
              {t.game.teammates}
            </AppText>
            <PlayerPicker items={mates.map((player) => ({ player, badge: teammateBadge(player) }))} phase={phase} />
          </>
        ) : null}
      </Screen>
    );
  }

  if (stage === 'morning' || stage === 'verdict') {
    const deaths = game.events.slice(eventsFrom).filter((e) => e.type === 'death');
    const isMorning = stage === 'morning';
    const pending = game.pendingTriggers[0];
    return (
      <Screen
        phase="day"
        title={isMorning ? t.game.day(game.round) : t.game.verdict}
        footer={
          <Button
            label={t.game.continue}
            phase="day"
            onPress={() => {
              if (pending) set({ stage: 'revenge', queue: [pending.actorId], turn: 0, shown: false });
              else if (isMorning) set({ stage: 'discussion' });
              else beginStage('night', game);
            }}
          />
        }
      >
        <View style={styles.center}>
          <Sun size={48} color={phases.day.accent} />
        </View>
        {deaths.length === 0 ? (
          <AppText variant="h2" style={styles.centerText}>
            {isMorning ? t.game.nobodyDied : t.game.nobodyHanged}
          </AppText>
        ) : (
          deaths.map((d) => {
            const player = findPlayer(game, d.playerId);
            const roleId = publicRoleOf(game, player) as RoleId | null;
            return (
              <View key={d.playerId} style={styles.deathCard}>
                <AppText variant="display" style={styles.centerText}>
                  {d.cause === 'lynch' ? t.game.hanged(player.name) : t.game.died(player.name)}
                </AppText>
                {roleId ? <RoleCard roleId={roleId} /> : null}
              </View>
            );
          })
        )}
      </Screen>
    );
  }

  if (stage === 'discussion') {
    // İlk gece yetenekler kapalıysa 1. gün sadece duraklama: oylama yok, sonra ilk gerçek gece.
    const voteToday = game.settings.firstNightActions || game.round > 1;
    const toNight = () => beginStage('night', resolveDayVote(game, {}));
    return (
      <Discussion
        key={game.round}
        game={game}
        voteToday={voteToday}
        onDone={voteToday ? () => beginStage('vote', game) : toNight}
        onSkipVote={toNight}
      />
    );
  }

  if (stage === 'vote' && game.settings.voteMode === 'open') {
    return <OpenVote game={game} onDone={(counts) => afterResolution(resolveDayVoteCounts(game, counts), 'verdict')} />;
  }

  if (stage === 'vote' && turnPlayer) {
    const castVote = (next: Record<PlayerId, PlayerId>) =>
      advance({ votes: next }, () => afterResolution(resolveDayVote(game, next), 'verdict'));
    return (
      <PickTarget
        key={turnPlayer.id}
        phase="day"
        title={turnPlayer.name}
        prompt={t.game.vote}
        items={alivePlayers(game)
          .filter((p) => p.id !== turnPlayer.id)
          .map((p) =>
            isKnownTeammate(turnPlayer, p)
              ? { player: p, disabledReason: t.game.teammate, badge: teammateBadge(p) }
              : { player: p },
          )}
        onConfirm={(targetId) => castVote({ ...votes, [turnPlayer.id]: targetId })}
        skipLabel={t.game.abstain}
        onSkip={() => castVote(votes)}
      />
    );
  }

  if (stage === 'revenge' && turnPlayer) {
    const pending = game.pendingTriggers[0];
    const roleText = t.roles[turnPlayer.roleId as RoleId];
    return (
      <PickTarget
        phase="day"
        title={roleText.abilities?.[pending.abilityId]?.name ?? ''}
        prompt={roleText.abilities?.[pending.abilityId]?.prompt ?? ''}
        items={alivePlayers(game).map((player) => ({ player }))}
        onConfirm={(targetId) => {
          const next = resolveTrigger(game, pending, targetId);
          set({ stage: next.winner ? 'end' : 'verdict' }, next);
        }}
      />
    );
  }

  return <GameOver game={game} onLeave={onLeave} />;
}

/** Oyun sonu: kazanan, herkesin rolü ve tur tur olay özeti. */
function GameOver({ game, onLeave }: { game: GameState; onLeave: () => void }) {
  const { t } = useLanguage();
  const winner = game.winner ?? 'village';
  const leave = (to: '/new-game' | '/') => {
    onLeave();
    router.replace(to);
  };
  return (
    <Screen
      phase="day"
      footer={
        <>
          <Button label={t.game.newGame} phase="day" onPress={() => leave('/new-game')} />
          <Button label={t.game.mainMenu} variant="secondary" onPress={() => leave('/')} />
        </>
      }
    >
      <AppText variant="display" style={styles.centerText}>
        {t.game.wins(t.teams[winner].name)}
      </AppText>
      {game.players.map((p) => (
        <View key={p.id} style={styles.endRow}>
          <AppText variant="button" color={p.alive ? colors.text1 : colors.text3} style={styles.endName}>
            {p.alive ? p.name : `${p.name} · ${t.game.dead}`}
          </AppText>
          <RoleCard roleId={p.roleId as RoleId} />
        </View>
      ))}
      <AppText variant="h2">{t.game.timeline}</AppText>
      <Timeline game={game} />
    </Screen>
  );
}

/** Olayları tur ve faza göre gruplar: "1. Gece", "1. Gün", ... */
function Timeline({ game }: { game: GameState }) {
  const { t } = useLanguage();
  const name = (id?: PlayerId) => (id ? findPlayer(game, id).name : '');
  const roleName = (id: PlayerId) => t.roles[findPlayer(game, id).roleId as RoleId].name;

  const lines = (e: GameEvent): string | null => {
    switch (e.type) {
      case 'ability': {
        const roleId = findPlayer(game, e.actorId).roleId as RoleId;
        const ability = t.roles[roleId].abilities?.[e.abilityId]?.name ?? e.abilityId;
        return t.game.usedAbility(`${name(e.actorId)} (${roleName(e.actorId)})`, ability, e.targetId ? name(e.targetId) : undefined);
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
    const text = lines(e);
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
          {g.items.map((line, i) => (
            <AppText key={i} variant="small" color={colors.text2}>
              • {line}
            </AppText>
          ))}
        </View>
      ))}
    </View>
  );
}

/** Takımını tanıyan oyuncu (ör. vampir) için: arkadaşı mı? */
function isKnownTeammate(viewer: Player, other: Player): boolean {
  return other.id !== viewer.id && getRole(viewer.roleId).knowsTeammates === true && teamOf(other) === teamOf(viewer);
}

/** Takım arkadaşının yanında gösterilen rol rozeti. */
function teammateBadge(other: Player) {
  return <RolePortrait roleId={other.roleId as RoleId} size={28} />;
}

/** Gündüz tartışması: geri sayım, süre ekleme ve erken bitirme. Süre dolunca oylamaya geçer. */
type DiscussionProps = {
  game: GameState;
  /** false: oylamasız gün — süre bitince doğrudan geceye geçilir. */
  voteToday: boolean;
  onDone: () => void;
  onSkipVote: () => void;
};

function Discussion({ game, voteToday, onDone, onSkipVote }: DiscussionProps) {
  const { t } = useLanguage();
  const { remaining, total, addSeconds } = useCountdown(game.settings.discussionSeconds, () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    onDone();
  });

  return (
    <Screen
      phase="day"
      title={t.game.day(game.round)}
      footer={
        <>
          <View style={styles.buttonRow}>
            <View style={styles.flex}>
              <Button label={t.game.addTime} variant="secondary" onPress={() => addSeconds(60)} />
            </View>
            {voteToday ? (
              <View style={styles.flex}>
                <Button label={t.game.skipVote} variant="secondary" onPress={onSkipVote} />
              </View>
            ) : null}
          </View>
          <Button label={voteToday ? t.game.toVote : t.game.toNight} phase="day" onPress={onDone} />
        </>
      }
    >
      <AppText color={colors.text2}>{t.game.discuss}</AppText>
      <CountdownRing remaining={remaining} total={total} color={phases.day.accent} />
      <AppText variant="caption" color={colors.text3} style={styles.centerText}>
        {t.game.timeLeft}
      </AppText>
      <PlayerPicker items={game.players.map((player) => ({ player }))} phase="day" />
    </Screen>
  );
}

/** Devir ekranı: rol bağımsız, tamamen nötr. Dokununca açılır. */
function Handoff({ name, phase, onReveal }: { name: string; phase: Phase; onReveal: () => void }) {
  const { t } = useLanguage();
  return (
    <View style={styles.handoff}>
      {phase === 'night' ? <Moon size={40} color={phases.night.accent} /> : <Sun size={40} color={phases.day.accent} />}
      <AppText variant="caption" color={colors.text3}>
        {t.game.next}
      </AppText>
      <AppText variant="display" style={styles.centerText}>
        {name}
      </AppText>
      <Pressable
        accessibilityRole="button"
        onPress={onReveal}
        style={({ pressed }) => [styles.holdBtn, pressed && { borderColor: phases[phase].accent, backgroundColor: phases[phase].selectBg }]}
      >
        <AppText variant="button">{t.game.tapToReveal}</AppText>
      </Pressable>
    </View>
  );
}

type PickTargetProps = {
  phase: Phase;
  title: string;
  prompt: string;
  items: React.ComponentProps<typeof PlayerPicker>['items'];
  onConfirm: (id: PlayerId) => void;
  onSkip?: () => void;
  skipLabel?: string;
  header?: React.ReactNode;
};

function PickTarget({ phase, title, prompt, items, onConfirm, onSkip, skipLabel, header }: PickTargetProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<PlayerId>();
  return (
    <Screen
      phase={phase}
      title={header ? undefined : title}
      footer={
        <>
          <Button label={t.game.confirm} phase={phase} disabled={!selected} onPress={() => selected && onConfirm(selected)} />
          {onSkip ? <Button label={skipLabel ?? t.game.skip} variant="secondary" onPress={onSkip} /> : null}
        </>
      }
    >
      {header}
      <AppText variant="h2">{prompt}</AppText>
      <PlayerPicker items={items} selectedId={selected} onSelect={setSelected} phase={phase} />
    </Screen>
  );
}

/** Gece ekranının üstündeki küçük rol satırı; oyuncu listesini aşağı itmez. */
function RoleLine({ roleId }: { roleId: RoleId }) {
  const { t } = useLanguage();
  return (
    <View style={styles.roleLine}>
      <RolePortrait roleId={roleId} size={40} />
      <AppText variant="h3">{t.roles[roleId].name}</AppText>
    </View>
  );
}

/** Gece sırası: oyuncunun yeteneğine göre bekleme, yetenek seçimi ya da hedef seçimi. */
type NightTurnProps = {
  game: GameState;
  player: Player;
  /** Bu gece şimdiye kadar verilen seçimler (takım oyunda arkadaşların seçimini göstermek için). */
  submissions: ActionSubmission[];
  onDone: (sub?: ActionSubmission) => void;
};

function NightTurn({ game, player, submissions, onDone }: NightTurnProps) {
  const { t } = useLanguage();
  const abilities = availableNightAbilities(game, player);
  const [chosen, setChosen] = useState<Ability | undefined>(abilities.length === 1 ? abilities[0] : undefined);
  const roleId = player.roleId as RoleId;
  const texts = t.roles[roleId].abilities ?? {};
  const allAbilities = getRole(roleId).abilities.filter((a) => a.trigger === 'night');

  if (abilities.length === 0) {
    return (
      <Screen phase="night" title={t.game.night(game.round)} footer={<Button label={t.game.continue} phase="night" onPress={() => onDone()} />}>
        <View style={styles.center}>
          <Moon size={56} color={phases.night.accent} />
        </View>
        <AppText variant="h3" style={styles.centerText}>
          {t.game.sleeping}
        </AppText>
      </Screen>
    );
  }

  // Birden fazla yetenek (ör. Büyücü): önce hangisini kullanacağını seçer.
  if (!chosen) {
    return (
      <Screen
        phase="night"
        title={t.roles[roleId].name}
        footer={<Button label={t.game.skip} variant="secondary" onPress={() => onDone()} />}
      >
        {allAbilities.map((a) => {
          const usable = abilities.includes(a);
          const left = player.abilityState[a.id]?.usesLeft;
          return (
            <Pressable
              key={a.id}
              accessibilityRole="button"
              disabled={!usable}
              onPress={() => (needsTarget(a) ? setChosen(a) : onDone({ actorId: player.id, abilityId: a.id }))}
              style={[styles.abilityCard, !usable && styles.used]}
            >
              <AppText variant="h2">{texts[a.id]?.name ?? a.id}</AppText>
              {texts[a.id]?.prompt ? <AppText color={colors.text2}>{texts[a.id]?.prompt}</AppText> : null}
              {left !== undefined ? (
                <AppText variant="caption" color={usable ? phases.night.accent : colors.text3}>
                  {t.game.usesLeft(left)}
                </AppText>
              ) : null}
            </Pressable>
          );
        })}
      </Screen>
    );
  }

  const valid = new Set(getValidTargets(game, player, chosen).map((p) => p.id));
  const items = alivePlayers(game).map((p) => {
    const teammate = isKnownTeammate(player, p);
    let disabledReason: string | undefined;
    if (!valid.has(p.id)) {
      disabledReason = teammate
        ? t.game.teammate
        : p.id === player.abilityState[chosen.id]?.lastTarget
          ? t.game.protectedLastNight
          : '—';
    }
    // Takım oyunda (vampirler) arkadaşların bu geceki seçimi hedefin altında görünür.
    const allyPicks = chosen.teamVote
      ? submissions
          .filter((s) => s.abilityId === chosen.id && s.targetId === p.id && isKnownTeammate(player, findPlayer(game, s.actorId)))
          .map((s) => findPlayer(game, s.actorId).name)
      : [];
    return {
      player: p,
      disabledReason,
      badge: teammate ? teammateBadge(p) : undefined,
      trailing: allyPicks.length ? (
        <AppText variant="caption" color={colors.team.vampire.fg} style={styles.centerText}>
          {t.game.pickedBy(allyPicks.join(', '))}
        </AppText>
      ) : undefined,
    };
  });

  return (
    <PickTarget
      phase="night"
      title={t.game.night(game.round)}
      prompt={texts[chosen.id]?.prompt ?? ''}
      header={<RoleLine roleId={roleId} />}
      items={items}
      onConfirm={(targetId) => onDone({ actorId: player.id, abilityId: chosen.id, targetId })}
      onSkip={() => (abilities.length > 1 ? setChosen(undefined) : onDone())}
    />
  );
}

/** Açık oylama: telefon ortada, her oyuncunun aldığı oy sayısı girilir. */
function OpenVote({ game, onDone }: { game: GameState; onDone: (counts: Record<PlayerId, number>) => void }) {
  const { t } = useLanguage();
  const [counts, setCounts] = useState<Record<PlayerId, number>>({});
  const set = (id: PlayerId, delta: number) => setCounts((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + delta) }));
  return (
    <Screen
      phase="day"
      title={t.game.day(game.round)}
      footer={<Button label={t.game.finishVote} phase="day" onPress={() => onDone(counts)} />}
    >
      <AppText variant="h3">{t.game.vote}</AppText>
      <PlayerPicker
        phase="day"
        columns={2}
        items={alivePlayers(game).map((player) => ({
          player,
          trailing: (
            <Stepper
              value={String(counts[player.id] ?? 0)}
              onMinus={() => set(player.id, -1)}
              onPlus={() => set(player.id, 1)}
              minusDisabled={!counts[player.id]}
            />
          ),
        }))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  quit: {
    position: 'absolute',
    right: space[4],
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: { gap: space[4] },
  timelineGroup: { gap: space[1] },
  center: { alignItems: 'center', paddingVertical: space[6] },
  centerText: { textAlign: 'center' },
  handoff: {
    flex: 1,
    backgroundColor: colors.bgHandoff,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[4],
    padding: space[6],
  },
  holdBtn: {
    marginTop: space[8],
    minHeight: 72,
    alignSelf: 'stretch',
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deathCard: {
    gap: space[4],
    padding: space[5],
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.danger.fill,
    backgroundColor: colors.surface1,
  },
  abilityCard: {
    gap: space[2],
    padding: space[5],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface1,
  },
  used: { opacity: 0.4, borderStyle: 'dashed' },
  roleLine: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  buttonRow: { flexDirection: 'row', gap: space[2] },
  flex: { flex: 1 },
  endRow: { gap: space[2] },
  endName: { marginLeft: space[1] },
});
