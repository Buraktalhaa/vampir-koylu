import { Dices, Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { RolePortrait } from '@/components/role/RolePortrait';
import { AppText } from '@/components/ui/AppText';
import type { RoleSlot } from '@/game';
import { ROLES, type RoleId } from '@/game/roles';
import { useLanguage } from '@/i18n/LanguageProvider';
import { TEAM_VISUALS } from '@/theme/teams';
import { colors, radius, space } from '@/theme/tokens';

type Props = {
  roleId: RoleId;
  /** undefined = oyunda yok · 'random' = rastgele havuzda · sayı = tam bu kadar */
  slot: RoleSlot | undefined;
  onChange: (slot: RoleSlot | undefined) => void;
  /** + butonunu kilitler (ör. vampir üst sınırı). */
  maxReached?: boolean;
  error?: boolean;
};

/** Kurulumda tek karakterin kartı: madalyon + isim, büyük sayı (− / +), altta Yok / Rastgele. */
export function RoleSlotCard({ roleId, slot, onChange, maxReached, error }: Props) {
  const { t } = useLanguage();
  const { icon: TeamIcon, fg, line } = TEAM_VISUALS[ROLES[roleId].team];
  const isRandom = slot === 'random';
  const isNone = slot === undefined;
  const count = typeof slot === 'number' ? slot : 0;
  const step = (delta: number) => onChange(Math.max(0, count + delta) || undefined);

  return (
    <View style={[styles.card, { borderColor: error ? colors.danger.fg : line }]}>
      <View style={styles.head}>
        <RolePortrait roleId={roleId} size={36} />
        <AppText variant="button" numberOfLines={1} style={styles.name}>
          {t.roles[roleId].name}
        </AppText>
        <TeamIcon size={14} color={fg} />
      </View>

      <View style={styles.counter}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="−"
          disabled={count === 0}
          onPress={() => step(-1)}
          style={styles.counterBtn}
        >
          <Minus size={18} color={count === 0 ? colors.text3 : colors.text1} />
        </Pressable>
        {isRandom ? (
          <Dices size={26} color={colors.text1} accessibilityLabel={t.setup.random} />
        ) : (
          <AppText variant="h1" color={error ? colors.danger.fg : isNone ? colors.text3 : colors.text1} style={styles.value}>
            {count}
          </AppText>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="+"
          disabled={maxReached}
          onPress={() => step(1)}
          style={styles.counterBtn}
        >
          <Plus size={18} color={maxReached ? colors.text3 : colors.text1} />
        </Pressable>
      </View>

      <View style={styles.toggles}>
        <Toggle label={t.setup.none} selected={isNone} onPress={() => onChange(undefined)} />
        <Toggle label={t.setup.random} icon selected={isRandom} onPress={() => onChange('random')} />
      </View>
    </View>
  );
}

function Toggle({ label, icon, selected, onPress }: { label: string; icon?: boolean; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.toggle, selected && styles.toggleOn]}
    >
      {icon ? <Dices size={13} color={selected ? colors.text1 : colors.text2} /> : null}
      <AppText variant="caption" color={selected ? colors.text1 : colors.text2} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: space[2], padding: 10, borderRadius: radius.md, borderWidth: 1, backgroundColor: colors.surface1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  name: { flex: 1 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.bg1,
  },
  counterBtn: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  value: { fontVariant: ['tabular-nums'] },
  toggles: { flexDirection: 'row', gap: 6 },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.surface3, borderColor: colors.lineStrong },
});
