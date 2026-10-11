import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Search, Shield, Skull, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { RoleCard } from '@/components/RoleCard';
import { Screen } from '@/components/Screen';
import { ROLE_IDS, ROLES, type RoleId } from '@/game/roles';
import type { EffectKind } from '@/game/types';
import { abilityTags } from '@/i18n/abilityTags';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, radius, space, touch } from '@/theme/tokens';

const EFFECT_ICON: Record<EffectKind, { icon: typeof Shield; fg: string; bg: string }> = {
  protect: { icon: Shield, fg: colors.info.fg, bg: colors.info.bg },
  protectAll: { icon: Shield, fg: colors.info.fg, bg: colors.info.bg },
  kill: { icon: Skull, fg: colors.danger.fg, bg: colors.team.vampire.bg },
  investigate: { icon: Search, fg: colors.warning.fg, bg: colors.warning.bg },
};

export default function RoleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();

  const back = (
    <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={styles.back}>
      <ChevronLeft size={22} color={colors.text1} />
      <AppText variant="caption" color={colors.text2}>
        {t.encyclopedia.title.toLocaleUpperCase('tr')}
      </AppText>
    </Pressable>
  );

  if (!ROLE_IDS.includes(id as RoleId)) return <Screen>{back}</Screen>;

  const roleId = id as RoleId;
  const role = ROLES[roleId];
  const texts = t.roles[roleId].abilities ?? {};
  // Kart altı özet etiketleri: yeteneklerin etiketlerinden tekrarsız ilk birkaçı.
  const summaryTags = [...new Set(role.abilities.flatMap((a) => abilityTags(a, t).slice(0, 2)))].slice(0, 3);

  return (
    <Screen>
      {back}
      <RoleCard
        roleId={roleId}
        size="large"
        footer={
          summaryTags.length ? (
            <View style={styles.tags}>
              {summaryTags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <AppText variant="caption">{tag}</AppText>
                </View>
              ))}
            </View>
          ) : null
        }
      />
      {role.abilities.length > 0 ? (
        <>
          <AppText variant="caption" color={colors.text3}>
            {t.encyclopedia.abilities.toLocaleUpperCase('tr')}
          </AppText>
          <View style={styles.abilities}>
            {role.abilities.map((ability, i) => {
              const visual = EFFECT_ICON[ability.effect] ?? { icon: Sparkles, fg: colors.text2, bg: colors.surface2 };
              const Icon = visual.icon;
              return (
                <View key={ability.id} style={[styles.ability, i > 0 && styles.divider]}>
                  <View style={[styles.abilityIcon, { backgroundColor: visual.bg }]}>
                    <Icon size={18} color={visual.fg} />
                  </View>
                  <View style={styles.abilityText}>
                    <AppText variant="h3">{texts[ability.id]?.name ?? ability.id}</AppText>
                    {texts[ability.id]?.description ? (
                      <AppText variant="small" color={colors.text2}>
                        {texts[ability.id]?.description}
                      </AppText>
                    ) : null}
                    <View style={styles.tags}>
                      {abilityTags(ability, t).map((tag) => (
                        <View key={tag} style={styles.tag}>
                          <AppText variant="caption" color={colors.text2}>
                            {tag}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: touch.min, marginLeft: -space[1] },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  tag: {
    paddingHorizontal: space[3],
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface2,
  },
  abilities: {
    paddingHorizontal: space[4],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  ability: { flexDirection: 'row', gap: space[3], paddingVertical: space[4] },
  divider: { borderTopWidth: 1, borderTopColor: colors.line },
  abilityIcon: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  abilityText: { flex: 1, gap: space[1] },
});
