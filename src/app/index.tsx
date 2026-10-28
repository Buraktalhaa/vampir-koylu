import { router } from 'expo-router';
import { BookOpen, ChevronRight, Settings } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Logo } from '@/components/art/Logo';
import { Scene } from '@/components/art/Scene';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { alivePlayers } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import { colors, radius, space } from '@/theme/tokens';

/** Ana menü: kandil perdesinde köylü ile vampir karşı karşıya; logo üstte, butonlar altta (tek elle). */
export default function MainMenu() {
  const { t, language, setLanguage } = useLanguage();
  const { session } = useGame();
  const game = session?.game;
  const when = game ? (game.phase === 'night' ? t.game.night(game.round) : t.game.day(game.round)) : '';

  return (
    <Screen
      backdrop={<Scene id="menu" />}
      footer={
        <>
          {game ? (
            <Button
              label={t.menu.resume}
              sublabel={t.menu.resumeInfo(when, alivePlayers(game).length)}
              variant="secondary"
              trailingIcon={ChevronRight}
              onPress={() => router.push('/game')}
            />
          ) : null}
          <Button label={t.menu.newGame} onPress={() => router.push('/new-game')} />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Button label={t.menu.roles} icon={BookOpen} variant="tertiary" onPress={() => router.push('/roles')} />
            </View>
            <View style={styles.flex}>
              <Button label={t.menu.settings} icon={Settings} variant="tertiary" onPress={() => router.push('/settings')} />
            </View>
          </View>
        </>
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.appSettings.language}
        onPress={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
        hitSlop={8}
        style={styles.lang}
      >
        <AppText variant="caption" color={colors.textInverse}>
          {language === 'tr' ? 'TR · en' : 'tr · EN'}
        </AppText>
      </Pressable>
      <View style={styles.hero}>
        <Logo width={290} />
        <AppText color={colors.textInverse} style={styles.tagline}>
          {t.menu.tagline}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lang: {
    alignSelf: 'flex-end',
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.lamp.edge,
    backgroundColor: 'rgba(248, 207, 140, 0.35)',
  },
  hero: { paddingTop: space[6], alignItems: 'center', gap: space[3] },
  tagline: { textAlign: 'center', lineHeight: 22, maxWidth: 260 },
  row: { flexDirection: 'row', gap: space[3] },
  flex: { flex: 1 },
});
