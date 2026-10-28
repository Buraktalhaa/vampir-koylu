import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { RoleFigure } from '@/components/role/RoleFigure';
import { AppText } from '@/components/ui/AppText';
import { getRole, type RoleId } from '@/game/roles';
import { useLanguage } from '@/i18n/LanguageProvider';
import { space } from '@/theme/tokens';

/** Ansiklopedi ızgarası hücresi (tasarım 08): kemerli kandil perdesinde büyük kukla + Cinzel ad. Genişliğe göre ölçeklenir. */
export function RoleCard({ roleId, onPress }: { roleId: RoleId; onPress?: () => void }) {
  const { t } = useLanguage();
  const role = getRole(roleId);
  const text = t.roles[roleId];
  const [width, setWidth] = useState(0);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${text.name}, ${t.teams[role.team].name}`}
      onPress={onPress}
      onLayout={(e) => setWidth(Math.floor(e.nativeEvent.layout.width))}
      style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
    >
      {width ? <RoleFigure roleId={roleId} width={width} animated={false} framed={false} /> : <View style={styles.placeholder} />}
      <AppText variant="h3" numberOfLines={2} style={styles.name}>
        {text.name}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: { gap: space[2] },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  placeholder: { aspectRatio: 3 / 4 },
  name: { fontSize: 14, lineHeight: 18, textAlign: 'center' },
});
