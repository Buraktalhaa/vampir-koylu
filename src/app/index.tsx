import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import { space } from '@/theme/tokens';

export default function MainMenu() {
  const { t } = useLanguage();
  const { session } = useGame();

  return (
    <Screen
      footer={
        <>
          {session ? <Button label={t.menu.resume} onPress={() => router.push('/game')} /> : null}
          <Button
            label={t.menu.newGame}
            variant={session ? 'secondary' : 'primary'}
            onPress={() => router.push('/new-game')}
          />
          <Button label={t.menu.roles} variant="secondary" onPress={() => router.push('/roles')} />
          <Button label={t.menu.settings} variant="secondary" onPress={() => router.push('/settings')} />
        </>
      }
    >
      <View style={styles.hero}>
        <AppText variant="logo">Vampir Köylü</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: space[14] * 2, alignItems: 'center' },
});
