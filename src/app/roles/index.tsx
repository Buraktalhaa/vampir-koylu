import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { Icon } from '@/components/icons/types';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { RoleCard } from '@/components/role/RoleCard';
import { Screen } from '@/components/ui/Screen';
import { CountBadge, ScreenHeader } from '@/components/ui/ScreenHeader';
import { CLASSIC_ROLES, ROLE_IDS, ROLES, type RoleId } from '@/game/roles';
import type { TeamId } from '@/game/types';
import type { Translation } from '@/i18n/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { TEAM_VISUALS } from '@/theme/teams';
import { colors, gutter, puppet, radius, space } from '@/theme/tokens';
import { ToggleChip } from '@/components/ui/ToggleChip';
import { TextField } from '@/components/ui/TextField';
import { GroupHeader } from '@/components/role/GroupHeader';
import { TEAM_ORDER } from '@/components/role/roleOrder';

type Filter = TeamId | 'all';
/** Izgara aralığı (tasarım 08). */
const GRID_GAP = 12;

type Section = { key: string; title: string; icon: Icon; color: string; ids: RoleId[] };

const norm = (s: string) => s.toLocaleLowerCase('tr');

/** Arama isim, yetenek adı ve açıklamada yapılır (Türkçe harf duyarsız). */
function matches(t: Translation, id: RoleId, query: string): boolean {
  if (!query) return true;
  const text = t.roles[id];
  const haystack = [text.name, text.description, ...Object.values(text.abilities ?? {}).flatMap((a) => [a.name, a.description ?? ''])];
  return haystack.some((h) => norm(h).includes(norm(query)));
}

export default function Encyclopedia() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const visible = ROLE_IDS.filter((id) => (filter === 'all' || ROLES[id].team === filter) && matches(t, id, query.trim()));
  // "Hepsi"nde önce klasik karakterler, sonra diğerleri takımlarına göre; takım sekmesinde yalnızca o takım.
  const classic = filter === 'all' ? CLASSIC_ROLES.filter((id) => visible.includes(id)) : [];
  const sections: Section[] = [
    ...(classic.length ? [{ key: 'classic', title: t.encyclopedia.classic, icon: TEAM_VISUALS.village.icon, color: colors.text1, ids: classic }] : []),
    ...TEAM_ORDER.filter((team) => filter === 'all' || filter === team).map((team) => ({
      key: team,
      title: t.teams[team].name,
      icon: TEAM_VISUALS[team].icon,
      color: TEAM_VISUALS[team].fg,
      ids: visible.filter((id) => ROLES[id].team === team && !classic.includes(id)),
    })),
  ];

  const clear = () => {
    setQuery('');
    setFilter('all');
  };

  return (
    <Screen>
      <ScreenHeader title={t.encyclopedia.title} right={<CountBadge value={visible.length} />} />
      <View style={styles.searchRow}>
        <TextField
          icon={Search}
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder={t.encyclopedia.search}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs} style={styles.tabsBox}>
        {(['all', ...TEAM_ORDER] as Filter[]).map((f) => (
          <ToggleChip
            key={f}
            label={f === 'all' ? t.encyclopedia.all : t.teams[f].name}
            dot={f === 'all' ? undefined : puppet.team[f]}
            selected={f === filter}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>

      {visible.length === 0 ? (
        <View style={styles.empty}>
          <Search size={28} color={colors.text2} />
          <AppText variant="h3">{t.encyclopedia.noResults}</AppText>
          <AppText variant="small" color={colors.text2} style={styles.center}>
            {t.encyclopedia.noResultsHint(query.trim())}
          </AppText>
          <Button label={t.encyclopedia.clearFilters} variant="secondary" onPress={clear} />
        </View>
      ) : (
        sections
          .filter((s) => s.ids.length)
          .map(({ key, title, icon: Icon, color, ids }) => {
            return (
              <View key={key} style={styles.section}>
                <GroupHeader icon={Icon} title={title} color={color} count={ids.length} />
                <View style={styles.grid}>
                  {ids.map((id) => (
                    <View key={id} style={styles.gridCell}>
                      <RoleCard roleId={id} onPress={() => router.push({ pathname: '/roles/[id]', params: { id } })} />
                    </View>
                  ))}
                </View>
              </View>
            );
          })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  searchRow: { flexDirection: 'row' },
  tabsBox: { marginHorizontal: -gutter, flexGrow: 0 },
  tabs: { gap: space[2], paddingHorizontal: gutter },
  section: { gap: space[3] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -GRID_GAP / 2 },
  gridCell: { width: '33.333%', paddingHorizontal: GRID_GAP / 2, paddingBottom: space[4] },
  empty: {
    alignItems: 'center',
    gap: space[3],
    padding: space[6],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
});
