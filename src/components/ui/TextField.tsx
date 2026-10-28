import { X } from 'lucide-react-native';
import type { Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import type { Icon as IconComponent } from '@/components/icons/types';
import { colors, fonts, MAX_FONT_SCALE, radius, space } from '@/theme/tokens';

type Props = Omit<TextInputProps, 'style'> & {
  ref?: Ref<TextInputInstance>;
  /** Solda ikon (ör. arama). */
  icon?: IconComponent;
  /** Verilirse ve metin varsa sağda ✕ temizleme butonu çıkar. */
  onClear?: () => void;
  error?: boolean;
};

/** Uygulamanın tek metin kutusu: aynı yükseklik, kenarlık, font ve dinamik yazı sınırı. */
export function TextField({ ref, icon: Icon, onClear, error, value, ...rest }: Props) {
  return (
    <View style={[styles.box, error && styles.error]}>
      {Icon ? <Icon size={18} color={colors.text3} /> : null}
      <TextInput
        ref={ref}
        value={value}
        placeholderTextColor={colors.text3}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        style={styles.input}
        {...rest}
      />
      {onClear && value ? (
        <Pressable accessibilityRole="button" accessibilityLabel="×" onPress={onClear} hitSlop={8}>
          <X size={18} color={colors.text2} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    height: 48,
    paddingHorizontal: space[4],
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.bg0,
  },
  error: { borderColor: colors.danger.fg },
  input: { flex: 1, height: '100%', color: colors.text1, fontFamily: fonts.body, fontSize: 16 },
});
