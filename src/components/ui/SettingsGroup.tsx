import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme/tokens';

/** Ayar satırlarını tek kartta toplar ve aralarına çizgi koyar. */
export function SettingsGroup({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.group}>
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 ? <View style={styles.divider} /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { borderRadius: radius.lg - 4, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface1, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.line },
});
