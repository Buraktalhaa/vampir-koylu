import { router } from 'expo-router';
import { Shuffle } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ErrorBox } from '@/components/ErrorBox';
import { Screen } from '@/components/Screen';
import { RolePortrait } from '@/components/RolePortrait';
import { Stepper } from '@/components/Stepper';
import { allRandomSetup, ROLE_IDS, ROLES, suggestRoles, validateSetup, type RoleId, type RoleSetup, type SetupError } from '@/game';
import type { Translation } from '@/i18n/locales/tr';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import { TEAM_VISUALS } from '@/theme/teams';
import { colors, DEFAULT_PHASE, phases, radius, space, touch } from '@/theme/tokens';

const accent = phases[DEFAULT_PHASE];

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

/** Kurulum 2/3: karakter dağılımı (sayı / rastgele / yok). */
export default function RolesStep() {
  const { t } = useLanguage();
  const { draft, updateDraft } = useGame();
  const { names, setup } = draft;

  const setSlot = (id: RoleId, slot: RoleSetup[RoleId]) => updateDraft({ setup: { ...setup, [id]: slot } });
  const step = (id: RoleId, delta: number) => {
    const current = setup[id];
    const n = (typeof current === 'number' ? current : 0) + delta;
    setSlot(id, n <= 0 ? undefined : n);
  };

  const errors = validateSetup(names.length, setup).map((e) => errorText(t, e));
  const fixedCount = Object.values(setup).reduce<number>((sum, s) => sum + (typeof s === 'number' ? s : 0), 0);

  return (
    <Screen
      title={t.setup.roles}
      footer={
        <>
          <ErrorBox errors={errors} />
          <Button label={t.setup.next} disabled={errors.length > 0} onPress={() => router.push('/new-game/settings')} />
          <Button label={t.common.back} variant="secondary" onPress={() => router.back()} />
        </>
      }
    >
      <AppText variant="caption" color={colors.text3}>
        {t.setup.summary(names.length, fixedCount)}
      </AppText>
      <View style={styles.presets}>
        <View style={styles.flex}>
          <Button label={t.setup.allRandom} variant="secondary" onPress={() => updateDraft({ setup: allRandomSetup() })} />
        </View>
        <View style={styles.flex}>
          <Button label={t.setup.suggested} variant="secondary" onPress={() => updateDraft({ setup: suggestRoles(names.length) })} />
        </View>
      </View>
      {ROLE_IDS.map((id) => {
        const slot = setup[id];
        const { line } = TEAM_VISUALS[ROLES[id].team];
        const isRandom = slot === 'random';
        return (
          <View key={id} style={[styles.roleRow, { borderColor: line }]}>
            <RolePortrait roleId={id} size={40} />
            <AppText variant="button" style={styles.flex}>
              {t.roles[id].name}
            </AppText>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: isRandom }}
              accessibilityLabel={t.setup.random}
              onPress={() => setSlot(id, isRandom ? undefined : 'random')}
              style={[styles.randomBtn, isRandom && { borderColor: accent.accent, backgroundColor: accent.selectBg }]}
            >
              <Shuffle size={18} color={isRandom ? accent.accent : colors.text3} />
            </Pressable>
            <Stepper
              value={isRandom ? '?' : String(slot ?? 0)}
              onMinus={() => step(id, -1)}
              onPlus={() => step(id, 1)}
              minusDisabled={typeof slot !== 'number'}
            />
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  presets: { flexDirection: 'row', gap: space[2] },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surface1,
  },
  randomBtn: {
    width: touch.min,
    height: touch.min,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
