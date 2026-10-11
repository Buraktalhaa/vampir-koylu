import { Eye } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { NightScene } from '@/components/art/NightScene';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, radius, space } from '@/theme/tokens';

/** Devir ekranı açıldıktan sonra dokunuşların kabul edilmeye başladığı süre. */
const HANDOFF_ARM_MS = 600;

/**
 * Devir ekranı: rolden ve fazdan bağımsız. Arkada rastgele bir gece manzarası;
 * isim ve dokunma alanı ekranın ortasında. Tek dokunuşla açılır.
 */
export function Handoff({ name, index, total, onReveal }: { name: string; index: number; total: number; onReveal: () => void }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  // Önceki oyuncunun hızlı ikinci dokunuşu bu ekrana düşüp sıradakinin rolünü açmasın.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setArmed(true), HANDOFF_ARM_MS);
    return () => clearTimeout(id);
  }, []);
  return (
    <View style={styles.handoff}>
      <NightScene style={StyleSheet.absoluteFill} />
      <View style={styles.handoffShade} pointerEvents="none" />
      <View style={[styles.handoffTop, { paddingTop: insets.top + space[4] }]}>
        <AppText variant="caption" color={colors.text2}>
          {t.game.turnOf(index + 1, total).toLocaleUpperCase('tr')}
        </AppText>
        <View style={styles.dots}>
          {Array.from({ length: total }, (_, i) => (
            <View key={i} style={[styles.dot, i <= index && styles.dotOn]} />
          ))}
        </View>
      </View>
      <View style={styles.handoffMid}>
        <AppText color={colors.text2}>{t.game.giveTo}</AppText>
        <PlayerAvatar name={name} size={84} />
        <AppText variant="display" style={[styles.center, styles.handoffName]} numberOfLines={2}>
          {name.toLocaleUpperCase('tr')}
        </AppText>
        <AppText variant="small" color={colors.text2}>
          {t.game.dontLook}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={armed ? onReveal : undefined}
          style={({ pressed }) => [styles.tapArea, pressed && armed && styles.tapAreaPressed]}
        >
          <Eye size={24} color={colors.text1} />
          <AppText variant="button" style={styles.center}>
            {t.game.tapToRevealName(name)}
          </AppText>
        </Pressable>
      </View>
      <View style={{ height: insets.bottom + space[10] }} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  handoff: { flex: 1, backgroundColor: colors.bgHandoff, paddingHorizontal: space[5], justifyContent: 'space-between' },
  handoffShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(7, 6, 13, 0.45)' },
  handoffTop: { alignItems: 'center', gap: space[2] },
  handoffMid: { alignItems: 'center', gap: space[3] },
  handoffName: { fontSize: 40, lineHeight: 46 },
  dots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.surface3 },
  dotOn: { backgroundColor: colors.text2 },
  tapArea: {
    alignSelf: 'stretch',
    marginTop: space[4],
    height: 112,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
    backgroundColor: 'rgba(22, 19, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
  },
  tapAreaPressed: { backgroundColor: colors.surface2 },
});
