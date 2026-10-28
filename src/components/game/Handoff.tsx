import { Eye, Moon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Scene } from '@/components/art/Scene';
import { AppText } from '@/components/ui/AppText';
import { usePressScale } from '@/hooks/usePressScale';
import { useLanguage } from '@/i18n/LanguageProvider';
import { PhaseProvider } from '@/theme/PhaseContext';
import { colors, phases, radius, space } from '@/theme/tokens';

/** Devir ekranı açıldıktan sonra dokunuşların kabul edilmeye başladığı süre. */
const HANDOFF_ARM_MS = 600;
const BUTTON = 176;

/**
 * Devir ekranı (tasarım 03): rolden ve fazdan bağımsız. Arkada rastgele bir gece sahnesi; isim üstte, büyük yuvarlak
 * düğme altta (tek elle). Tek dokunuşla açılır. Rol ya da takım ipucu yoktur.
 */
export function Handoff({ name, index, total, onReveal }: { name: string; index: number; total: number; onReveal: () => void }) {
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const press = usePressScale(0.96);
  // Önceki oyuncunun hızlı ikinci dokunuşu bu ekrana düşüp sıradakinin rolünü açmasın.
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setArmed(true), HANDOFF_ARM_MS);
    return () => clearTimeout(id);
  }, []);
  return (
    <PhaseProvider value="night">
      <View style={[styles.root, { paddingTop: insets.top + space[4], paddingBottom: insets.bottom + space[6] }]}>
        <Scene id="night" />
        <View style={styles.top}>
          <Moon size={16} color={phases.night.text2} />
          <AppText variant="caption" color={phases.night.text2}>
            {t.game.turnOf(index + 1, total).toLocaleUpperCase(language)}
          </AppText>
        </View>
        <View style={styles.name}>
          <AppText color={phases.night.text2}>{t.game.giveTo}</AppText>
          <AppText variant="display" style={styles.nameText} numberOfLines={2} adjustsFontSizeToFit>
            {name.toLocaleUpperCase(language)}
          </AppText>
        </View>
        <View style={styles.flex} />
        <Animated.View style={press.style}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.game.tapToRevealName(name)}
            onPress={armed ? onReveal : undefined}
            onPressIn={press.onPressIn}
            onPressOut={press.onPressOut}
            style={styles.button}
          >
            <Eye size={36} color={colors.moon} />
            <AppText variant="button" color={colors.moon}>
              {t.game.tap.toLocaleUpperCase(language)}
            </AppText>
          </Pressable>
        </Animated.View>
        <AppText variant="small" color={phases.night.text2} style={styles.hint}>
          {t.game.dontLook}
        </AppText>
      </View>
    </PhaseProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgHandoff, paddingHorizontal: space[5], alignItems: 'center' },
  flex: { flex: 1 },
  top: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: space[2] },
  name: { marginTop: space[14] + space[10], alignItems: 'center', gap: space[1] },
  nameText: {
    fontSize: 44,
    lineHeight: 48,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 2 },
  },
  button: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: radius.pill,
    borderWidth: 6,
    borderColor: colors.moon,
    backgroundColor: phases.night.mist,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    boxShadow: '0px 0px 40px rgba(201, 191, 245, 0.35)',
  },
  hint: { marginTop: space[6], textAlign: 'center', maxWidth: 300 },
});
