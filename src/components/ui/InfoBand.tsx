import { StyleSheet, View } from 'react-native';

import type { Icon as IconComponent } from '@/components/icons/types';
import { AppText } from '@/components/ui/AppText';
import { colors, space } from '@/theme/tokens';

type Tone = 'info' | 'warning' | 'success' | 'danger';

/** Bilgi bandı: soluk dolgu + ince kenar + renkli işaret; metin her zaman okunur açık renkte. En fazla 3 satır. */
export function InfoBand({ icon: Icon, text, tone = 'info' }: { icon: IconComponent; text: string; tone?: Tone }) {
  const palette = colors[tone];
  return (
    <View style={[styles.band, { backgroundColor: palette.bg, borderColor: palette.line }]}>
      <Icon size={20} color={palette.fg} />
      <AppText variant="small" color={tone === 'danger' ? colors.danger.text : colors.text1} numberOfLines={3} style={styles.flex1}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  band: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: space[3],
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});
