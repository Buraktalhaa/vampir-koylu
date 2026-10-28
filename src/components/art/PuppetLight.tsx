import { StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { type Backdrop, puppet } from '@/theme/tokens';

/**
 * Gölge kukla perdesi: arkadan vuran kandil (gündüz) ya da indigo (gece) ışığı.
 * Kapsayıcının tamamını doldurur; şekli (daire, kemer) kapsayıcının köşe yuvarlaklığı belirler.
 */
export function PuppetLight({ backdrop = 'lamp' }: { backdrop?: Backdrop }) {
  const id = `puppet-${backdrop}`;
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="40%" r="62%">
          {puppet.backdrop[backdrop].map(([color, offset]) => (
            <Stop key={offset} offset={offset} stopColor={color} />
          ))}
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
