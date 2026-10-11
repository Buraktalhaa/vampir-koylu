import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

/** Footer: [ikincil] [birincil] yan yana, birincil iki kat geniş. */
export function ActionBar({ secondary, primary }: { secondary?: ReactNode; primary: ReactNode }) {
  return (
    <View style={styles.actionBar}>
      {secondary ? <View style={styles.flex1}>{secondary}</View> : null}
      <View style={styles.flex2}>{primary}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  actionBar: { flexDirection: 'row', gap: 10 },
});
