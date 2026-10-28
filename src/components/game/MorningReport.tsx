import { ChevronRight, HeartPulse, Info, Sun } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Moment } from '@/components/art/Moment';
import { Scene } from '@/components/art/Scene';
import { DeathCard } from '@/components/game/DeathCard';
import { PhaseHeader } from '@/components/game/PhaseHeader';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { InfoBand } from '@/components/ui/InfoBand';
import { Screen } from '@/components/ui/Screen';
import { alivePlayers, findPlayer, publicRoleOf, type DeathEvent, type GameState, type Player, type RoleId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, space } from '@/theme/tokens';

type Props = { game: GameState; deaths: DeathEvent[]; /** Bu gece dirilenler (ör. Şaman). */ revived?: Player[]; onDone: () => void };

/** Sabah raporu (tasarım 05): meydan sahnesi; gece ölenler düşmüş kukla görseliyle, kimse ölmediyse horoz. */
export function MorningReport({ game, deaths, revived = [], onDone }: Props) {
  const { t } = useLanguage();
  const alive = alivePlayers(game).length;
  return (
    <Screen
      phase="day"
      backdrop={<Scene id="day-1" />}
      footer={<Button label={game.winner ? t.game.seeResult : t.game.toDiscussion} trailingIcon={ChevronRight} onPress={onDone} />}
    >
      <PhaseHeader icon={Sun} phase="day" title={t.game.day(game.round)} subtitle={t.game.morningSub} onLamp />
      <AppText variant="display" color={colors.textInverse} style={styles.title}>
        {deaths.length === 0 ? t.game.nobodyDiedTitle : t.game.diedCount(deaths.length)}
      </AppText>
      {revived.map((p) => (
        <InfoBand key={p.id} icon={HeartPulse} tone="success" text={t.game.revived(p.name)} />
      ))}
      {deaths.length === 0 ? (
        <View style={styles.nobody}>
          <Moment id="no-death" />
          <AppText color={colors.text1} style={styles.center}>
            {t.game.nobodyDiedText}
          </AppText>
        </View>
      ) : (
        <>
          {deaths.map((d, i) => {
            const player = findPlayer(game, d.playerId);
            const roleId = publicRoleOf(game, player) as RoleId | null;
            return (
              <DeathCard
                key={d.playerId}
                index={i}
                name={player.name}
                subtitle={roleId ? `${t.game.nightVictim} · ${t.roles[roleId].name}` : t.game.nightVictim}
                roleId={roleId}
                moment={i === 0 ? 'death' : undefined}
              />
            );
          })}
          {!game.settings.revealRoleOnDeath ? <InfoBand icon={Info} tone="warning" text={t.game.rolesAtEnd} /> : null}
          {deaths.length === 1 ? <InfoBand icon={Info} text={t.game.leftGame(findPlayer(game, deaths[0].playerId).name, alive)} /> : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { textAlign: 'center', marginVertical: space[4] },
  center: { textAlign: 'center' },
  nobody: { gap: space[4] },
});
