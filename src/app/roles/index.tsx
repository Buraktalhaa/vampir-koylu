import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { RoleCard } from '@/components/role/RoleCard';
import { Screen } from '@/components/ui/Screen';
import { CountBadge, ScreenHeader } from '@/components/ui/ScreenHeader';
import { ROLE_IDS, ROLES, type RoleId } from '@/game/roles';
import type { TeamId } from '@/game/types';
import type { Translation } from '@/i18n/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { TEAM_VISUALS } from '@/theme/teams';
import { colors, radius, space } from '@/theme/tokens';
import { TextField } from '@/components/ui/TextField';

type Filter = TeamId | 'all';
const TEAMS: TeamId[] = ['village', 'vampire'];

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
  const sections = TEAMS.filter((team) => filter === 'all' || filter === team).map((team) => ({
    team,
    ids: visible.filter((id) => ROLES[id].team === team),
  }));

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
      <View style={styles.tabs}>
        {(['all', ...TEAMS] as Filter[]).map((f) => {
          const selected = f === filter;
          const visual = f === 'all' ? undefined : TEAM_VISUALS[f];
          return (
            <Pressable
              key={f}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setFilter(f)}
              style={[styles.tab, selected && styles.tabSelected]}
            >
              {visual ? <visual.icon size={14} color={visual.fg} /> : null}
              <AppText variant="button" color={selected ? colors.text1 : colors.text2} style={styles.tabText}>
                {f === 'all' ? t.encyclopedia.all : t.teams[f].name}
              </AppText>
            </Pressable>
          );
        })}
      </View>

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
          .map(({ team, ids }) => {
            const { icon: Icon, fg } = TEAM_VISUALS[team];
            return (
              <View key={team} style={styles.section}>
                <View style={styles.sectionHead}>
                  <Icon size={14} color={fg} />
                  <AppText variant="caption" color={fg} style={styles.flex}>
                    {t.teams[team].name.toLocaleUpperCase('tr')}
                  </AppText>
                  <AppText variant="caption" color={colors.text3}>
                    {ids.length}
                  </AppText>
                </View>
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
  tabs: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabSelected: { backgroundColor: colors.surface3 },
  tabText: { fontSize: 14 },
  section: { gap: space[3] },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: space[1], marginTop: space[2] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  gridCell: { width: '33.333%', padding: 6 },
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
