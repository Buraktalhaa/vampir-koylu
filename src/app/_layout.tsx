import { Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { Karla_400Regular, Karla_400Regular_Italic, Karla_600SemiBold, Karla_700Bold } from '@expo-google-fonts/karla';
import { PirataOne_400Regular } from '@expo-google-fonts/pirata-one';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppSettingsProvider } from '@/feedback/AppSettingsProvider';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { GameProvider } from '@/store/GameProvider';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PirataOne_400Regular,
    Cinzel_700Bold,
    Karla_400Regular,
    Karla_400Regular_Italic,
    Karla_600SemiBold,
    Karla_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppSettingsProvider>
        <GameProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg1 },
          }}
        />
        </GameProvider>
        </AppSettingsProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
