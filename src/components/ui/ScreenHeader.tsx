import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, space, touch } from '@/theme/tokens';

type Props = {
  title: string;
  /** Sağda küçük içerik (ör. sayı rozeti). */
  right?: ReactNode;
  /** Kurulum adım göstergesi: [şu anki, toplam]. */
  step?: [number, number];
  stepLabel?: string;
  onBack?: () => void;
};

export function ScreenHeader({ title, right, step, stepLabel, onBack = () => router.back() }: Props) {
  const { language } = useLanguage();
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="‹" onPress={onBack} hitSlop={8} style={styles.back}>
        <ChevronLeft size={24} color={colors.text1} />
      </Pressable>
      <AppText variant="h2" style={styles.title} numberOfLines={1}>
        {title}
      </AppText>
      {step && stepLabel ? (
        <AppText variant="caption" color={colors.text2} accessibilityLabel={stepLabel}>
          {stepLabel.toLocaleUpperCase(language)}
        </AppText>
      ) : null}
      {right}
    </View>
  );
}

/** Başlığın sağındaki küçük sayı (ör. "15"). */
export function CountBadge({ value }: { value: number }) {
  return (
    <AppText variant="small" color={colors.text2}>
      {value}
    </AppText>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 56, marginBottom: space[1] },
  back: { width: touch.min, height: touch.min, marginLeft: -space[3], alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1 },
});
