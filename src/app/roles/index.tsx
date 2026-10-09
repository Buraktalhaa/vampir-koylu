import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { RoleCard } from '@/components/RoleCard';
import { Screen } from '@/components/Screen';
import { ROLE_IDS, ROLES } from '@/game/roles';
import type { TeamId } from '@/game/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, DEFAULT_PHASE, phases, radius, space, touch } from '@/theme/tokens';

type Filter = TeamId | 'all';
const FILTERS: Filter[] = ['all', 'village', 'vampire'];

export default function Encyclopedia() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  const roleIds = ROLE_IDS.filter((id) => filter === 'all' || ROLES[id].team === filter);

  return (
    <Screen title={t.encyclopedia.title} footer={<Button label={t.common.back} variant="secondary" onPress={() => router.back()} />}>
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const selected = f === filter;
          return (
            <Pressable
              key={f}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setFilter(f)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <AppText variant="small" color={selected ? colors.text1 : colors.text2}>
                {f === 'all' ? t.encyclopedia.all : t.teams[f].name}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {roleIds.map((id) => (
        <RoleCard key={id} roleId={id} onPress={() => router.push({ pathname: '/roles/[id]', params: { id } })} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: space[2], flexWrap: 'wrap' },
  chip: {
    minHeight: touch.min,
    paddingHorizontal: space[4],
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  chipSelected: { backgroundColor: colors.surface3, borderColor: phases[DEFAULT_PHASE].accent },
});
