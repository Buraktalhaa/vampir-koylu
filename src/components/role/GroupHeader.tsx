import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors, space } from '@/theme/tokens';

type Props = { icon: LucideIcon; title: string; color: string; count?: number };

/** Karakter grubu başlığı: ikon + büyük harfli ad + sağda adet (ör. "⌂ KÖY  11"). */
export function GroupHeader({ icon: Icon, title, color, count }: Props) {
  return (
    <View style={styles.row}>
      <Icon size={14} color={color} />
      <AppText variant="caption" color={color} style={styles.title}>
        {title.toLocaleUpperCase('tr')}
      </AppText>
      {count !== undefined ? (
        <AppText variant="caption" color={colors.text3}>
          {count}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[1], marginTop: space[2] },
  title: { flex: 1 },
});
