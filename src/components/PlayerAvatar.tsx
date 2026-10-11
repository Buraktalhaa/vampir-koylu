import { View } from 'react-native';

import { avatarColors, colors, radius } from '@/theme/tokens';

import { AppText } from './AppText';

/** İsimden kararlı renk: aynı oyuncu her ekranda aynı renkte görünür. */
export function avatarColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return avatarColors[hash % avatarColors.length];
}

export function PlayerAvatar({ name, size = 40, dimmed }: { name: string; size?: number; dimmed?: boolean }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.pill,
        backgroundColor: dimmed ? colors.surface3 : avatarColor(name),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText variant={size >= 64 ? 'display' : size >= 40 ? 'h3' : 'caption'} color={dimmed ? colors.text3 : colors.textInverse} style={size >= 64 && { fontSize: size * 0.42 }}>
        {name.charAt(0).toLocaleUpperCase('tr')}
      </AppText>
    </View>
  );
}
