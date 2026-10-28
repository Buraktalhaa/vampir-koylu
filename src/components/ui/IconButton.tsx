import { Pressable, StyleSheet } from 'react-native';

import type { Icon as IconComponent } from '@/components/icons/types';
import { colors, radius } from '@/theme/tokens';

type Props = {
  icon: IconComponent;
  /** Verilmezse buton pasif (soluk) görünür. */
  onPress?: () => void;
  label?: string;
  /** round: kenarlıklı yuvarlak · plain: kenarlıksız dikdörtgen (sayaç içinde) */
  variant?: 'round' | 'plain';
  size?: number;
};

/** Tek ikonlu buton (− / + gibi). Pasifken soluk, dokunma alanı en az 40. */
export function IconButton({ icon: Icon, onPress, label, variant = 'round', size = 40 }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        variant === 'round' ? [styles.round, { width: size, height: size }] : [styles.plain, { width: size }],
        !onPress && styles.off,
        pressed && styles.pressed,
      ]}
    >
      <Icon size={20} color={colors.text1} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  round: { borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.wood, backgroundColor: colors.bg0, alignItems: 'center', justifyContent: 'center' },
  plain: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  off: { opacity: 0.38 },
  pressed: { backgroundColor: colors.surface3 },
});
