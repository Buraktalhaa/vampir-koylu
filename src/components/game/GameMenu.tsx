import { LogOut, RotateCcw, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { SettingSwitch } from '@/components/ui/SettingSwitch';
import { SettingsGroup } from '@/components/ui/SettingsGroup';
import { useAppSettings } from '@/feedback/AppSettingsProvider';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, radius, space } from '@/theme/tokens';

type Props = { onRestart: () => void; onQuit: () => void };

/**
 * Oyun sırasında sağ üstteki ⚙️: ses/müzik/titreşim, yeniden başlat, oyundan çık.
 * Gizli bilgi içermez; her ekranda (devir, gece, oylama) aynı görünür.
 */
export function GameMenu({ onRestart, onQuit }: Props) {
  const { t } = useLanguage();
  const { settings, update } = useAppSettings();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const confirm = (title: string, message: string, action: string, onYes: () => void) =>
    Alert.alert(title, message, [
      { text: t.game.cancel, style: 'cancel' },
      {
        text: action,
        style: 'destructive',
        onPress: () => {
          setOpen(false);
          onYes();
        },
      },
    ]);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t.game.menuTitle}
        onPress={() => setOpen(true)}
        hitSlop={8}
        style={[styles.trigger, { top: insets.top + space[3] }]}
      >
        <Settings size={18} color={colors.text2} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} closeLabel={t.game.close}>
        <AppText variant="h2">{t.game.menuTitle}</AppText>

        <SettingsGroup>
          <SettingSwitch bare label={t.appSettings.music.label} value={settings.music} onChange={(music) => update({ music })} />
          <SettingSwitch bare label={t.appSettings.sounds.label} value={settings.sounds} onChange={(sounds) => update({ sounds })} />
          <SettingSwitch
            bare
            label={t.appSettings.vibration.label}
            value={settings.vibration}
            onChange={(vibration) => update({ vibration })}
          />
        </SettingsGroup>

        <Button
          label={t.game.restart}
          icon={RotateCcw}
          variant="secondary"
          onPress={() => confirm(t.game.restartTitle, t.game.restartMessage, t.game.restart, onRestart)}
        />
        <Button
          label={t.game.quit}
          icon={LogOut}
          variant="danger"
          onPress={() => confirm(t.game.quitTitle, t.game.quitMessage, t.game.quit, onQuit)}
        />
        <Button label={t.game.close} variant="secondary" onPress={() => setOpen(false)} />
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    position: 'absolute',
    right: space[4],
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
