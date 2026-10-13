import type { StyleProp, TextStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { colors } from '@/theme/tokens';

/** Küçük, büyük harfli bölüm başlığı ("OYUNCULAR", "YETENEKLER" ...). Türkçe büyük harf kuralıyla. */
export function SectionLabel({ children, color = colors.text3, style }: { children: string; color?: string; style?: StyleProp<TextStyle> }) {
  return (
    <AppText variant="caption" color={color} style={style}>
      {children.toLocaleUpperCase('tr')}
    </AppText>
  );
}
