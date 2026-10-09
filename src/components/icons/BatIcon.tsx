import Svg, { Path } from 'react-native-svg';

import type { IconProps } from './types';

/** Lucide'da yarasa yok; aynı çizgi stiliyle (24×24, yuvarlak uçlar) çizildi. */
export function BatIcon({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 8.5c-.8 0-1.4.5-1.7 1.2L9.4 8.4l-.3 1.9C7.4 8.9 4.8 8.7 2 10c1.7 1 2.4 2.7 2.2 4.3 1.3-.9 2.9-.9 4 .2.5-1.1 1.6-1.6 2.6-1.2L12 16l1.2-2.7c1-.4 2.1.1 2.6 1.2 1.1-1.1 2.7-1.1 4-.2-.2-1.6.5-3.3 2.2-4.3-2.8-1.3-5.4-1.1-7.1.3l-.3-1.9-.9 1.3c-.3-.7-.9-1.2-1.7-1.2z" />
    </Svg>
  );
}
