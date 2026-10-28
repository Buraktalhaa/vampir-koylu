import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { usePhase } from '@/theme/PhaseContext';
import { colors, fonts, phases, radius, space } from '@/theme/tokens';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Seçiliyken solda onay işareti (hazır seçimler: "Klasik Mod"). */
  check?: boolean;
  /** Solda küçük renk noktası (takım filtresi). */
  dot?: string;
};

/** Seçim çipi (36): normalde saydam + ahşap kenar; seçiliyken mum sarısı kenar ve soluk dolgu. */
export function ToggleChip({ label, selected, onPress, check, dot }: Props) {
  const { border } = phases[usePhase()];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: selected ? colors.lamp.core : border },
        selected && styles.on,
        pressed && styles.pressed,
      ]}
    >
      {check && selected ? <Check size={16} color={colors.lamp.core} strokeWidth={3} /> : null}
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      <AppText color={selected ? colors.lamp.core : colors.text1} style={[styles.text, selected && styles.textOn]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  on: { backgroundColor: 'rgba(248, 207, 140, 0.16)' },
  pressed: { opacity: 0.8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  text: { fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 20 },
  textOn: { fontFamily: fonts.bodyBold },
});
