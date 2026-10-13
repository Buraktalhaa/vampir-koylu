import { StyleSheet, View } from 'react-native';

import { RolePortrait } from '@/components/role/RolePortrait';
import { TeamBadge } from '@/components/role/TeamBadge';
import { AppText } from '@/components/ui/AppText';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { ROLES, type RoleId } from '@/game/roles';
import { abilityTags } from '@/i18n/abilityTags';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, radius, space } from '@/theme/tokens';

type Props = { roleId: RoleId; visible: boolean; onClose: () => void };

/** Karakterin ne işe yaradığını anlatan alt panel: kısa ve detaylı açıklama, yetenekler ve etiketleri. */
export function RoleInfoSheet({ roleId, visible, onClose }: Props) {
  const { t } = useLanguage();
  const role = ROLES[roleId];
  const text = t.roles[roleId];

  return (
    <BottomSheet visible={visible} onClose={onClose} closeLabel={t.game.close}>
      <View style={styles.head}>
        <RolePortrait roleId={roleId} size={64} />
        <View style={styles.headText}>
          <AppText variant="h2">{text.name}</AppText>
          <TeamBadge team={role.team} />
        </View>
      </View>

      <AppText>{text.description}</AppText>
      <View style={styles.tip}>
        <AppText variant="small" color={colors.text2}>
          {text.tip}
        </AppText>
      </View>

      {role.abilities.length ? (
        <View style={styles.abilities}>
          <SectionLabel>{t.encyclopedia.abilities}</SectionLabel>
          {role.abilities.map((ability) => (
            <View key={ability.id} style={styles.ability}>
              <AppText variant="h3">{text.abilities?.[ability.id]?.name ?? ability.id}</AppText>
              {text.abilities?.[ability.id]?.description ? (
                <AppText variant="small" color={colors.text2}>
                  {text.abilities[ability.id].description}
                </AppText>
              ) : null}
              <ChipRow>
                {abilityTags(ability, t).map((tag) => (
                  <Chip key={tag} label={tag} />
                ))}
              </ChipRow>
            </View>
          ))}
        </View>
      ) : null}

      <Button label={t.game.close} variant="secondary" onPress={onClose} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  headText: { flex: 1, gap: space[1] },
  tip: { padding: space[3], borderRadius: radius.sm, backgroundColor: colors.surface1 },
  abilities: { gap: space[2] },
  ability: { gap: space[1], padding: space[3], borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line },
});
