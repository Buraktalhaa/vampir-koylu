import { router } from 'expo-router';
import { Check, ChevronRight, CircleAlert, Dices, Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { RoleSlotCard } from '@/components/setup/RoleSlotCard';
import {
  allRandomSetup,
  classicSetup,
  sameSetup,
  CLASSIC_ROLES,
  maxVampires,
  randomRange,
  reservedSlots,
  ROLE_IDS,
  ROLES,
  validateSetup,
  type RoleId,
  type RoleSetup,
  type SetupError,
  type TeamId,
} from '@/game';
import type { Translation } from '@/i18n/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import { colors, radius, space } from '@/theme/tokens';
import { GroupHeader } from '@/components/role/GroupHeader';
import { TEAM_VISUALS } from '@/theme/teams';

/** Kurulum ekranındaki grup sırası. */
const TEAM_ORDER: TeamId[] = ['village', 'vampire', 'neutral'];

function errorText(t: Translation, e: SetupError): string {
  switch (e.code) {
    case 'tooManyVampires':
      return t.setup.errors.tooManyVampires(e.max);
    case 'minPlayers':
      return `${t.roles[e.roleId].name}: ${t.setup.errors.minPlayers(e.min)}`;
    case 'unique':
      return `${t.roles[e.roleId].name}: ${t.setup.errors.unique}`;
    case 'badRange':
      return `${t.roles[e.roleId].name}: ${t.setup.errors.badRange}`;
    default:
      return t.setup.errors[e.code];
  }
}

/** Hata hangi satıra ait? (satır kırmızı kenarlık alır) */
function errorRole(e: SetupError): RoleId | undefined {
  if (e.code === 'tooManyVampires' || e.code === 'needVampire') return 'vampire';
  if (e.code === 'minPlayers' || e.code === 'unique' || e.code === 'badRange') return e.roleId;
  return undefined;
}

/** Kurulum 2/3: karakter dağılımı (Yok / Rastgele / sayı). */
export default function RolesStep() {
  const { t } = useLanguage();
  const { draft, updateDraft } = useGame();
  const { names, setup } = draft;
  const players = names.length;

  const setSlot = (id: RoleId, slot: RoleSetup[RoleId]) => updateDraft({ setup: { ...setup, [id]: slot } });

  const errors = validateSetup(players, setup);
  const full = reservedSlots(players, setup) >= players;
  // Hazır seçenek birebir uygulanmışsa butonu seçili göster; kart değişince seçim kalkar.
  const isClassic = sameSetup(setup, classicSetup());
  const isAllRandom = sameSetup(setup, allRandomSetup());
  // En üstte klasik karakterler, altında diğerleri takımlarına göre.
  const groups = [
    { key: 'classic', icon: Sparkles, title: t.encyclopedia.classic, color: colors.text1, ids: CLASSIC_ROLES },
    ...TEAM_ORDER.map((team) => ({
      key: team,
      icon: TEAM_VISUALS[team].icon,
      title: t.teams[team].name,
      color: TEAM_VISUALS[team].fg,
      ids: ROLE_IDS.filter((id) => ROLES[id].team === team && !CLASSIC_ROLES.includes(id)),
    })),
  ].filter((g) => g.ids.length);
  const fixed = Object.values(setup).reduce<number>((sum, s) => sum + (typeof s === 'number' ? s : 0), 0);
  const randomCount = Object.values(setup).filter((s) => randomRange(s) !== null).length;
  const shown = errors.some((e) => e.code === 'tooManyRoles') || randomCount === 0 ? fixed : players;

  return (
    <Screen
      footer={
        <Button
          label={errors.length ? t.setup.fixFirst : t.setup.next}
          trailingIcon={errors.length ? undefined : ChevronRight}
          disabled={errors.length > 0}
          onPress={() => router.push('/new-game/settings')}
        />
      }
    >
      <ScreenHeader title={t.setup.roles} step={[2, 3]} stepLabel={t.setup.step(2, 3)} />

      {errors.length ? (
        <View accessibilityRole="alert" style={[styles.summary, styles.summaryError]}>
          <View style={styles.summaryRow}>
            <CircleAlert size={20} color={colors.danger.fg} />
            <AppText variant="h3" color={colors.danger.fg}>
              {t.setup.summaryCount(shown, players)}
            </AppText>
            <AppText variant="small" color={colors.danger.fg}>
              · {t.setup.issues(errors.length)}
            </AppText>
          </View>
          {errors.map((e) => (
            <AppText key={e.code} variant="small" color={colors.danger.fg}>
              • {errorText(t, e)}
            </AppText>
          ))}
        </View>
      ) : (
        <View style={[styles.summary, styles.summaryOk]}>
          <View style={styles.summaryRow}>
            <Check size={20} color={colors.success.fg} />
            <AppText variant="h2" style={styles.flex}>
              {t.setup.summaryCount(players, players)}
            </AppText>
            <AppText variant="small" color={colors.text2}>
              {t.setup.summaryDetail(fixed, randomCount)}
            </AppText>
          </View>
        </View>
      )}

      <View style={styles.presets}>
        <View style={styles.flex}>
          <Button
            label={t.setup.classicMode}
            variant={isClassic ? 'primary' : 'secondary'}
            icon={isClassic ? Check : Sparkles}
            onPress={() => updateDraft({ setup: classicSetup() })}
          />
        </View>
        <View style={styles.flex}>
          <Button
            label={t.setup.allRandom}
            variant={isAllRandom ? 'primary' : 'secondary'}
            icon={isAllRandom ? Check : Dices}
            onPress={() => updateDraft({ setup: allRandomSetup() })}
          />
        </View>
      </View>

      {groups.map(({ key, icon, title, color, ids }) => (
        <View key={key} style={styles.section}>
          <GroupHeader icon={icon} title={title} color={color} count={ids.length} />
          <View style={styles.grid}>
            {ids.map((id) => (
              <View key={id} style={styles.cell}>
                <RoleSlotCard
                  roleId={id}
                  slot={setup[id]}
                  onChange={(slot) => setSlot(id, slot)}
                  players={players}
                  full={full}
                  limit={id === 'vampire' ? maxVampires(players) : players}
                  error={errors.some((e) => errorRole(e) === id)}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summary: { gap: space[1], paddingVertical: space[3], paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1 },
  summaryOk: { borderColor: colors.success.fg, backgroundColor: colors.success.bg },
  summaryError: { borderColor: colors.danger.fill, backgroundColor: colors.team.vampire.bg },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  section: { gap: space[2] },
  presets: { flexDirection: 'row', gap: space[2] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  cell: { width: '50%', padding: 5 },
});
