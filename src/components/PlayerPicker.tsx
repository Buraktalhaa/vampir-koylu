import { Check, Lock, Skull } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Phase, Player, PlayerId } from '@/game/types';
import { colors, phases, radius, space } from '@/theme/tokens';

import { AppText } from './AppText';

export type PickerItem = {
  player: Player;
  /** Seçilemezse nedeni (ekranda görünür). */
  disabledReason?: string;
  /** Avatarın altında gösterilecek ek içerik (ör. oy sayacı). */
  trailing?: React.ReactNode;
  /** Avatarın köşesinde küçük rozet (ör. takım arkadaşının rol madalyonu). */
  badge?: React.ReactNode;
};

type Props = {
  items: PickerItem[];
  selectedId?: PlayerId;
  onSelect?: (id: PlayerId) => void;
  phase: Phase;
  /** Satır başına oyuncu sayısı. */
  columns?: number;
};

const AVATAR = 68;

/** Oyuncular yuvarlak avatarlarla ızgara halinde. Seçili, seçilemez, ölü ve rozet durumlarını gösterir. */
export function PlayerPicker({ items, selectedId, onSelect, phase, columns = 3 }: Props) {
  const { accent, selectBg } = phases[phase];
  return (
    <View style={styles.grid}>
      {items.map(({ player, disabledReason, trailing, badge }) => {
        const selected = player.id === selectedId;
        const disabled = !!disabledReason || !player.alive || !onSelect;
        const dimmed = !!disabledReason || !player.alive;
        return (
          <View key={player.id} style={[styles.cell, { width: `${100 / columns}%` }]}>
            <Pressable
              accessibilityRole={onSelect ? 'radio' : undefined}
              accessibilityState={{ selected, disabled }}
              accessibilityLabel={disabledReason ? `${player.name}, ${disabledReason}` : player.name}
              disabled={disabled}
              onPress={() => onSelect?.(player.id)}
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
            >
              <View
                style={[
                  styles.avatar,
                  selected && { borderColor: accent, borderWidth: 3, backgroundColor: selectBg },
                  disabledReason && styles.avatarDisabled,
                  dimmed && styles.dimmed,
                ]}
              >
                <AppText variant="h1" color={selected ? accent : colors.text1}>
                  {player.name.charAt(0).toLocaleUpperCase('tr')}
                </AppText>
                {selected ? (
                  <View style={[styles.corner, styles.cornerRight, { backgroundColor: accent }]}>
                    <Check size={14} color={colors.textInverse} strokeWidth={3} />
                  </View>
                ) : null}
                {!player.alive ? (
                  <View style={[styles.corner, styles.cornerRight]}>
                    <Skull size={14} color={colors.text2} />
                  </View>
                ) : disabledReason && !badge ? (
                  <View style={[styles.corner, styles.cornerRight]}>
                    <Lock size={12} color={colors.text2} />
                  </View>
                ) : null}
              </View>
              {badge ? <View style={styles.badge}>{badge}</View> : null}
              <AppText
                variant="button"
                numberOfLines={1}
                color={player.alive ? colors.text1 : colors.text3}
                style={[styles.name, !player.alive && styles.strike]}
              >
                {player.name}
              </AppText>
              {disabledReason ? (
                <AppText variant="caption" numberOfLines={2} color={colors.text3} style={styles.center}>
                  {disabledReason}
                </AppText>
              ) : null}
            </Pressable>
            {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -space[1] },
  cell: { paddingHorizontal: space[1], paddingVertical: space[2], alignItems: 'center' },
  item: { alignItems: 'center', gap: space[1], width: '100%' },
  pressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDisabled: { borderStyle: 'dashed' },
  dimmed: { opacity: 0.5 },
  corner: {
    position: 'absolute',
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.surface3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg1,
  },
  cornerRight: { right: -2 },
  // Rozet avatarın sol alt köşesinde; avatar soluk olsa da net görünür.
  badge: { position: 'absolute', top: AVATAR - 26, left: '50%', marginLeft: -AVATAR / 2 - 4 },
  name: { textAlign: 'center', maxWidth: '100%' },
  center: { textAlign: 'center' },
  strike: { textDecorationLine: 'line-through' },
  trailing: { marginTop: space[2] },
});
