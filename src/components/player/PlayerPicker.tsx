import { Check, Lock, Skull } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import type { Phase, Player, PlayerId } from '@/game/types';
import { colors, fonts, phases, radius, space } from '@/theme/tokens';

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
  /** Birden fazla seçim (ör. Dedektif'in iki hedefi). */
  selectedIds?: PlayerId[];
  onSelect?: (id: PlayerId) => void;
  phase: Phase;
  /** Satır başına hücre. Verilmezse oyuncu sayısına göre 3 ya da 4. */
  columns?: number;
};

/**
 * Oyuncu ızgarası (tasarım 04): perde önünde kukla avatar + ad. Seçili: açık halka, ışıltı, onay rozeti (ikinci hedefte "2").
 * Ölü: soluk, kesikli halka, kafatası rozeti, üstü çizili ad. Seçilemez: soluk + nedeni.
 */
export function PlayerPicker({ items, selectedId, selectedIds, onSelect, phase, columns }: Props) {
  const { accent, selectBg, text2, border } = phases[phase];
  const cols = columns ?? (items.length > 9 ? 4 : 3);
  const avatar = cols >= 4 ? 52 : 64;
  return (
    <View style={styles.grid}>
      {items.map(({ player, disabledReason, note, count, badge, trailing }) => {
        const order = selectedIds?.indexOf(player.id) ?? -1;
        const selected = player.id === selectedId || order >= 0;
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
              style={({ pressed }) => [styles.card, selected && { backgroundColor: selectBg }, disabledReason && !dead && styles.off, pressed && styles.pressed]}
            >
              <View style={selected && styles.lift}>
                <PlayerAvatar name={player.name} size={avatar} dimmed={dead} selected={selected} />
                {selected || dead || badge || disabledReason ? (
                  <View style={[styles.corner, { borderColor: selected ? accent : border, backgroundColor: selected ? accent : colors.bg0 }]}>
                    {selected ? (
                      order > 0 ? (
                        <AppText variant="caption" color={colors.textInverse}>
                          {order + 1}
                        </AppText>
                      ) : (
                        <Check size={12} color={colors.textInverse} strokeWidth={3} />
                      )
                    ) : dead ? (
                      <Skull size={11} color={text2} />
                    ) : (
                      (badge ?? <Lock size={10} color={text2} />)
                    )}
                  </View>
                ) : null}
              </View>
              <AppText
                numberOfLines={1}
                color={selected ? accent : dead || disabledReason ? text2 : colors.text1}
                style={[styles.name, selected && styles.nameSelected, dead && styles.strike]}
              >
                {player.name}
              </AppText>
              {disabledReason || note ? (
                <AppText variant="small" numberOfLines={2} color={text2} style={styles.note}>
                  {disabledReason ?? note}
                </AppText>
              ) : null}
              {count ? (
                <View style={[styles.count, { borderColor: accent }]}>
                  <AppText variant="caption" color={accent}>
                    {count}
                  </AppText>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  cell: { paddingHorizontal: 4, paddingVertical: 6 },
  card: { alignItems: 'center', gap: space[2], paddingVertical: space[3], paddingHorizontal: space[1], borderRadius: radius.md },
  off: { opacity: 0.38 },
  pressed: { opacity: 0.85 },
  lift: { transform: [{ scale: 1.04 }] },
  corner: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 3,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { textAlign: 'center', fontFamily: fonts.bodySemiBold, fontSize: 14, lineHeight: 20 },
  nameSelected: { fontFamily: fonts.bodyBold },
  note: { textAlign: 'center', fontSize: 12, lineHeight: 16 },
  strike: { textDecorationLine: 'line-through' },
  count: {
    position: 'absolute',
    top: space[2],
    left: space[2],
    minWidth: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    backgroundColor: colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
