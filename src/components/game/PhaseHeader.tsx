import { StyleSheet, View } from 'react-native';

import type { Icon as IconComponent } from '@/components/icons/types';
import { AppText } from '@/components/ui/AppText';
import type { Phase } from '@/game/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, phases, space } from '@/theme/tokens';

type Props = {
  icon: IconComponent;
  title: string;
  subtitle?: string;
  phase: Phase;
  /** Parlak kandil sahnesinin üstünde (ör. sabah): koyu metin. */
  onLamp?: boolean;
};

/** Faz etiketi: "☾ GECE 2 · SIRA 2 / 7", "☀ 3. GÜN · SABAH". Sağda oyun menüsüne (⚙️) yer bırakır. */
export function PhaseHeader({ icon: Icon, title, subtitle, phase, onLamp }: Props) {
  const { language } = useLanguage();
  const color = onLamp ? colors.textInverse : phase === 'night' ? phases.night.text2 : colors.lamp.core;
  return (
    <View style={styles.row}>
      <Icon size={16} color={color} />
      <AppText variant="caption" color={onLamp ? colors.textInverse : phases[phase].text2} numberOfLines={1} style={styles.text}>
        {[title, subtitle].filter(Boolean).join(' · ').toLocaleUpperCase(language)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 44, paddingRight: 48 },
  text: { flex: 1 },
});
