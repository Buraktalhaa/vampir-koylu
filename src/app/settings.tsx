import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SettingSwitch } from '@/components/ui/SettingSwitch';
import { SettingsGroup } from '@/components/ui/SettingsGroup';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useAppSettings } from '@/feedback/AppSettingsProvider';
import { LOCALES, type Language } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, DEFAULT_PHASE, phases, radius, space, touch } from '@/theme/tokens';

const accent = phases[DEFAULT_PHASE];

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { settings, update } = useAppSettings();

  return (
    <Screen title={t.appSettings.title} footer={<Button label={t.common.back} variant="secondary" onPress={() => router.back()} />}>
      <SectionLabel>{t.appSettings.language}</SectionLabel>
      {(Object.keys(LOCALES) as Language[]).map((code) => {
        const selected = code === language;
        return (
          <Pressable
            key={code}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setLanguage(code)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <AppText>{LOCALES[code].languageName}</AppText>
            {selected ? <Check size={20} color={accent.accent} /> : null}
          </Pressable>
        );
      })}

      <SectionLabel style={styles.section}>{t.appSettings.soundSection}</SectionLabel>
      <SettingsGroup>
        <SettingSwitch
          bare
          label={t.appSettings.music.label}
          hint={t.appSettings.music.hint}
          value={settings.music}
          onChange={(music) => update({ music })}
        />
        <SettingSwitch
          bare
          label={t.appSettings.sounds.label}
          hint={t.appSettings.sounds.hint}
          value={settings.sounds}
          onChange={(sounds) => update({ sounds })}
        />
        <SettingSwitch
          bare
          label={t.appSettings.vibration.label}
          hint={t.appSettings.vibration.hint}
          value={settings.vibration}
          onChange={(vibration) => update({ vibration })}
        />
      </SettingsGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: touch.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  optionSelected: { borderWidth: 2, borderColor: accent.accent, backgroundColor: accent.selectBg },
  section: { marginTop: space[3] },
});
