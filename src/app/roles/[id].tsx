import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { RoleCard } from '@/components/RoleCard';
import { Screen } from '@/components/Screen';
import { ROLE_IDS, ROLES, type RoleId } from '@/game/roles';
import { abilityTags } from '@/i18n/abilityTags';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, radius, space } from '@/theme/tokens';

export default function RoleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const back = <Button label={t.common.back} variant="secondary" onPress={() => router.back()} />;

  if (!ROLE_IDS.includes(id as RoleId)) return <Screen footer={back}>{null}</Screen>;

  const roleId = id as RoleId;
  const abilityTexts = t.roles[roleId].abilities ?? {};

  return (
    <Screen footer={back}>
      <RoleCard roleId={roleId} size="large" />
      {ROLES[roleId].abilities.length > 0 ? (
        <AppText variant="caption" color={colors.text3}>
          {t.encyclopedia.abilities}
        </AppText>
      ) : null}
      {ROLES[roleId].abilities.map((ability) => (
        <View key={ability.id} style={styles.ability}>
          <AppText variant="h3">{abilityTexts[ability.id]?.name ?? ability.id}</AppText>
          {abilityTexts[ability.id]?.description ? (
            <AppText color={colors.text2}>{abilityTexts[ability.id]?.description}</AppText>
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
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  ability: {
    gap: space[2],
    padding: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginTop: space[1] },
  tag: {
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface2,
  },
});
