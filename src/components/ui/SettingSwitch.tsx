import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { colors, radius, space } from '@/theme/tokens';

import { AppText } from '@/components/ui/AppText';

type Props = {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  /** Grup kartının içinde: kendi kenarlığı olmadan. */
  bare?: boolean;
};

/** Ayar satırı: başlık + açıklama + sağa sola kaydırılan anahtar. Satırın tamamı dokunulabilir. */
export function SettingSwitch({ label, hint, value, onChange, bare }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.row, bare && styles.bare]}
    >
      <View style={styles.text}>
        <AppText>{label}</AppText>
        {hint ? (
          <AppText variant="small" color={colors.text2} style={styles.hint}>
            {hint}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.lamp.mid, false: '#2A1A12' }}
        thumbColor={value ? colors.lamp.core : colors.text2}
        ios_backgroundColor="#2A1A12"
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
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  bare: { borderWidth: 0, borderRadius: 0, minHeight: 64 },
  text: { flex: 1, gap: 2 },
  hint: { fontSize: 13, lineHeight: 18 },
});
