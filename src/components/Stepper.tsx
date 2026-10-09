import { Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, space, touch } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = { value: string; onMinus: () => void; onPlus: () => void; minusDisabled?: boolean };

export function Stepper({ value, onMinus, onPlus, minusDisabled }: Props) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" onPress={onMinus} disabled={minusDisabled} style={[styles.btn, minusDisabled && styles.off]}>
        <Minus size={18} color={colors.text1} />
      </Pressable>
      <AppText variant="button" style={styles.value}>
        {value}
      </AppText>
      <Pressable accessibilityRole="button" onPress={onPlus} style={styles.btn}>
        <Plus size={18} color={colors.text1} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  btn: {
    width: touch.min,
    height: touch.min,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  off: { opacity: 0.4 },
  value: { minWidth: 24, textAlign: 'center' },
});
