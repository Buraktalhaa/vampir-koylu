import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePhase } from '@/theme/PhaseContext';
import { colors, phases, space } from '@/theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Arka plana dokunulunca okunacak etiket (erişilebilirlik). */
  closeLabel?: string;
};

/** Alttan açılan panel: karartılmış arka plan (dokununca kapanır), tutma çizgisi, güvenli alan boşluğu. */
export function BottomSheet({ visible, onClose, children, closeLabel }: Props) {
  const insets = useSafeAreaInsets();
  const { surface, border } = phases[usePhase()];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable accessibilityLabel={closeLabel} style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + space[6], backgroundColor: surface, borderColor: border }]}>
        <View style={styles.handle} />
        {/* Uzun içerik (ör. çok yetenekli karakter) kaydırılır; panel ekranın en fazla %85'i. */}
        <ScrollView contentContainerStyle={styles.content} bounces={false} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.scrim },
  sheet: {
    maxHeight: '85%',
    gap: space[3],
    paddingHorizontal: space[5],
    paddingTop: space[3],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
  },
  content: { gap: space[4] },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.text2, opacity: 0.5 },
});
