import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, space } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = {
  label: string | number;
  /** Metin rengi (kenarlık da bu renge boyanır; `borderColor` ile ayrıca verilebilir). */
  color?: string;
  borderColor?: string;
  background?: string;
  /** pill: yuvarlak etiket · tag: köşeli sayaç/rozet */
  shape?: 'pill' | 'tag';
};

/** Küçük etiket: yetenek etiketleri, kalan hak, oy sayısı, "En çok" vb. */
export function Chip({ label, color = colors.text2, borderColor, background, shape = 'pill' }: Props) {
  return (
    <View
      style={[
        styles.base,
        shape === 'pill' ? styles.pill : styles.tag,
        { borderColor: borderColor ?? (color === colors.text2 ? colors.line : color), backgroundColor: background ?? colors.surface2 },
      ]}
    >
      <AppText variant="caption" color={color}>
        {label}
      </AppText>
    </View>
  );
}

/** Etiketleri yan yana, sığmazsa alt satıra dizer. */
export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  base: { alignSelf: 'flex-start', borderWidth: 1, justifyContent: 'center' },
  pill: { paddingHorizontal: space[3], paddingVertical: 4, borderRadius: radius.pill },
  tag: { minHeight: 24, paddingHorizontal: space[2], borderRadius: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[1] + 2 },
});
