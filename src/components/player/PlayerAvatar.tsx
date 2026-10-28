import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { PuppetLight } from '@/components/art/PuppetLight';
import { AppText } from '@/components/ui/AppText';
import { avatarXml } from '@/theme/art';
import { usePhase } from '@/theme/PhaseContext';
import { colors, phases } from '@/theme/tokens';

type Props = {
  name: string;
  size?: number;
  /** Ölü / seçilemez: soluk siluet, kesikli halka. */
  dimmed?: boolean;
  /** Seçili: kalın açık halka. */
  selected?: boolean;
};

/**
 * Oyuncu avatarı: perde (gündüz kandil, gece indigo) önünde isimden kararlı seçilen nötr kukla başı; takım bilgisi taşımaz.
 * 36 px ve üstünde sağ altta baş harf rozeti.
 */
export function PlayerAvatar({ name, size = 40, dimmed, selected }: Props) {
  const phase = usePhase();
  const theme = phases[phase];
  const badge = Math.round(size * 0.34);
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: selected ? theme.accent : theme.border,
            borderWidth: selected ? 3 : 2,
            borderStyle: dimmed ? 'dashed' : 'solid',
          },
          selected && { boxShadow: `0px 0px 10px ${theme.accent}` },
        ]}
      >
        <View style={[StyleSheet.absoluteFill, dimmed && styles.dimmed]}>
          <PuppetLight backdrop={phase === 'night' ? 'night' : 'lamp'} />
          <SvgXml xml={avatarXml(name)} width="100%" height="100%" />
        </View>
      </View>
      {size >= 36 ? (
        <View style={[styles.badge, { width: badge, height: badge, borderRadius: badge / 2, borderColor: theme.border }]}>
          <AppText variant="caption" style={[styles.initial, { fontSize: Math.max(10, badge * 0.5), lineHeight: badge }]} color={dimmed ? colors.text3 : colors.text1}>
            {name.charAt(0).toLocaleUpperCase('tr')}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { overflow: 'hidden' },
  dimmed: { opacity: 0.35 },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: colors.bg0,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { letterSpacing: 0 },
});
