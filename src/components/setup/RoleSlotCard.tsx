import { Dices, Info, Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { RoleInfoSheet } from '@/components/role/RoleInfoSheet';
import { RolePortrait } from '@/components/role/RolePortrait';
import { RoleWatermark } from '@/components/role/RoleWatermark';
import { RangeSheet } from '@/components/setup/RangeSheet';
import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
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
  const { line } = TEAM_VISUALS[ROLES[roleId].team];
  const range = randomRange(slot);
  // "Yok" kayıtta 0 olarak tutulur (undefined = bu karakter kurulumda hiç yoktu, ör. sonradan eklendi).
  const isNone = slot === undefined || slot === 0;
  const count = typeof slot === 'number' ? slot : 0;
  const cap = Math.max(0, Math.min(limit, players));
  const [editing, setEditing] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <View style={[styles.card, { borderColor: error ? colors.danger.fg : line }]}>
      <RoleWatermark roleId={roleId} size={104} />
      <View style={styles.head}>
        <RolePortrait roleId={roleId} size={48} />
        <AppText variant="button" numberOfLines={1} style={styles.name}>
          {t.roles[roleId].name}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t.roles[roleId].name}: ${t.game.moreInfo}`}
          onPress={() => setInfoOpen(true)}
          hitSlop={8}
          style={styles.info}
        >
          <Info size={16} color={colors.text2} />
        </Pressable>
      </View>

      {range ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t.setup.rangeEdit}: ${t.setup.rangeSentence(t.roles[roleId].name, range.min, range.max)}`}
          onPress={() => setEditing(true)}
          style={({ pressed }) => [styles.rangeBox, pressed && styles.rangePressed]}
        >
          <View style={styles.rangeRow}>
            <Dices size={18} color={colors.text2} />
            <AppText variant="h2" color={error ? colors.danger.fg : colors.text1} style={styles.rangeValue}>
              {`${range.min} – ${range.max === undefined ? '∞' : range.max}`}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.text3}>
            {t.setup.rangeEdit}
          </AppText>
        </Pressable>
      ) : (
        <View style={styles.counter}>
          <IconButton icon={Minus} label="−" variant="plain" size={44} onPress={count > 0 ? () => onChange(count - 1) : undefined} />
          <AppText variant="h1" color={error ? colors.danger.fg : isNone ? colors.text3 : colors.text1} style={styles.value}>
            {count}
          </AppText>
          <IconButton icon={Plus} label="+" variant="plain" size={44} onPress={!full && count < limit ? () => onChange(count + 1) : undefined} />
        </View>
      )}

      <View style={styles.toggles}>
        <Toggle label={t.setup.none} selected={isNone} onPress={() => onChange(0)} />
        <Toggle label={t.setup.random} icon selected={!!range} onPress={() => onChange(range ? slot : { min: 0 })} />
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
  card: { gap: space[3], padding: space[3], borderRadius: radius.md, borderWidth: 1, backgroundColor: colors.surface1, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  name: { flex: 1 },
  info: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 76,
    borderRadius: radius.sm,
    backgroundColor: colors.bg1,
  },
  value: { fontVariant: ['tabular-nums'] },
  // Rastgele: iki satır (en az / en çok); sabit sayaçla aynı yükseklikte, kart boyu değişmesin.
  rangeBox: {
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.bg1,
    paddingHorizontal: space[2],
  },
  rangePressed: { backgroundColor: colors.surface3 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  rangeValue: { fontVariant: ['tabular-nums'] },
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
