import { StyleSheet, View } from 'react-native';

import { colors, radius, space } from '@/theme/tokens';

import { AppText } from './AppText';

export function ErrorBox({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return (
    <View style={styles.box}>
      {errors.map((e) => (
        <AppText key={e} variant="small" color={colors.danger.fg}>
          {e}
        </AppText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: space[3], borderRadius: radius.md, backgroundColor: colors.surface2, gap: space[1] },
});
