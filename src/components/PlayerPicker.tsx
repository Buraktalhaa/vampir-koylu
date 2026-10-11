import { Check, Lock, Skull } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Phase, Player, PlayerId } from '@/game/types';
import { colors, phases, radius, space } from '@/theme/tokens';

import { AppText } from './AppText';
import { PlayerAvatar } from './PlayerAvatar';

export type PickerItem = {
  player: Player;
  /** Seçilemezse nedeni (hücrede görünür). */
  disabledReason?: string;
  /** İsmin altında bilgi notu (ör. "Selin'in seçimi", "Sen"). */
  note?: string;
  /** Sol üst köşede küçük sayı (ör. takım arkadaşlarının oy sayısı). */
  count?: number;
  /** Sağ üst köşede rozet (ör. takım arkadaşının rol madalyonu). Kilit ikonunun yerine geçer. */
  badge?: React.ReactNode;
  /** Hücrenin altına eklenecek içerik. */
  trailing?: React.ReactNode;
};

type Props = {
  items: PickerItem[];
  selectedId?: PlayerId;
  onSelect?: (id: PlayerId) => void;
  phase: Phase;
  /** Satır başına hücre. Verilmezse oyuncu sayısına göre 3 ya da 4. */
  columns?: number;
};

/** Oyuncu ızgarası: kart hücrelerde yuvarlak avatar. Seçili / seçilemez / ölü / rozet durumları. */
export function PlayerPicker({ items, selectedId, onSelect, phase, columns }: Props) {
  const { accent, selectBg } = phases[phase];
  const cols = columns ?? (items.length > 9 ? 4 : 3);
  const compact = cols >= 4;
  return (
    <View style={styles.grid}>
      {items.map(({ player, disabledReason, note, count, badge, trailing }) => {
        const selected = player.id === selectedId;
        const dead = !player.alive;
        const disabled = !!disabledReason || dead || !onSelect;
        return (
          <View key={player.id} style={[styles.cell, { width: `${100 / cols}%` }]}>
            <Pressable
              accessibilityRole={onSelect ? 'radio' : undefined}
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={[player.name, disabledReason, note].filter(Boolean).join(', ')}
              disabled={disabled}
              onPress={() => onSelect?.(player.id)}
              style={({ pressed }) => [
                styles.card,
                compact && styles.cardCompact,
                selected && { borderColor: accent, borderWidth: 2, backgroundColor: selectBg },
                (disabledReason || dead) && styles.cardOff,
                pressed && styles.pressed,
              ]}
            >
              <PlayerAvatar name={player.name} size={compact ? 32 : 40} dimmed={dead || !!disabledReason} />
              <AppText
                variant={compact ? 'caption' : 'button'}
                numberOfLines={1}
                color={dead || disabledReason ? colors.text3 : colors.text1}
                style={[styles.center, dead && styles.strike]}
              >
                {player.name}
              </AppText>
              {disabledReason || note ? (
                <AppText variant="caption" numberOfLines={2} color={colors.text3} style={styles.center}>
                  {disabledReason ?? note}
                </AppText>
              ) : null}

              {count ? (
                <View style={[styles.corner, styles.left]}>
                  <AppText variant="caption">{count}</AppText>
                </View>
              ) : null}
              {selected ? (
                <View style={[styles.corner, styles.right, { backgroundColor: accent }]}>
                  <Check size={13} color={colors.textInverse} strokeWidth={3} />
                </View>
              ) : dead ? (
                <View style={[styles.corner, styles.right]}>
                  <Skull size={12} color={colors.text2} />
                </View>
              ) : badge ? (
                <View style={[styles.cornerBare, styles.right]}>{badge}</View>
              ) : disabledReason ? (
                <View style={[styles.corner, styles.right]}>
                  <Lock size={11} color={colors.text2} />
                </View>
              ) : null}
            </Pressable>
            {trailing}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  cell: { padding: 5 },
  card: {
    minHeight: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
    paddingVertical: space[2],
    paddingHorizontal: space[1],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  cardCompact: { minHeight: 76, paddingVertical: space[2] },
  cardOff: { borderStyle: 'dashed', backgroundColor: 'transparent' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  center: { textAlign: 'center' },
  strike: { textDecorationLine: 'line-through' },
  corner: {
    position: 'absolute',
    top: 6,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surface3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerBare: { position: 'absolute', top: 4 },
  left: { left: 6 },
  right: { right: 6 },
});
