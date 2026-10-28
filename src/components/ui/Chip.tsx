import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { usePhase } from '@/theme/PhaseContext';
import { colors, fonts, phases, radius, space } from '@/theme/tokens';

type Props = {
  label: string | number;
  /** Metin rengi (renkliyse kenarlık da bu renge boyanır; `borderColor` ile ayrıca verilebilir). */
  color?: string;
  borderColor?: string;
  background?: string;
  /** pill: yuvarlak etiket (kural etiketleri) · tag: küçük sayaç / rozet */
  shape?: 'pill' | 'tag';
};

/** Küçük etiket: yetenek kuralları, kalan hak, oy sayısı. Saydam dolgu, ahşap (gece: indigo) kenar. */
export function Chip({ label, color = colors.text1, borderColor, background, shape = 'pill' }: Props) {
  const { border } = phases[usePhase()];
  return (
    <View
      style={[
        styles.base,
        shape === 'pill' ? styles.pill : styles.tag,
        { borderColor: borderColor ?? (color === colors.text1 ? border : color), backgroundColor: background ?? colors.bg0 },
      ]}
    >
      <AppText variant="small" color={color} style={styles.text}>
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
  base: { alignSelf: 'flex-start', borderWidth: 1.5, justifyContent: 'center' },
  pill: { minHeight: 26, paddingHorizontal: space[3], borderRadius: radius.pill },
  tag: { minHeight: 24, paddingHorizontal: space[2], borderRadius: 8 },
  text: { fontFamily: fonts.bodyBold, fontSize: 13, lineHeight: 18 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
});
