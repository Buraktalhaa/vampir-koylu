import { Flame, Smartphone, Vote } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { Screen } from '@/components/ui/Screen';
import { DeathCard } from '@/components/game/DeathCard';
import { PhaseHeader } from '@/components/game/PhaseHeader';
import {
  type DeathEvent,
  findPlayer,
  type GameState,
  type Player,
  type PlayerId,
  publicRoleOf,
  type RoleId,
} from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, phases, radius, space } from '@/theme/tokens';

import { InfoBand } from '@/components/ui/InfoBand';
import { NightOrResult } from '@/components/game/NightOrResult';
import { Chip } from '@/components/ui/Chip';

type VerdictProps = {
  game: GameState;
  deaths: DeathEvent[];
  tally: Record<PlayerId, number>;
  pendingFor?: Player;
  onDone: () => void;
};

export function Verdict({ game, deaths, tally, pendingFor, onDone }: VerdictProps) {
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
                  <Chip shape="tag" color={colors.text1} label={n} />
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

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  nobody: { alignItems: 'center', gap: space[4], paddingTop: space[10] },
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
  tieRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  tieItem: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
});
