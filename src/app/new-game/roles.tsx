import { router } from 'expo-router';
import { Check, ChevronRight, CircleAlert, Dices, Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { RolePortrait } from '@/components/RolePortrait';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TeamBadge } from '@/components/TeamBadge';
import {
  allRandomSetup,
  maxVampires,
  ROLE_IDS,
  ROLES,
  validateSetup,
  type RoleId,
  type RoleSetup,
  type SetupError,
} from '@/game';
import type { Translation } from '@/i18n/locales/tr';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import { TEAM_VISUALS } from '@/theme/teams';
import { colors, radius, space, touch } from '@/theme/tokens';

function errorText(t: Translation, e: SetupError): string {
  switch (e.code) {
    case 'tooManyVampires':
      return t.setup.errors.tooManyVampires(e.max);
    case 'minPlayers':
      return `${t.roles[e.roleId].name}: ${t.setup.errors.minPlayers(e.min)}`;
    case 'unique':
      return `${t.roles[e.roleId].name}: ${t.setup.errors.unique}`;
    default:
      return t.setup.errors[e.code];
  }
}

/** Hata hangi satıra ait? (satır kırmızı kenarlık alır) */
function errorRole(e: SetupError): RoleId | undefined {
  if (e.code === 'tooManyVampires' || e.code === 'needVampire') return 'vampire';
  if (e.code === 'minPlayers' || e.code === 'unique') return e.roleId;
  return undefined;
}

/** Kurulum 2/3: karakter dağılımı (Yok / Rastgele / sayı). */
export default function RolesStep() {
  const { t } = useLanguage();
  const { draft, updateDraft } = useGame();
  const { names, setup } = draft;
  const players = names.length;

  const setSlot = (id: RoleId, slot: RoleSetup[RoleId]) => updateDraft({ setup: { ...setup, [id]: slot } });
  const step = (id: RoleId, delta: number) => {
    const current = setup[id];
    setSlot(id, Math.max(0, (typeof current === 'number' ? current : 0) + delta) || undefined);
  };

  const errors = validateSetup(players, setup);
  const fixed = Object.values(setup).reduce<number>((sum, s) => sum + (typeof s === 'number' ? s : 0), 0);
  const randomCount = Object.values(setup).filter((s) => s === 'random').length;
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

      <Button label={t.setup.allRandom} variant="secondary" icon={Dices} onPress={() => updateDraft({ setup: allRandomSetup() })} />

      {ROLE_IDS.map((id) => {
        const slot = setup[id];
        const role = ROLES[id];
        const { line } = TEAM_VISUALS[role.team];
        const rowError = errors.find((e) => errorRole(e) === id);
        const isRandom = slot === 'random';
        const isNone = slot === undefined;
        const count = typeof slot === 'number' ? slot : 0;
        const plusDisabled = id === 'vampire' && count >= maxVampires(players);
        return (
          <View key={id} style={styles.roleBlock}>
            <View style={[styles.roleCard, { borderColor: rowError ? colors.danger.fg : line }]}>
              <View style={styles.roleHead}>
                <RolePortrait roleId={id} size={44} />
                <View style={styles.roleText}>
                  <AppText variant="button">{t.roles[id].name}</AppText>
                  <TeamBadge team={role.team} />
                </View>
              </View>
              <View style={[styles.segment, rowError && styles.segmentError]}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isNone }}
                  onPress={() => setSlot(id, undefined)}
                  style={[styles.segBtn, styles.segNone, isNone && styles.segOn]}
                >
                  <AppText variant="small" color={isNone ? colors.text1 : colors.text2}>
                    {t.setup.none}
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isRandom }}
                  onPress={() => setSlot(id, 'random')}
                  style={[styles.segBtn, styles.segRandom, isRandom && styles.segOn]}
                >
                  <Dices size={14} color={isRandom ? colors.text1 : colors.text2} />
                  <AppText variant="small" color={isRandom ? colors.text1 : colors.text2}>
                    {t.setup.random}
                  </AppText>
                </Pressable>
                <View style={styles.counter}>
                  <Pressable accessibilityRole="button" accessibilityLabel="−" disabled={count === 0} onPress={() => step(id, -1)} style={styles.counterBtn}>
                    <Minus size={16} color={count === 0 ? colors.text3 : colors.text1} />
                  </Pressable>
                  <AppText variant="h3" color={rowError ? colors.danger.fg : isRandom ? colors.text3 : colors.text1} style={styles.counterValue}>
                    {isRandom ? '–' : count}
                  </AppText>
                  <Pressable accessibilityRole="button" accessibilityLabel="+" disabled={plusDisabled} onPress={() => step(id, 1)} style={styles.counterBtn}>
                    <Plus size={16} color={plusDisabled ? colors.text3 : colors.text1} />
                  </Pressable>
                </View>
              </View>
            </View>
            {rowError ? (
              <View style={styles.rowError}>
                <CircleAlert size={14} color={colors.danger.fg} />
                <AppText variant="small" color={colors.danger.fg}>
                  {errorText(t, rowError)}
                </AppText>
              </View>
            ) : null}
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  summary: { gap: space[1], paddingVertical: space[3], paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1 },
  summaryOk: { borderColor: colors.success.fg, backgroundColor: colors.success.bg },
  summaryError: { borderColor: colors.danger.fill, backgroundColor: colors.team.vampire.bg },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  roleBlock: { gap: space[2] },
  roleCard: { gap: space[3], padding: 10, borderRadius: radius.lg - 4, borderWidth: 1, backgroundColor: colors.surface1 },
  roleHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  roleText: { flex: 1, gap: space[1] },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    height: touch.min,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg1,
    overflow: 'hidden',
  },
  segmentError: { borderColor: colors.danger.fg },
  segBtn: { height: '100%', flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  segNone: { width: 56 },
  segRandom: { width: 104 },
  segOn: { backgroundColor: colors.surface3 },
  counter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  counterBtn: { width: touch.min, height: touch.min, alignItems: 'center', justifyContent: 'center' },
  counterValue: { minWidth: 24, textAlign: 'center', fontVariant: ['tabular-nums'] },
  rowError: { flexDirection: 'row', alignItems: 'center', gap: space[1], paddingHorizontal: space[1] },
});

