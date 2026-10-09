import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SettingSwitch } from '@/components/SettingSwitch';
import { createGame } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';

/** Kurulum 3/3: oyun ayarları ve başlat. */
export default function SettingsStep() {
  const { t } = useLanguage();
  const { draft, updateDraft, startSession } = useGame();
  const { settings } = draft;

  const start = () => {
    startSession(createGame(draft.names, draft.setup, settings));
    router.dismissAll();
    router.replace('/game');
  };

  return (
    <Screen
      title={t.gameSettings.title}
      footer={
        <>
          <Button label={t.setup.start} onPress={start} />
          <Button label={t.common.back} variant="secondary" onPress={() => router.back()} />
        </>
      }
    >
      <SettingSwitch
        label={t.gameSettings.firstNightActions.label}
        hint={t.gameSettings.firstNightActions.hint}
        value={settings.firstNightActions}
        onChange={(v) => updateDraft({ settings: { ...settings, firstNightActions: v } })}
      />
      <SettingSwitch
        label={t.gameSettings.revealRoleOnDeath.label}
        hint={t.gameSettings.revealRoleOnDeath.hint}
        value={settings.revealRoleOnDeath}
        onChange={(v) => updateDraft({ settings: { ...settings, revealRoleOnDeath: v } })}
      />
      <SettingSwitch
        label={t.setup.secretVote.label}
        hint={t.setup.secretVote.hint}
        value={settings.voteMode === 'secret'}
        onChange={(v) => updateDraft({ settings: { ...settings, voteMode: v ? 'secret' : 'open' } })}
      />
    </Screen>
  );
}
