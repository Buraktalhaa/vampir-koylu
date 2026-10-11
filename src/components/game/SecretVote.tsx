import { Vote } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import type { PickerItem } from '@/components/player/PlayerPicker';
import { PhaseHeader } from '@/components/game/PhaseHeader';
import { alivePlayers, type GameState, isKnownTeammate, type Player, type PlayerId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, radius, space } from '@/theme/tokens';

import { TargetPicker } from '@/components/game/TargetPicker';
import { teammateBadge } from '@/components/game/TeammateBadge';

type SecretVoteProps = {
  game: GameState;
  voter: Player;
  subtitle: string;
  onConfirm: (id: PlayerId) => void;
  onPass: () => void;
};

export function SecretVote({ game, voter, subtitle, onConfirm, onPass }: SecretVoteProps) {
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

const styles = StyleSheet.create({
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
});
