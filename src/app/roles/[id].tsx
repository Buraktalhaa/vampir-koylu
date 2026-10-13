import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Crosshair, DoorOpen, GitCompare, HeartPulse, Search, Shield, ShieldHalf, Skull, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { RoleCard } from '@/components/role/RoleCard';
import { Screen } from '@/components/ui/Screen';
import { ROLE_IDS, ROLES, type RoleId } from '@/game/roles';
import type { EffectKind } from '@/game/types';
import { abilityTags } from '@/i18n/abilityTags';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, radius, space, touch } from '@/theme/tokens';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { SectionLabel } from '@/components/ui/SectionLabel';

const EFFECT_ICON: Record<EffectKind, { icon: typeof Shield; fg: string; bg: string }> = {
  protect: { icon: Shield, fg: colors.info.fg, bg: colors.info.bg },
  protectAll: { icon: Shield, fg: colors.info.fg, bg: colors.info.bg },
  guard: { icon: ShieldHalf, fg: colors.info.fg, bg: colors.info.bg },
  visit: { icon: DoorOpen, fg: colors.warning.fg, bg: colors.warning.bg },
  kill: { icon: Skull, fg: colors.danger.fg, bg: colors.team.vampire.bg },
  investigate: { icon: Search, fg: colors.warning.fg, bg: colors.warning.bg },
  compare: { icon: GitCompare, fg: colors.warning.fg, bg: colors.warning.bg },
  revive: { icon: HeartPulse, fg: colors.success.fg, bg: colors.success.bg },
  mark: { icon: Crosshair, fg: colors.team.neutral.fg, bg: colors.team.neutral.bg },
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
            <ChipRow>
              {summaryTags.map((tag) => (
                <Chip key={tag} label={tag} color={colors.text1} />
              ))}
            </ChipRow>
          ) : null
        }
      />
      {role.abilities.length > 0 ? (
        <>
          <SectionLabel>{t.encyclopedia.abilities}</SectionLabel>
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
                    <ChipRow>
                      {abilityTags(ability, t).map((tag) => (
                        <Chip key={tag} label={tag} />
                      ))}
                    </ChipRow>
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
