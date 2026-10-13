import * as Haptics from 'expo-haptics';

/** Titreşimlerin tek geçiş noktası: ayar kapalıysa hiçbir yerde titremez. */
let enabled = true;

export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

export function hapticTap() {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function hapticWarning() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
