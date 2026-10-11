import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { Phase } from '@/game/types';
import { colors, phases, radius, space } from '@/theme/tokens';

type Props = { icon: LucideIcon; title: string; subtitle?: string; phase: Phase };

/** Faz başlığı: "2. GECE · Sıra 2 / 7", "2. GÜN · Sabah · telefon ortada" ... */
export function PhaseHeader({ icon: Icon, title, subtitle, phase }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: phases[phase].selectBg }]}>
        <Icon size={16} color={phases[phase].accent} />
      </View>
      <View style={styles.text}>
        <AppText variant="h3">{title}</AppText>
        {subtitle ? (
          <AppText variant="small" color={colors.text2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginTop: space[1], paddingRight: 40 },
  icon: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
});
