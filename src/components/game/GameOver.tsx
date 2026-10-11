import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { Screen } from '@/components/ui/Screen';
import { RolePill } from '@/components/role/RolePill';
import { findPlayer, type GameEvent, type GameState, type Phase, type PlayerId, type RoleId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, space } from '@/theme/tokens';

/** Oyun sonu: kazanan, herkesin rolü ve tur tur olay özeti. */
export function GameOver({ game, onLeave }: { game: GameState; onLeave: () => void }) {
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
export function Timeline({ game }: { game: GameState }) {
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
  flex1: { flex: 1 },
  center: { textAlign: 'center' },
  strike: { textDecorationLine: 'line-through' },
  winTitle: { marginTop: space[6] },
  endRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  timeline: { gap: space[4] },
  timelineGroup: { gap: space[1] },
});
