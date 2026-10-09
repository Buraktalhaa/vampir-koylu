import { Pressable, StyleSheet } from 'react-native';

import type { Phase } from '@/game/types';
import { colors, DEFAULT_PHASE, phases, radius, space, touch } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  phase?: Phase;
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', phase = DEFAULT_PHASE, disabled }: Props) {
  const look = {
    primary: { bg: phases[phase].accent, border: phases[phase].accent, text: colors.textInverse },
    secondary: { bg: colors.surface1, border: colors.lineStrong, text: colors.text1 },
    danger: { bg: colors.danger.fill, border: colors.danger.fill, text: colors.text1 },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: look.bg, borderColor: look.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <AppText variant="button" color={look.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touch.button,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
});
