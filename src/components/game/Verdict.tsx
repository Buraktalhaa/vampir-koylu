import { Flame, Info, Smartphone, Vote } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Moment } from '@/components/art/Moment';
import { NightOrResult } from '@/components/game/NightOrResult';
import { PhaseHeader } from '@/components/game/PhaseHeader';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { RolePortrait } from '@/components/role/RolePortrait';
import { TeamBadge } from '@/components/role/TeamBadge';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { InfoBand } from '@/components/ui/InfoBand';
import { Screen } from '@/components/ui/Screen';
import { type DeathEvent, findPlayer, type GameState, getRole, type Player, type PlayerId, publicRoleOf, type RoleId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, radius, space } from '@/theme/tokens';

type VerdictProps = {
  game: GameState;
  deaths: DeathEvent[];
  tally: Record<PlayerId, number>;
  pendingFor?: Player;
  onDone: () => void;
};

/** Karar (tasarım 11 / 11b): asıldıysa darağacı ve (ayar açıksa) açıklanan rol; beraberlik ya da oysuzlukta terazi. */
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
        <Moment id="tie" />
        <AppText variant="display" style={styles.center}>
          {t.game.nobodyHangedTitle}
        </AppText>
        <AppText color={colors.text2} style={styles.center}>
          {tied.length > 1 ? t.game.tieText(tied.map(([id]) => findPlayer(game, id).name).join(', ')) : t.game.noVotesText}
        </AppText>
        {tied.length > 1 ? (
          <View style={styles.tieRow}>
            {tied.map(([id, n]) => (
              <View key={id} style={styles.tieItem}>
                <PlayerAvatar name={findPlayer(game, id).name} size={36} />
                <Chip shape="tag" label={n} />
              </View>
            ))}
          </View>
        ) : null}
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
          <Button label={t.game.giveToName(pendingFor.name)} icon={Smartphone} onPress={onDone} />
        ) : (
          <NightOrResult game={game} onPress={onDone} />
        )
      }
    >
      {header}
      <Moment id="lynch" />
      <AppText variant="display" style={styles.center}>
        {t.game.hangedTitle(player.name)}
      </AppText>
      <AppText color={colors.text2} style={styles.center}>
        {`${t.game.villageDecided}: ${t.game.hangedWith(tally[player.id] ?? 0)}`}
      </AppText>
      {roleId ? (
        <View style={styles.roleCard}>
          <RolePortrait roleId={roleId} size={48} />
          <View style={styles.flex1}>
            <AppText variant="small" color={colors.text2}>
              {t.game.roleRevealed}
            </AppText>
            <AppText variant="h2" numberOfLines={1}>
              {t.roles[roleId].name}
            </AppText>
          </View>
          <TeamBadge team={getRole(roleId).team} />
        </View>
      ) : (
        <InfoBand icon={Info} tone="warning" text={t.game.rolesAtEnd} />
      )}
      {pendingFor ? (
        <InfoBand icon={Flame} tone="warning" text={reveal ? t.game.revengeTriggered(pendingFor.name) : t.game.lastChoice(pendingFor.name)} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  flex1: { flex: 1 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  tieRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space[4] },
  tieItem: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
});
