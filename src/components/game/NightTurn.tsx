import { Moon } from 'lucide-react-native';
import { useState } from 'react';

import type { PickerItem } from '@/components/player/PlayerPicker';
import { PhaseHeader } from '@/components/game/PhaseHeader';
import {
  type Ability,
  type ActionSubmission,
  alivePlayers,
  availableNightAbilities,
  findPlayer,
  type GameState,
  getRole,
  getValidTargets,
  isKnownTeammate,
  needsTarget,
  type Player,
  type RoleId,
} from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';

import { Idle } from '@/components/game/IdleTurn';
import { RoleSummary } from '@/components/game/RoleSummary';
import { SpellChoice } from '@/components/game/SpellChoice';
import { TargetPicker } from '@/components/game/TargetPicker';
import { teammateBadge } from '@/components/game/TeammateBadge';

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
export function NightTurn({ game, player, turnLabel, submissions, atReveal, onDone }: NightTurnProps) {
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
