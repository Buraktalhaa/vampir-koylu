import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { colors, DEFAULT_PHASE, phases, radius, space } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = { label: string; hint?: string; value: boolean; onChange: (value: boolean) => void };

/** Ayar satırı: başlık + açıklama + sağa sola kaydırılan anahtar. Satırın tamamı dokunulabilir. */
export function SettingSwitch({ label, hint, value, onChange }: Props) {
  const { accent } = phases[DEFAULT_PHASE];
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={styles.row}
    >
      <View style={styles.text}>
        <AppText variant="button">{label}</AppText>
        {hint ? (
          <AppText variant="small" color={colors.text2}>
            {hint}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: accent, false: colors.line }}
        thumbColor={colors.text1}
        ios_backgroundColor={colors.line}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  text: { flex: 1, gap: space[1] },
});
