import { StyleSheet, View } from 'react-native';

import type { Icon } from '@/components/icons/types';
import { AppText } from '@/components/ui/AppText';
import { usePhase } from '@/theme/PhaseContext';
import { phases, space } from '@/theme/tokens';

type Props = { icon?: Icon; title: string; color?: string; count?: number | string };

/** Karakter grubu başlığı: amblem + büyük harfli ad + ince çizgi + sağda adet (ör. "⌂ KÖY ──── 9"). */
export function GroupHeader({ icon: Icon, title, count }: Props) {
  const { text2, border } = phases[usePhase()];
  return (
    <View style={styles.row}>
      {Icon ? <Icon size={20} /> : null}
      <AppText variant="caption" color={text2}>
        {title.toLocaleUpperCase('tr')}
      </AppText>
      <View style={[styles.line, { backgroundColor: border }]} />
      {count !== undefined ? (
        <AppText variant="small" color={text2}>
          {count}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[2] },
  line: { flex: 1, height: 1 },
});
