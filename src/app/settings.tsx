import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { LOCALES, type Language } from '@/i18n';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, DEFAULT_PHASE, phases, radius, space, touch } from '@/theme/tokens';

const accent = phases[DEFAULT_PHASE];

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <Screen title={t.appSettings.title} footer={<Button label={t.common.back} variant="secondary" onPress={() => router.back()} />}>
      <AppText variant="caption" color={colors.text3}>
        {t.appSettings.language}
      </AppText>
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
});
