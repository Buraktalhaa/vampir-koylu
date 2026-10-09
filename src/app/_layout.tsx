import { Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { FiraSans_400Regular, FiraSans_600SemiBold, FiraSans_700Bold } from '@expo-google-fonts/fira-sans';
import { PirataOne_400Regular } from '@expo-google-fonts/pirata-one';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LanguageProvider } from '@/i18n/LanguageProvider';
import { GameProvider } from '@/store/GameProvider';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PirataOne_400Regular,
    Cinzel_700Bold,
    FiraSans_400Regular,
    FiraSans_600SemiBold,
    FiraSans_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <GameProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg1 },
          }}
        />
        </GameProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
