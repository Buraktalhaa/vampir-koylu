import { router } from 'expo-router';
import { Moon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SettingSwitch } from '@/components/ui/SettingSwitch';
import { createGame, ROLE_IDS } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import { colors, radius, space } from '@/theme/tokens';

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Kurulum 3/3: oyun ayarları, özet ve başlat. */
export default function SettingsStep() {
  const { t } = useLanguage();
  const { draft, updateDraft, startSession } = useGame();
  const { settings, setup, names } = draft;
  const set = (patch: Partial<typeof settings>) => updateDraft({ settings: { ...settings, ...patch } });

  const start = () => {
    startSession(createGame(names, setup, settings));
    router.dismissAll();
    router.replace('/game');
  };

  const vampires = setup.vampire === 'random' ? t.setup.randomMark : String(setup.vampire ?? 0);
  const roles = ROLE_IDS.filter((id) => id !== 'vampire' && setup[id] !== undefined)
    .map((id) => (setup[id] === 'random' ? `${t.roles[id].name} (${t.setup.randomMark})` : `${t.roles[id].name} ×${setup[id]}`))
    .join(', ');

  return (
    <Screen footer={<Button label={t.setup.start} icon={Moon} onPress={start} />}>
      <ScreenHeader title={t.gameSettings.title} step={[3, 3]} stepLabel={t.setup.step(3, 3)} />
      <View style={styles.group}>
        <SettingSwitch
          bare
          label={t.gameSettings.firstNightActions.label}
          hint={t.gameSettings.firstNightActions.hint}
          value={settings.firstNightActions}
          onChange={(v) => set({ firstNightActions: v })}
        />
        <View style={styles.divider} />
        <SettingSwitch
          bare
          label={t.gameSettings.revealRoleOnDeath.label}
          hint={t.gameSettings.revealRoleOnDeath.hint}
          value={settings.revealRoleOnDeath}
          onChange={(v) => set({ revealRoleOnDeath: v })}
        />
        <View style={styles.divider} />
        <SettingSwitch
          bare
          label={t.setup.secretVote.label}
          hint={t.setup.secretVote.hint}
          value={settings.voteMode === 'secret'}
          onChange={(v) => set({ voteMode: v ? 'secret' : 'open' })}
        />
      </View>

      <AppText variant="caption" color={colors.text3}>
        {t.setup.summaryTitle.toLocaleUpperCase('tr')}
      </AppText>
      <View style={[styles.group, styles.summary]}>
        <SummaryRow label={t.setup.summaryPlayers} value={String(names.length)} />
        <SummaryRow label={t.setup.summaryVampires} value={vampires} />
        {roles ? <SummaryRow label={t.setup.summaryRoles} value={roles} /> : null}
        <SummaryRow label={t.setup.summaryDiscussion} value={formatTime(settings.discussionSeconds)} />
      </View>
    </Screen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText color={colors.text2}>{label}</AppText>
      <AppText variant="button" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: radius.lg - 4, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface1, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.line },
  summary: { padding: space[4], gap: space[3] },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space[4] },
  value: { flex: 1, textAlign: 'right' },
});
