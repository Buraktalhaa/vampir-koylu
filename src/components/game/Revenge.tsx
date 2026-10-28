import { Flame, Info } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { Screen } from '@/components/ui/Screen';
import { DeathCard } from '@/components/game/DeathCard';
import { PhaseHeader } from '@/components/game/PhaseHeader';
import { RolePill } from '@/components/role/RolePill';
import {
  alivePlayers,
  type DeathEvent,
  findPlayer,
  type GameState,
  type Player,
  type PlayerId,
  publicRoleOf,
  type RoleId,
  teamOf,
} from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, space } from '@/theme/tokens';

import { InfoBand } from '@/components/ui/InfoBand';
import { NightOrResult } from '@/components/game/NightOrResult';
import { TargetPicker } from '@/components/game/TargetPicker';

type RevengePickProps = {
  game: GameState;
  avenger: Player;
  abilityId: string;
  onConfirm: (id: PlayerId) => void;
  onPass: () => void;
};

export function RevengePick({ game, avenger, abilityId, onConfirm, onPass }: RevengePickProps) {
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

export function Avenged({ game, deaths, onDone }: { game: GameState; deaths: DeathEvent[]; onDone: () => void }) {
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
      <DeathCard name={victim.name} subtitle={avenger ? t.game.wentWith(avenger.name) : undefined} roleId={roleId} moment="death" />
      {roleId && teamOf(victim) === 'vampire' ? <InfoBand icon={Info} tone="success" text={t.game.vampiresLeft(vampiresLeft)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  link: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2] },
  rope: { width: 90, borderTopWidth: 2.5, borderStyle: 'dashed', borderColor: colors.metal.brass },
});
