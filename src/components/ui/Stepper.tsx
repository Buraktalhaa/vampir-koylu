import { Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, touch } from '@/theme/tokens';

import { AppText } from '@/components/ui/AppText';

type Props = {
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  minusDisabled?: boolean;
  plusDisabled?: boolean;
};

/** − değer + sayacı (44 · 24 · 44). */
export function Stepper({ value, onMinus, onPlus, minusDisabled, plusDisabled }: Props) {
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="−" onPress={onMinus} disabled={minusDisabled} style={styles.btn}>
        <Minus size={18} color={minusDisabled ? colors.text3 : colors.text1} />
      </Pressable>
      <AppText variant="h3" style={styles.value}>
        {value}
      </AppText>
      <Pressable accessibilityRole="button" accessibilityLabel="+" onPress={onPlus} disabled={plusDisabled} style={styles.btn}>
        <Plus size={18} color={plusDisabled ? colors.text3 : colors.text1} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg1,
  },
  btn: { width: touch.min, height: touch.min, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 24, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
