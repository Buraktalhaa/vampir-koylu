import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import {
  Check,
  ChevronRight,
  Eye,
  Flame,
  Info,
  Moon,
  Plus,
  Shield,
  Skull,
  SkipForward,
  Smartphone,
  Sun,
  Timer,
  Vote,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Alert, BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CountdownRing } from '@/components/CountdownRing';
import { DeathCard } from '@/components/game/DeathCard';
import { PhaseHeader } from '@/components/game/PhaseHeader';
import { RolePill } from '@/components/game/RolePill';
import { NightScene } from '@/components/game/NightScene';
import { BatIcon } from '@/components/icons/BatIcon';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { PlayerPicker, type PickerItem } from '@/components/PlayerPicker';
import { RolePortrait } from '@/components/RolePortrait';
import { Screen } from '@/components/Screen';
import { Stepper } from '@/components/Stepper';
import { TeamBadge } from '@/components/TeamBadge';
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
  skipTrigger,
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

/** Yeteneği olmayan oyuncunun gece ekranında bekleme süresi; kimin ne kadar düşündüğü belli olmasın. */
const SLEEP_SECONDS = 8;
/** Tartışma süresi bitince oylamaya geçmeden önceki kısa geri sayım. */
const AUTO_VOTE_SECONDS = 3;

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

// ---------------------------------------------------------------------------
// Yardımcılar

type DeathEvent = Extract<GameEvent, { type: 'death' }>;

function deathsSince(game: GameState, from: number): DeathEvent[] {
  return game.events.slice(from).filter((e): e is DeathEvent => e.type === 'death');
}

function countVotes(votes: Record<PlayerId, PlayerId>): Record<PlayerId, number> {
  const tally: Record<PlayerId, number> = {};
  for (const target of Object.values(votes)) tally[target] = (tally[target] ?? 0) + 1;
  return tally;
}

/** Takımını tanıyan oyuncu (ör. vampir) için: arkadaşı mı? */
function isKnownTeammate(viewer: Player, other: Player): boolean {
  return other.id !== viewer.id && getRole(viewer.roleId).knowsTeammates === true && teamOf(other) === teamOf(viewer);
}

/** Takım arkadaşı işareti. Nötr renkte: masadan bakan biri renginden takımı çıkaramasın. */
const teammateBadge = <BatIcon size={18} color={colors.text2} strokeWidth={2} />;

/** Footer: [ikincil] [birincil] yan yana, birincil iki kat geniş. */
function ActionBar({ secondary, primary }: { secondary?: ReactNode; primary: ReactNode }) {
  return (
    <View style={styles.actionBar}>
      {secondary ? <View style={styles.flex1}>{secondary}</View> : null}
      <View style={styles.flex2}>{primary}</View>
    </View>
  );
}

type Tone = 'info' | 'warning' | 'success';

function InfoBand({ icon: Icon, text, tone = 'info' }: { icon: LucideIcon; text: string; tone?: Tone }) {
  const palette = { info: colors.info, warning: colors.warning, success: colors.success }[tone];
  return (
    <View style={[styles.band, { backgroundColor: palette.bg, borderColor: palette.fg }]}>
      <Icon size={16} color={palette.fg} />
      <AppText variant="small" color={palette.fg} style={styles.flex1}>
        {text}
      </AppText>
    </View>
  );
}

/** Sonuç ekranlarının butonu: oyun bittiyse "Sonucu gör", değilse "Geceye geç". */
function NightOrResult({ game, onPress }: { game: GameState; onPress: () => void }) {
  const { t } = useLanguage();
  return game.winner ? (
    <Button label={t.game.seeResult} phase="day" trailingIcon={ChevronRight} onPress={onPress} />
  ) : (
    <Button label={t.game.toNight} phase="day" icon={Moon} onPress={onPress} />
  );
}

// ---------------------------------------------------------------------------
// Ekranlar

/**
 * Devir ekranı: rolden ve fazdan bağımsız. Arkada rastgele bir gece manzarası;
 * isim ve dokunma alanı ekranın ortasında. Tek dokunuşla açılır.
 */
function Handoff({ name, index, total, onReveal }: { name: string; index: number; total: number; onReveal: () => void }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.handoff}>
      <NightScene style={StyleSheet.absoluteFill} />
      <View style={styles.handoffShade} pointerEvents="none" />
      <View style={[styles.handoffTop, { paddingTop: insets.top + space[4] }]}>
        <AppText variant="caption" color={colors.text2}>
          {t.game.turnOf(index + 1, total).toLocaleUpperCase('tr')}
        </AppText>
        <View style={styles.dots}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={[styles.dot, i <= index && styles.dotOn]} />
          ))}
        </View>
      </View>
      <View style={styles.handoffMid}>
        <AppText color={colors.text2}>{t.game.giveTo}</AppText>
        <PlayerAvatar name={name} size={84} />
        <AppText variant="display" style={[styles.center, styles.handoffName]} numberOfLines={2}>
          {name.toLocaleUpperCase('tr')}
        </AppText>
        <AppText variant="small" color={colors.text2}>
          {t.game.dontLook}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={onReveal}
          style={({ pressed }) => [styles.tapArea, pressed && styles.tapAreaPressed]}
        >
          <Eye size={24} color={colors.text1} />
          <AppText variant="button" style={styles.center}>
            {t.game.tapToRevealName(name)}
          </AppText>
        </Pressable>
      </View>
      <View style={{ height: insets.bottom + space[10] }} />
    </View>
  );
}

type NightTurnProps = {
  game: GameState;
  player: Player;
  turnLabel: string;
  /** Bu gece şimdiye kadar verilen seçimler (takım oyunda arkadaşların seçimini göstermek için). */
  submissions: ActionSubmission[];
  /** Rol açılışı turu: yeteneksiz oyuncu beklemeden "Anladım" ile geçer. */
  atReveal?: boolean;
  onDone: (sub?: ActionSubmission) => void;
};

/** Gece sırası: üstte rol bilgisi; altta hedef seçimi, büyü seçimi ya da (yetenek yoksa) açıklama. */
function NightTurn({ game, player, turnLabel, submissions, atReveal, onDone }: NightTurnProps) {
  const { t } = useLanguage();
  const abilities = availableNightAbilities(game, player);
  const [chosen, setChosen] = useState<Ability | undefined>(abilities.length === 1 ? abilities[0] : undefined);
  const roleId = player.roleId as RoleId;
  const texts = t.roles[roleId].abilities ?? {};
  const header = <PhaseHeader icon={Moon} phase="night" title={t.game.night(game.round)} subtitle={turnLabel} />;

  const summary = <RoleSummary game={game} player={player} />;
  if (abilities.length === 0) {
    const role = getRole(roleId);
    const hasNightAbility = role.abilities.some((a) => a.trigger === 'night');
    // Yetenekli rol ilk gece (ayar kapalı) beklerse bunu söyle; değilse rolün kendi metni, yoksa genel metin.
    const text =
      atReveal && hasNightAbility ? t.game.firstNightIdle : (t.roles[roleId].idle ?? t.roles[roleId].description);
    return <Idle header={header} summary={summary} text={text} wait={!atReveal} onDone={() => onDone()} />;
  }

  if (!chosen) {
    return (
      <SpellChoice
        header={header}
        summary={summary}
        player={player}
        available={abilities}
        onSkip={() => onDone()}
        onChoose={(a) => (needsTarget(a) ? setChosen(a) : onDone({ actorId: player.id, abilityId: a.id }))}
      />
    );
  }

  const valid = new Set(getValidTargets(game, player, chosen).map((p) => p.id));
  const items: PickerItem[] = alivePlayers(game).map((p) => {
    const teammate = isKnownTeammate(player, p);
    // Takım oyunda (vampirler) arkadaşların bu geceki seçimi hedefin üstünde görünür.
    const allyPicks = chosen.teamVote
      ? submissions
          .filter((s) => s.abilityId === chosen.id && s.targetId === p.id && isKnownTeammate(player, findPlayer(game, s.actorId)))
          .map((s) => findPlayer(game, s.actorId).name)
      : [];
    let disabledReason: string | undefined;
    if (!valid.has(p.id)) {
      disabledReason = teammate
        ? t.game.teammate
        : p.id === player.abilityState[chosen.id]?.lastTarget
          ? t.game.protectedLastNight
          : '—';
    }
    return {
      player: p,
      disabledReason,
      badge: teammate ? teammateBadge : undefined,
      count: allyPicks.length || undefined,
      note: allyPicks.length ? t.game.pickedBy(allyPicks.join(', ')) : p.id === player.id ? t.game.self : undefined,
    };
  });

  const abilityName = texts[chosen.id]?.name;
  return (
    <TargetPicker
      phase="night"
      header={header}
      pill={<RoleSummary game={game} player={player} abilityName={abilities.length > 1 ? abilityName : undefined} />}
      question={texts[chosen.id]?.prompt ?? ''}
      hint={texts[chosen.id]?.description}
      items={items}
      onConfirm={(targetId) => onDone({ actorId: player.id, abilityId: chosen.id, targetId })}
      onPass={chosen.required ? undefined : () => (abilities.length > 1 ? setChosen(undefined) : onDone())}
    />
  );
}

/**
 * Gece ekranının üstündeki rol özeti: madalyon, rol adı (+ seçilen yetenek), takım, açıklama
 * ve takımını tanıyan rollerde arkadaşlar. Rolünü ve yapacağını aynı ekranda görürsün; ızgarayı aşağı itmeyecek kadar kısa.
 */
function RoleSummary({ game, player, abilityName }: { game: GameState; player: Player; abilityName?: string }) {
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

type TargetPickerProps = {
  phase: Phase;
  header: ReactNode;
  pill?: ReactNode;
  question: string;
  hint?: string;
  items: PickerItem[];
  onConfirm: (id: PlayerId) => void;
  /** Verilmezse pas geçilemez (zorunlu seçim). */
  onPass?: () => void;
};

/** Ortak hedef şablonu: gece yetenekleri, gizli oy ve intikam. Önce kutucuk seçilir, sonra onaylanır. */
function TargetPicker({ phase, header, pill, question, hint, items, onConfirm, onPass }: TargetPickerProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<PlayerId>();
  const selectedName = items.find((i) => i.player.id === selected)?.player.name;
  return (
    <Screen
      phase={phase}
      footer={
        <ActionBar
          secondary={onPass ? <Button label={t.game.pass} variant="secondary" onPress={onPass} /> : undefined}
          primary={
            <Button
              label={selectedName ? t.game.confirmWith(selectedName) : t.game.confirm}
              phase={phase}
              disabled={!selected}
              onPress={() => selected && onConfirm(selected)}
            />
          }
        />
      }
    >
      {header}
      {pill}
      <AppText variant="h2">{question}</AppText>
      {hint ? (
        <AppText variant="small" color={colors.text2}>
          {hint}
        </AppText>
      ) : null}
      <PlayerPicker items={items} selectedId={selected} onSelect={setSelected} phase={phase} />
    </Screen>
  );
}

type IdleProps = { header: ReactNode; summary: ReactNode; text: string; wait: boolean; onDone: () => void };

/**
 * Bu gece yapacak bir şeyi olmayan oyuncu. Gecelerde kısa bir bekleme var (kimin ne kadar düşündüğü belli olmasın);
 * rol açılışında beklemeden geçilir.
 */
function Idle({ header, summary, text, wait, onDone }: IdleProps) {
  const { t } = useLanguage();
  const { remaining } = useCountdown(wait ? SLEEP_SECONDS : 0, () => {});
  // Herkes ekrana bir şey bassın diye basit bir soru; cevap kaydedilmez.
  const [quiz] = useState(() => t.quiz[Math.floor(Math.random() * t.quiz.length)]);
  const [answer, setAnswer] = useState<'a' | 'b'>();
  const waiting = wait && remaining > 0;
  const accent = phases.night.accent;
  return (
    <Screen
      phase="night"
      footer={
        <Button
          label={waiting ? t.game.continueIn(remaining) : wait ? t.game.continue : t.game.gotIt}
          icon={wait ? undefined : Eye}
          disabled={waiting || !answer}
          onPress={onDone}
        />
      }
    >
      {header}
      {summary}
      {wait ? <AppText variant="h2">{t.game.sleepTitle}</AppText> : null}
      <View style={styles.idleBox}>
        <AppText variant="small" color={colors.text1}>
          {text}
        </AppText>
      </View>
      <View style={styles.quiz}>
        <AppText variant="h3">{quiz.q}</AppText>
        <View style={styles.actionBar}>
          {(['a', 'b'] as const).map((key) => {
            const selected = answer === key;
            return (
              <Pressable
                key={key}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setAnswer(key)}
                style={[styles.quizOption, selected && { borderColor: accent, borderWidth: 2, backgroundColor: phases.night.selectBg }]}
              >
                <AppText variant="button" style={styles.center}>
                  {quiz[key]}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
      {wait ? <NightScene style={styles.idleScene} /> : null}
    </Screen>
  );
}

type SpellChoiceProps = {
  header: ReactNode;
  summary: ReactNode;
  player: Player;
  available: Ability[];
  onSkip: () => void;
  onChoose: (a: Ability) => void;
};

/** Birden fazla gece yeteneği olan rol (ör. Büyücü): önce hangisini kullanacağını seçer. */
function SpellChoice({ header, summary, player, available, onSkip, onChoose }: SpellChoiceProps) {
  const { t } = useLanguage();
  const roleId = player.roleId as RoleId;
  const texts = t.roles[roleId].abilities ?? {};
  const all = getRole(roleId).abilities.filter((a) => a.trigger === 'night');
  const [picked, setPicked] = useState<Ability>();
  const accent = phases.night.accent;
  const primaryLabel = !picked ? t.game.choose : needsTarget(picked) ? t.game.chooseTarget : t.game.useShield;

  return (
    <Screen
      phase="night"
      footer={
        <ActionBar
          secondary={<Button label={t.game.pass} variant="secondary" onPress={onSkip} />}
          primary={
            <Button
              label={primaryLabel}
              disabled={!picked}
              trailingIcon={picked && needsTarget(picked) ? ChevronRight : undefined}
              onPress={() => picked && onChoose(picked)}
            />
          }
        />
      }
    >
      {header}
      {summary}
      <AppText variant="h2">{t.game.spellQuestion}</AppText>
      <AppText variant="small" color={colors.text2}>
        {t.game.spellHint}
      </AppText>
      <View style={styles.spells}>
        {all.map((a) => {
          const usable = available.includes(a);
          const state = player.abilityState[a.id];
          const selected = picked === a;
          const kill = a.effect === 'kill';
          const fg = kill ? colors.danger.fg : colors.info.fg;
          return (
            <Pressable
              key={a.id}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: !usable }}
              disabled={!usable}
              onPress={() => setPicked(a)}
              style={[
                styles.spell,
                selected && { borderColor: accent, borderWidth: 2, backgroundColor: phases.night.selectBg },
                !usable && styles.spellUsed,
              ]}
            >
              <View style={[styles.spellIcon, { backgroundColor: kill ? colors.team.vampire.bg : colors.info.bg }]}>
                {kill ? <Skull size={18} color={fg} /> : <Shield size={18} color={fg} />}
              </View>
              <AppText variant="h3">{texts[a.id]?.name ?? a.id}</AppText>
              <AppText variant="small" color={colors.text2} style={styles.flex1}>
                {texts[a.id]?.description}
              </AppText>
              <View style={styles.chips}>
                {a.uses !== undefined ? (
                  <View style={styles.chip}>
                    <AppText variant="caption">{t.game.usesOf(state?.usesLeft ?? 0, a.uses)}</AppText>
                  </View>
                ) : null}
                <View style={[styles.chip, { borderColor: fg }]}>
                  <AppText variant="caption" color={fg}>
                    {t.abilityTags.effects[a.effect]}
                  </AppText>
                </View>
              </View>
              {selected ? (
                <View style={[styles.spellCheck, { backgroundColor: accent }]}>
                  <Check size={13} color={colors.textInverse} strokeWidth={3} />
                </View>
              ) : null}
              {!usable && state?.lastUsedRound ? (
                <View style={styles.stamp} pointerEvents="none">
                  <AppText variant="caption" color={colors.danger.fg}>
                    {t.game.usedStamp(state.lastUsedRound).toLocaleUpperCase('tr')}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function MorningReport({ game, deaths, onDone }: { game: GameState; deaths: DeathEvent[]; onDone: () => void }) {
  const { t } = useLanguage();
  const alive = alivePlayers(game).length;
  return (
    <Screen phase="day" footer={<Button label={game.winner ? t.game.seeResult : t.game.toDiscussion} phase="day" trailingIcon={ChevronRight} onPress={onDone} />}>
      <PhaseHeader icon={Sun} phase="day" title={t.game.day(game.round)} subtitle={t.game.morningSub} />
      {deaths.length === 0 ? (
        <View style={styles.nobody}>
          <View style={styles.sunOrb} />
          <AppText variant="h1" style={styles.center}>
            {t.game.nobodyDiedTitle}
          </AppText>
          <AppText color={colors.text2} style={styles.center}>
            {t.game.nobodyDiedText}
          </AppText>
        </View>
      ) : (
        <>
          <AppText variant="h1" style={styles.center}>
            {t.game.diedCount(deaths.length)}
          </AppText>
          <View style={[styles.deaths, deaths.length > 1 && styles.deathsRow]}>
            {deaths.map((d) => {
              const player = findPlayer(game, d.playerId);
              return (
                <DeathCard
                  key={d.playerId}
                  name={player.name}
                  roleId={publicRoleOf(game, player) as RoleId | null}
                  compact={deaths.length > 1}
                />
              );
            })}
          </View>
          {!game.settings.revealRoleOnDeath ? <InfoBand icon={Info} tone="warning" text={t.game.rolesAtEnd} /> : null}
          {deaths.length === 1 ? (
            <AppText variant="small" color={colors.text2} style={styles.center}>
              {t.game.leftGame(findPlayer(game, deaths[0].playerId).name, alive)}
            </AppText>
          ) : null}
        </>
      )}
    </Screen>
  );
}

type DiscussionProps = {
  game: GameState;
  /** false: oylamasız gün (1. gün tanışma) — süre bitince doğrudan geceye geçilir. */
  voteToday: boolean;
  onVote: () => void;
  onNight: () => void;
};

function Discussion({ game, voteToday, onVote, onNight }: DiscussionProps) {
  const { t } = useLanguage();
  const [timeUp, setTimeUp] = useState(false);
  const { remaining, total, addSeconds } = useCountdown(game.settings.discussionSeconds, () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
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

  let footer: ReactNode;
  if (!voteToday) {
    footer = (
      <ActionBar
        secondary={<Button label={t.game.addTime} variant="secondary" icon={Plus} onPress={() => addSeconds(60)} />}
        primary={<Button label={t.game.toNight} phase="day" icon={Moon} onPress={onNight} />}
      />
    );
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
        <Button label={t.game.startNow} phase="day" icon={Vote} onPress={onVote} />
      </>
    );
  } else {
    footer = (
      <>
        <View style={styles.actionBar}>
          <View style={styles.flex1}>
            <Button label={t.game.addTime} variant="secondary" icon={Plus} onPress={() => addSeconds(60)} />
          </View>
          <View style={styles.flex1}>
            <Button label={t.game.skipVote} variant="secondary" icon={SkipForward} onPress={confirmSkip} />
          </View>
        </View>
        <Button label={t.game.toVote} phase="day" icon={Vote} onPress={onVote} />
      </>
    );
  }

  return (
    <Screen phase="day" footer={footer}>
      <PhaseHeader icon={Sun} phase="day" title={t.game.day(game.round)} subtitle={voteToday ? t.game.discussSub(alive) : t.game.introSub} />
      <CountdownRing remaining={remaining} total={total} label={remaining > 0 ? t.game.remaining : t.game.timeUp} />
      {!voteToday ? <InfoBand icon={Info} text={t.game.introInfo} /> : null}
      <View style={styles.sectionHead}>
        <AppText variant="caption" color={colors.text3}>
          {t.game.playersLabel.toLocaleUpperCase('tr')}
        </AppText>
        <AppText variant="small" color={colors.text3}>
          {t.game.aliveDead(alive, dead)}
        </AppText>
      </View>
      <PlayerPicker items={game.players.map((player) => ({ player }))} phase="day" columns={4} />
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

type SecretVoteProps = {
  game: GameState;
  voter: Player;
  subtitle: string;
  onConfirm: (id: PlayerId) => void;
  onPass: () => void;
};

function SecretVote({ game, voter, subtitle, onConfirm, onPass }: SecretVoteProps) {
  const { t } = useLanguage();
  const items: PickerItem[] = alivePlayers(game)
    .filter((p) => p.id !== voter.id)
    .map((p) => (isKnownTeammate(voter, p) ? { player: p, disabledReason: t.game.teammate, badge: teammateBadge } : { player: p }));
  return (
    <TargetPicker
      phase="day"
      header={<PhaseHeader icon={Vote} phase="day" title={t.game.day(game.round)} subtitle={subtitle} />}
      pill={
        <View style={styles.voterPill}>
          <PlayerAvatar name={voter.name} size={28} />
          <AppText variant="button">{t.game.voter(voter.name)}</AppText>
        </View>
      }
      question={t.game.vote}
      items={items}
      onConfirm={onConfirm}
      onPass={onPass}
    />
  );
}

/** Açık oylama: telefon ortada; toplam oy hayattaki oyuncu sayısını aşamaz. */
function OpenVote({ game, onDone }: { game: GameState; onDone: (counts: Record<PlayerId, number>) => void }) {
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
                    <View style={[styles.tag, { backgroundColor: tie ? colors.warning.bg : phases.day.accent }]}>
                      <AppText variant="caption" color={tie ? colors.warning.fg : colors.textInverse}>
                        {tie ? t.game.equal : t.game.leader}
                      </AppText>
                    </View>
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

type VerdictProps = {
  game: GameState;
  deaths: DeathEvent[];
  tally: Record<PlayerId, number>;
  pendingFor?: Player;
  onDone: () => void;
};

function Verdict({ game, deaths, tally, pendingFor, onDone }: VerdictProps) {
  const { t } = useLanguage();
  const hanged = deaths.find((d) => d.cause === 'lynch');
  // Oylama çözülünce tur ilerler; başlık oylamanın yapıldığı günü gösterir.
  const header = <PhaseHeader icon={Vote} phase="day" title={t.game.day(Math.max(1, game.round - 1))} subtitle={t.game.verdictSub} />;

  if (!hanged) {
    const max = Math.max(0, ...Object.values(tally));
    const tied = Object.entries(tally).filter(([, n]) => max > 0 && n === max);
    return (
      <Screen phase="day" footer={<NightOrResult game={game} onPress={onDone} />}>
        {header}
        <View style={styles.nobody}>
          <View style={styles.iconOrb}>
            <Vote size={30} color={phases.day.accent} />
          </View>
          <AppText variant="h1" style={styles.center}>
            {t.game.nobodyHangedTitle}
          </AppText>
          <AppText color={colors.text2} style={styles.center}>
            {tied.length > 1 ? t.game.tieText(tied.map(([id]) => findPlayer(game, id).name).join(', ')) : t.game.noVotesText}
          </AppText>
          {tied.length > 1 ? (
            <View style={styles.tieRow}>
              {tied.map(([id, n]) => (
                <View key={id} style={styles.tieItem}>
                  <PlayerAvatar name={findPlayer(game, id).name} size={24} />
                  <View style={styles.chip}>
                    <AppText variant="caption">{n}</AppText>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Screen>
    );
  }

  const player = findPlayer(game, hanged.playerId);
  // Rol yalnızca "Ölenin rolü açıklansın" açıksa görünür (asılan İntikamcı olsa bile).
  const roleId = publicRoleOf(game, player) as RoleId | null;
  const reveal = game.settings.revealRoleOnDeath;
  return (
    <Screen
      phase="day"
      footer={
        pendingFor ? (
          <Button label={t.game.giveToName(pendingFor.name)} phase="day" icon={Smartphone} onPress={onDone} />
        ) : (
          <NightOrResult game={game} onPress={onDone} />
        )
      }
    >
      {header}
      <AppText variant="h1" style={styles.center}>
        {t.game.villageDecided}
      </AppText>
      <DeathCard name={player.name} subtitle={t.game.hangedWith(tally[player.id] ?? 0)} roleId={roleId} />
      {pendingFor ? (
        <InfoBand
          icon={Flame}
          tone="warning"
          text={reveal ? t.game.revengeTriggered(pendingFor.name) : t.game.lastChoice(pendingFor.name)}
        />
      ) : null}
    </Screen>
  );
}

type RevengePickProps = {
  game: GameState;
  avenger: Player;
  abilityId: string;
  onConfirm: (id: PlayerId) => void;
  onPass: () => void;
};

function RevengePick({ game, avenger, abilityId, onConfirm, onPass }: RevengePickProps) {
  const { t } = useLanguage();
  const roleId = avenger.roleId as RoleId;
  return (
    <TargetPicker
      phase="day"
      header={<PhaseHeader icon={Flame} phase="day" title={t.game.day(Math.max(1, game.round - 1))} subtitle={t.game.revengeSub} />}
      pill={<RolePill roleId={roleId} />}
      question={t.roles[roleId].abilities?.[abilityId]?.prompt ?? ''}
      hint={t.game.revengeHint}
      items={alivePlayers(game).map((player) => ({ player }))}
      onConfirm={onConfirm}
      onPass={onPass}
    />
  );
}

function Avenged({ game, deaths, onDone }: { game: GameState; deaths: DeathEvent[]; onDone: () => void }) {
  const { t } = useLanguage();
  const death = deaths.find((d) => d.cause === 'revenge');
  if (!death) return null;
  const victim = findPlayer(game, death.playerId);
  const avenger = death.by ? findPlayer(game, death.by) : undefined;
  const roleId = publicRoleOf(game, victim) as RoleId | null;
  const reveal = game.settings.revealRoleOnDeath;
  const vampiresLeft = alivePlayers(game).filter((p) => teamOf(p) === 'vampire').length;
  return (
    <Screen
      phase="day"
      footer={<NightOrResult game={game} onPress={onDone} />}
    >
      <PhaseHeader
        icon={Flame}
        phase="day"
        title={t.game.day(Math.max(1, game.round - 1))}
        subtitle={reveal ? t.game.revengeSub : t.game.verdictSub}
      />
      {avenger ? (
        <>
          <AppText variant="h1" style={styles.center}>
            {reveal ? t.game.revengeTitle(avenger.name) : t.game.died(victim.name)}
          </AppText>
          <View style={styles.link}>
            <PlayerAvatar name={avenger.name} size={56} dimmed />
            <View style={styles.rope} />
            <PlayerAvatar name={victim.name} size={56} dimmed />
          </View>
        </>
      ) : null}
      <DeathCard name={victim.name} subtitle={avenger ? t.game.wentWith(avenger.name) : undefined} roleId={roleId} />
      {roleId && teamOf(victim) === 'vampire' ? <InfoBand icon={Info} tone="success" text={t.game.vampiresLeft(vampiresLeft)} /> : null}
    </Screen>
  );
}

/** Oyun sonu: kazanan, herkesin rolü ve tur tur olay özeti. */
function GameOver({ game, onLeave }: { game: GameState; onLeave: () => void }) {
  const { t } = useLanguage();
  const winner = game.winner ?? 'village';
  const phase: Phase = winner === 'vampire' ? 'night' : 'day';
  const leave = (to: '/new-game' | '/') => {
    onLeave();
    router.replace(to);
  };
  return (
    <Screen
      phase={phase}
      footer={
        <>
          <Button label={t.game.newGame} phase={phase} onPress={() => leave('/new-game')} />
          <Button label={t.game.mainMenu} variant="secondary" onPress={() => leave('/')} />
        </>
      }
    >
      <AppText variant="display" style={[styles.center, styles.winTitle]}>
        {t.game.wins(t.teams[winner].name)}
      </AppText>
      {game.players.map((p) => (
        <View key={p.id} style={styles.endRow}>
          <PlayerAvatar name={p.name} size={36} dimmed={!p.alive} />
          <AppText variant="button" color={p.alive ? colors.text1 : colors.text3} style={[styles.flex1, !p.alive && styles.strike]}>
            {p.name}
          </AppText>
          <RolePill roleId={p.roleId as RoleId} />
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

  const line = (e: GameEvent): string | null => {
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
  root: { flex: 1 },
  flex1: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  flex2: { flex: 2 },
  center: { textAlign: 'center' },
  strike: { textDecorationLine: 'line-through' },
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
  actionBar: { flexDirection: 'row', gap: 10 },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingVertical: 10,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  // Devir
  handoff: { flex: 1, backgroundColor: colors.bgHandoff, paddingHorizontal: space[5], justifyContent: 'space-between' },
  // Manzaranın üstünde yazılar okunsun diye hafif karartma.
  handoffShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(7, 6, 13, 0.45)' },
  handoffTop: { alignItems: 'center', gap: space[2] },
  handoffMid: { alignItems: 'center', gap: space[3] },
  handoffName: { fontSize: 40, lineHeight: 46 },
  dots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.surface3 },
  dotOn: { backgroundColor: colors.text2 },
  tapArea: {
    alignSelf: 'stretch',
    marginTop: space[4],
    height: 112,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    backgroundColor: 'rgba(22, 19, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
  },
  tapAreaPressed: { backgroundColor: colors.surface2 },
  quiz: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  quizOption: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: space[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleScene: { height: 200, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line },
  mates: { gap: space[2] },
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
  idleBox: {
    padding: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
  },
  mate: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  // Büyü
  spells: { flexDirection: 'row', gap: space[3] },
  spell: {
    flex: 1,
    gap: space[2],
    padding: space[3],
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface1,
    overflow: 'hidden',
  },
  spellUsed: { opacity: 0.45, borderStyle: 'dashed', backgroundColor: 'transparent' },
  spellIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  spellCheck: {
    position: 'absolute',
    top: space[3],
    right: space[3],
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    position: 'absolute',
    top: '42%',
    left: -10,
    right: -10,
    paddingVertical: 4,
    borderWidth: 2.5,
    borderColor: colors.danger.fg,
    backgroundColor: colors.bg1,
    alignItems: 'center',
    transform: [{ rotate: '-14deg' }],
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[1] },
  chip: {
    alignSelf: 'flex-start',
    height: 24,
    paddingHorizontal: space[2],
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
  },
  // Sabah / sonuç
  nobody: { alignItems: 'center', gap: space[4], paddingTop: space[10] },
  sunOrb: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: phases.day.mist,
    boxShadow: '0px 0px 60px rgba(242, 165, 65, 0.55)',
  },
  iconOrb: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#5A3420',
    backgroundColor: phases.day.selectBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deaths: { gap: space[3] },
  deathsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tieRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  tieItem: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  link: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2] },
  rope: { width: 90, borderTopWidth: 2.5, borderStyle: 'dashed', borderColor: '#C9A26A' },
  // Tartışma / oylama
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  autoBand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    padding: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface2,
  },
  voterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space[2],
    height: 44,
    paddingLeft: 8,
    paddingRight: space[4],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
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
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.pill },
  // Oyun sonu
  winTitle: { marginTop: space[6] },
  endRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  timeline: { gap: space[4] },
  timelineGroup: { gap: space[1] },
});
