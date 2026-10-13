import { Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { RolePortrait } from '@/components/role/RolePortrait';
import { AppText } from '@/components/ui/AppText';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import type { RoleId } from '@/game/roles';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, DEFAULT_PHASE, phases, radius, space } from '@/theme/tokens';

type Props = {
  roleId: RoleId;
  visible: boolean;
  min: number;
  /** undefined = sınırsız (∞) */
  max: number | undefined;
  /** Bu karakterden en fazla kaç tane olabilir (oyuncu sayısı ya da vampir sınırı). */
  limit: number;
  /** Oyuncu sayısı dolduysa en az artık artırılamaz (yer ayırır). */
  full: boolean;
  onChange: (min: number, max: number | undefined) => void;
  onClose: () => void;
};

/** Rastgele karakterin aralığını ayarlayan alt panel: en az / en çok, hazır seçenekler ve açıklama cümlesi. */
export function RangeSheet({ roleId, visible, min, max, limit, full, onChange, onClose }: Props) {
  const { t } = useLanguage();
  const role = t.roles[roleId].name;
  const accent = phases[DEFAULT_PHASE];

  const presets: { label: string; min: number; max: number | undefined }[] = [
    { label: t.setup.rangeFree, min: 0, max: undefined },
    { label: t.setup.rangeAtLeastOne, min: 1, max: undefined },
    { label: t.setup.rangeAtMostOne, min: 0, max: 1 },
    { label: t.setup.rangeExactlyOne, min: 1, max: 1 },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} closeLabel={t.setup.done}>
        <View style={styles.titleRow}>
          <RolePortrait roleId={roleId} size={40} />
          <AppText variant="h2" style={styles.flex}>
            {t.setup.rangeTitle(role)}
          </AppText>
        </View>

        <View style={styles.columns}>
          <Counter
            label={t.setup.min}
            value={String(min)}
            onMinus={min > 0 ? () => onChange(min - 1, max) : undefined}
            onPlus={!full && min < Math.min(limit, max ?? Infinity) ? () => onChange(min + 1, max) : undefined}
          />
          <Counter
            label={t.setup.max}
            value={max === undefined ? '∞' : String(max)}
            caption={max === undefined ? t.setup.unlimited : undefined}
            // ∞'dan aşağı inince sınıra iner; sınırdan yukarı çıkınca ∞ olur.
            onMinus={max === undefined ? () => onChange(min, Math.max(min, limit)) : max > min ? () => onChange(min, max - 1) : undefined}
            onPlus={max !== undefined ? () => onChange(min, max + 1 > limit ? undefined : max + 1) : undefined}
          />
        </View>

        <View style={styles.presets}>
          {presets.map((p) => {
            const selected = p.min === min && p.max === max;
            const disabled = (full && p.min > min) || p.min > limit;
            return (
              <Pressable
                key={p.label}
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => onChange(p.min, p.max)}
                style={[styles.preset, selected && { borderColor: accent.accent, backgroundColor: accent.selectBg }, disabled && styles.off]}
              >
                <AppText variant="caption" color={selected ? colors.text1 : colors.text2} numberOfLines={1}>
                  {p.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sentence}>
          <AppText color={colors.text1}>{roleId === 'vampire' && max === undefined && min <= 1 ? t.setup.rangeBalancedVampire : t.setup.rangeSentence(role, min, max)}</AppText>
        </View>

        <Button label={t.setup.done} onPress={onClose} />
    </BottomSheet>
  );
}

function Counter({
  label,
  value,
  caption,
  onMinus,
  onPlus,
}: {
  label: string;
  value: string;
  caption?: string;
  onMinus?: () => void;
  onPlus?: () => void;
}) {
  return (
    <View style={styles.counter}>
      <AppText variant="caption" color={colors.text2}>
        {label.toLocaleUpperCase('tr')}
      </AppText>
      <View style={styles.counterRow}>
        <IconButton icon={Minus} label="−" onPress={onMinus} />
        <AppText variant="display" style={styles.value}>
          {value}
        </AppText>
        <IconButton icon={Plus} label="+" onPress={onPlus} />
      </View>
      <AppText variant="caption" color={colors.text3}>
        {caption ?? ' '}
      </AppText>
    </View>
  );
}


const styles = StyleSheet.create({
  flex: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  columns: { flexDirection: 'row', gap: space[3] },
  counter: {
    flex: 1,
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  value: { minWidth: 36, textAlign: 'center', fontVariant: ['tabular-nums'] },
  off: { opacity: 0.35 },
  presets: { flexDirection: 'row', gap: space[2] },
  preset: {
    flex: 1,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  sentence: {
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: colors.surface1,
    borderLeftWidth: 3,
    borderLeftColor: phases[DEFAULT_PHASE].accent,
  },
});
