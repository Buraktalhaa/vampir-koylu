import { router } from 'expo-router';
import { BookOpen, Moon, Play, Settings } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop, SvgXml } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { MENU_ART_XML } from '@/components/menuArt';
import { Screen } from '@/components/Screen';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import { colors, space } from '@/theme/tokens';

/** Menü görseli + altta butonlar okunsun diye koyulaşan perde. */
function MenuBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <SvgXml xml={MENU_ART_XML} width="100%" height="100%" />
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="menuShade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.bg0} stopOpacity={0.35} />
            <Stop offset="0.3" stopColor={colors.bg0} stopOpacity={0} />
            <Stop offset="0.65" stopColor={colors.bg0} stopOpacity={0} />
            <Stop offset="1" stopColor={colors.bg0} stopOpacity={0.85} />
          </LinearGradient>
        </Defs>
        <Rect width="100" height="100" fill="url(#menuShade)" />
      </Svg>
    </View>
  );
}

export default function MainMenu() {
  const { t } = useLanguage();
  const { session } = useGame();

  return (
    <Screen
      backdrop={<MenuBackdrop />}
      footer={
        <>
          {session ? <Button label={t.menu.resume} icon={Moon} onPress={() => router.push('/game')} /> : null}
          <Button
            label={t.menu.newGame}
            icon={Play}
            variant={session ? 'secondary' : 'primary'}
            onPress={() => router.push('/new-game')}
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button label={t.menu.roles} icon={BookOpen} variant="secondary" onPress={() => router.push('/roles')} />
            </View>
            <View style={styles.flex}>
              <Button label={t.menu.settings} icon={Settings} variant="secondary" onPress={() => router.push('/settings')} />
            </View>
          </View>
        </>
      }
    >
      <View style={styles.hero}>
        <AppText variant="logo" style={styles.logo}>
          Vampir Köylü
        </AppText>
        <AppText variant="small" color={colors.text2} style={styles.center}>
          {t.menu.tagline}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: space[10], alignItems: 'center', gap: space[2] },
  logo: { textShadowColor: 'rgba(179, 24, 46, 0.6)', textShadowRadius: 18, textShadowOffset: { width: 0, height: 0 } },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', gap: space[2] },
  flex: { flex: 1 },
});
