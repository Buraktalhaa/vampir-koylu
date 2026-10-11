import { CircleAlert } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, space } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = { errors: string[]; title?: ReactNode };

/** Hata kutusu: tek hata tek satır; birden çoksa başlık + madde listesi. */
export function ErrorBox({ errors, title }: Props) {
  if (!errors.length) return null;
  const single = errors.length === 1 && !title;
  return (
    <View accessibilityRole="alert" style={styles.box}>
      {single ? (
        <View style={styles.row}>
          <CircleAlert size={18} color={colors.danger.fg} />
          <AppText variant="small" color={colors.danger.fg} style={styles.flex}>
            {errors[0]}
          </AppText>
        </View>
      ) : (
        <>
          <View style={styles.row}>
            <CircleAlert size={18} color={colors.danger.fg} />
            {title}
          </View>
          {errors.map((e) => (
            <AppText key={e} variant="small" color={colors.danger.fg}>
              • {e}
            </AppText>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: space[1],
    paddingVertical: space[3],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger.fill,
    backgroundColor: colors.team.vampire.bg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  flex: { flex: 1 },
});
