import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Phase } from '@/game/types';
import { colors, DEFAULT_PHASE, gutter, phases, space } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = {
  title?: string;
  children: ReactNode;
  /** Alt kısma sabitlenen aksiyonlar (tek elle kullanım). */
  footer?: ReactNode;
  phase?: Phase;
};

export function Screen({ title, children, footer, phase = DEFAULT_PHASE }: Props) {
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: phases[phase].deep }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {title ? <AppText variant="h1">{title}</AppText> : null}
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg1 },
  content: { paddingHorizontal: gutter, paddingTop: space[3], paddingBottom: space[6], gap: space[4] },
  footer: { paddingHorizontal: gutter, paddingBottom: space[4], gap: space[3] },
});
