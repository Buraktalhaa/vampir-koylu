import { Dices, Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { RolePortrait } from '@/components/role/RolePortrait';
import { AppText } from '@/components/ui/AppText';
import { randomRange, type RoleSlot } from '@/game';
import { ROLES, type RoleId } from '@/game/roles';
import { useLanguage } from '@/i18n/LanguageProvider';
import { TEAM_VISUALS } from '@/theme/teams';
import { colors, radius, space } from '@/theme/tokens';

type Props = {
  roleId: RoleId;
  /** undefined = oyunda yok · { min, max } = rastgele · sayı = tam bu kadar */
  slot: RoleSlot | undefined;
  onChange: (slot: RoleSlot | undefined) => void;
  players: number;
  /** Bu karakterden en fazla kaç tane olabilir (ör. vampir üst sınırı). */
  limit: number;
  /** Sabit sayılar + en azlar oyuncu sayısını doldurdu: yer ayıran tüm + butonları kilitlenir. */
  full?: boolean;
  error?: boolean;
};

/** Kurulumda tek karakterin kartı: madalyon + isim; sabit sayı ya da rastgele için en az / en çok; altta Yok / Rastgele. */
export function RoleSlotCard({ roleId, slot, onChange, players, limit, full, error }: Props) {
  const { t } = useLanguage();
  const { icon: TeamIcon, fg, line } = TEAM_VISUALS[ROLES[roleId].team];
  const range = randomRange(slot);
  const isNone = slot === undefined;
  const count = typeof slot === 'number' ? slot : 0;

  const setMin = (min: number) => onChange({ min, max: range?.max });
  // En çok: oyuncu sayısının üstüne çıkınca sınırsız (∞) olur; ∞'dan − ile oyuncu sayısına iner.
  const setMax = (max: number | undefined) => onChange({ min: range?.min ?? 0, max });

  return (
    <View style={[styles.card, { borderColor: error ? colors.danger.fg : line }]}>
      <View style={styles.head}>
        <RolePortrait roleId={roleId} size={36} />
        <AppText variant="button" numberOfLines={1} style={styles.name}>
          {t.roles[roleId].name}
        </AppText>
        <TeamIcon size={14} color={fg} />
      </View>

      {range ? (
        <View style={styles.rangeBox}>
          <MiniStepper
            label={t.setup.min}
            value={String(range.min)}
            onMinus={range.min > 0 ? () => setMin(range.min - 1) : undefined}
            onPlus={!full && range.min < Math.min(limit, range.max ?? Infinity) ? () => setMin(range.min + 1) : undefined}
          />
          <MiniStepper
            label={t.setup.max}
            value={range.max === undefined ? '∞' : String(range.max)}
            onMinus={
              range.max === undefined
                ? () => setMax(Math.min(limit, players))
                : range.max > range.min
                  ? () => setMax(range.max! - 1)
                  : undefined
            }
            onPlus={range.max !== undefined ? () => setMax(range.max! + 1 > Math.min(limit, players) ? undefined : range.max! + 1) : undefined}
          />
        </View>
      ) : (
        <View style={styles.counter}>
          <StepButton icon="minus" onPress={count > 0 ? () => onChange(count - 1 || undefined) : undefined} />
          <AppText variant="h1" color={error ? colors.danger.fg : isNone ? colors.text3 : colors.text1} style={styles.value}>
            {count}
          </AppText>
          <StepButton icon="plus" onPress={!full && count < limit ? () => onChange(count + 1) : undefined} />
        </View>
      )}

      <View style={styles.toggles}>
        <Toggle label={t.setup.none} selected={isNone} onPress={() => onChange(undefined)} />
        <Toggle label={t.setup.random} icon selected={!!range} onPress={() => onChange(range ? slot : { min: 0 })} />
      </View>
    </View>
  );
}

function StepButton({ icon, onPress, size = 'large' }: { icon: 'minus' | 'plus'; onPress?: () => void; size?: 'large' | 'small' }) {
  const Icon = icon === 'minus' ? Minus : Plus;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={icon === 'minus' ? '−' : '+'}
      disabled={!onPress}
      onPress={onPress}
      style={size === 'large' ? styles.counterBtn : styles.miniBtn}
    >
      <Icon size={size === 'large' ? 20 : 16} color={onPress ? colors.text1 : colors.text3} />
    </Pressable>
  );
}

function MiniStepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus?: () => void; onPlus?: () => void }) {
  return (
    <View style={styles.miniRow}>
      <AppText variant="caption" color={colors.text2} style={styles.miniLabel} numberOfLines={1}>
        {label}
      </AppText>
      <StepButton icon="minus" size="small" onPress={onMinus} />
      <AppText variant="button" style={styles.miniValue}>
        {value}
      </AppText>
      <StepButton icon="plus" size="small" onPress={onPlus} />
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
  card: { gap: space[3], padding: space[3], borderRadius: radius.md, borderWidth: 1, backgroundColor: colors.surface1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  name: { flex: 1 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 76,
    borderRadius: radius.sm,
    backgroundColor: colors.bg1,
  },
  counterBtn: { width: 44, height: 76, alignItems: 'center', justifyContent: 'center' },
  value: { fontVariant: ['tabular-nums'] },
  // Rastgele: iki satır (en az / en çok); sabit sayaçla aynı yükseklikte, kart boyu değişmesin.
  rangeBox: {
    height: 76,
    justifyContent: 'space-evenly',
    borderRadius: radius.sm,
    backgroundColor: colors.bg1,
    paddingLeft: space[2],
  },
  miniRow: { flexDirection: 'row', alignItems: 'center', height: 34 },
  miniLabel: { flex: 1 },
  miniBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  miniValue: { minWidth: 22, textAlign: 'center', fontSize: 16, fontVariant: ['tabular-nums'] },
  toggles: { flexDirection: 'row', gap: 6 },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.surface3, borderColor: colors.lineStrong },
});
