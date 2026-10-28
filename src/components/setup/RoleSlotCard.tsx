import { ChevronDown, Info } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { RoleInfoSheet } from '@/components/role/RoleInfoSheet';
import { RolePortrait } from '@/components/role/RolePortrait';
import { RangeSheet } from '@/components/setup/RangeSheet';
import { AppText } from '@/components/ui/AppText';
import { Stepper } from '@/components/ui/Stepper';
import { randomRange, type RoleSlot } from '@/game';
import type { RoleId } from '@/game/roles';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, fonts, radius, space } from '@/theme/tokens';

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
  const range = randomRange(slot);
  // "Yok" kayıtta 0 olarak tutulur (undefined = bu karakter kurulumda hiç yoktu, ör. sonradan eklendi).
  const isNone = slot === undefined || slot === 0;
  const count = typeof slot === 'number' ? slot : 0;
  const cap = Math.max(0, Math.min(limit, players));
  const [editing, setEditing] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const mode: Mode = range ? 'random' : isNone ? 'none' : 'fixed';
  const setMode = (next: Mode) => {
    if (next === mode) return;
    if (next === 'none') onChange(0);
    else if (next === 'random') onChange({ min: 0 });
    // Sabit: rastgelenin en azı (yoksa 1); yer dolduysa ve kart boşsa eklenemez.
    else onChange(full && isNone ? 0 : Math.min(cap, Math.max(1, range?.min ?? 1)));
  };

  return (
    <View style={[styles.card, { borderColor: error ? colors.danger.fg : colors.line }]}>
      <View style={[styles.head, isNone && styles.faded]}>
        <RolePortrait roleId={roleId} size={44} />
        <AppText variant="h3" numberOfLines={2} style={styles.name}>
          {t.roles[roleId].name}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t.roles[roleId].name}: ${t.game.moreInfo}`}
          onPress={() => setInfoOpen(true)}
          hitSlop={8}
          style={styles.info}
        >
          <Info size={20} color={colors.text2} />
        </Pressable>
      </View>

      {mode === 'none' ? (
        <View style={styles.noneBox}>
          <AppText variant="small" color={colors.text3}>
            {t.setup.notInGame}
          </AppText>
        </View>
      ) : range ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t.setup.rangeEdit}: ${t.setup.rangeSentence(t.roles[roleId].name, range.min, range.max)}`}
          onPress={() => setEditing(true)}
          style={({ pressed }) => [styles.rangeBox, { borderColor: error ? colors.danger.fg : colors.lamp.mid }, pressed && styles.pressed]}
        >
          <AppText style={styles.rangeValue} color={error ? colors.danger.fg : colors.lamp.core}>
            {`${range.min}–${range.max === undefined ? '∞' : range.max}`}
          </AppText>
          <ChevronDown size={14} color={colors.lamp.core} />
        </Pressable>
      ) : (
        <Stepper
          value={String(count)}
          valueColor={error ? colors.danger.fg : colors.text1}
          onMinus={() => onChange(count - 1)}
          onPlus={() => onChange(count + 1)}
          minusDisabled={count <= 0}
          plusDisabled={!!full || count >= limit}
        />
      )}

      <View accessibilityRole="radiogroup" style={styles.segment}>
        {(['none', 'fixed', 'random'] as const).map((m) => (
          <Pressable
            key={m}
            accessibilityRole="radio"
            accessibilityState={{ selected: mode === m }}
            onPress={() => setMode(m)}
            style={[styles.segmentItem, mode === m && styles.segmentOn]}
          >
            <AppText numberOfLines={1} adjustsFontSizeToFit color={mode === m ? (m === 'random' ? colors.lamp.core : colors.text1) : colors.text2} style={styles.segmentText}>
              {m === 'none' ? t.setup.none : m === 'fixed' ? t.setup.fixed : t.setup.random}
            </AppText>
          </Pressable>
        ))}
      </View>

      <RoleInfoSheet roleId={roleId} visible={infoOpen} onClose={() => setInfoOpen(false)} />
      {range ? (
        <RangeSheet
          roleId={roleId}
          visible={editing}
          min={range.min}
          max={range.max}
          limit={cap}
          full={!!full}
          onChange={(min, max) => onChange({ min, max })}
          onClose={() => setEditing(false)}
        />
      ) : null}
    </View>
  );
}

type Mode = 'none' | 'fixed' | 'random';

const styles = StyleSheet.create({
  card: { gap: space[3], padding: space[3], borderRadius: radius.md, borderWidth: 2, backgroundColor: colors.surface1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[2], minHeight: 48 },
  faded: { opacity: 0.55 },
  name: { flex: 1 },
  info: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  noneBox: {
    minHeight: 36,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeBox: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    borderRadius: radius.pill,
    borderWidth: 1.5,
    backgroundColor: colors.bg0,
  },
  pressed: { backgroundColor: colors.surface3 },
  rangeValue: { fontFamily: fonts.bodyBold, fontSize: 15, fontVariant: ['tabular-nums'] },
  segment: { flexDirection: 'row', height: 30, padding: 2, borderRadius: radius.pill, backgroundColor: colors.bg0, borderWidth: 1, borderColor: colors.line },
  segmentItem: { flex: 1, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  segmentOn: { backgroundColor: colors.wood },
  segmentText: { fontFamily: fonts.bodyBold, fontSize: 11, lineHeight: 14 },
});
