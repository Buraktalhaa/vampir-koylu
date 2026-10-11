import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, radius, space } from '@/theme/tokens';

type Tone = 'info' | 'warning' | 'success';

export function InfoBand({ icon: Icon, text, tone = 'info' }: { icon: LucideIcon; text: string; tone?: Tone }) {
  const palette = { info: colors.info, warning: colors.warning, success: colors.success }[tone];
  return (
    <View style={[styles.band, { backgroundColor: palette.bg, borderColor: palette.fg }]}>
      <Icon size={16} color={palette.fg} />
      <AppText variant="small" color={palette.fg} style={styles.flex1}>
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
    gap: space[2],
    paddingVertical: 10,
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
