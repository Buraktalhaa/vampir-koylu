import { Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius } from '@/theme/tokens';

type Props = {
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  minusDisabled?: boolean;
  plusDisabled?: boolean;
  /** Değer rengi (ör. oylamada lider: mum sarısı). */
  valueColor?: string;
};

/** − değer + sayacı: 36 yükseklik hap, koyu dolgu, ahşap kenar; sayı Cinzel. Dokunma alanı hitSlop ile 48. */
export function Stepper({ value, onMinus, onPlus, minusDisabled, plusDisabled, valueColor = colors.text1 }: Props) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="−" onPress={onMinus} disabled={minusDisabled} hitSlop={6} style={({ pressed }) => [styles.btn, pressed && styles.pressed, minusDisabled && styles.off]}>
        <Minus size={16} color={colors.text1} />
      </Pressable>
      <AppText variant="h3" color={valueColor} style={styles.value}>
        {value}
      </AppText>
      <Pressable accessibilityRole="button" accessibilityLabel="+" onPress={onPlus} disabled={plusDisabled} hitSlop={6} style={({ pressed }) => [styles.btn, pressed && styles.pressed, plusDisabled && styles.off]}>
        <Plus size={16} color={colors.text1} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.wood,
    backgroundColor: colors.bg0,
  },
  btn: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pressed: { backgroundColor: colors.surface3 },
  off: { opacity: 0.38 },
  value: { minWidth: 28, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
