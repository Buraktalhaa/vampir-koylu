import { type ReactNode, useState } from 'react';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { type PickerItem, PlayerPicker } from '@/components/player/PlayerPicker';
import { Screen } from '@/components/ui/Screen';
import type { Phase, PlayerId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors } from '@/theme/tokens';

import { ActionBar } from '@/components/ui/ActionBar';

type TargetPickerProps = {
  phase: Phase;
  header: ReactNode;
  pill?: ReactNode;
  question: string;
  hint?: string;
  items: PickerItem[];
  /** Kaç oyuncu seçilecek (ör. Dedektif: 2). Varsayılan: 1 */
  count?: 1 | 2;
  onConfirm: (id: PlayerId, secondId?: PlayerId) => void;
  /** Verilmezse pas geçilemez (zorunlu seçim). */
  onPass?: () => void;
};

/** Ortak hedef şablonu: gece yetenekleri, gizli oy ve intikam. Önce kutucuk seçilir, sonra onaylanır. */
export function TargetPicker({ phase, header, pill, question, hint, items, count = 1, onConfirm, onPass }: TargetPickerProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<PlayerId[]>([]);
  const nameOf = (id: PlayerId) => items.find((i) => i.player.id === id)?.player.name ?? '';
  const ready = selected.length === count;
  // Seçili olana dokununca bırakır; doluysa en eski seçimin yerine geçer.
  const toggle = (id: PlayerId) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id].slice(-count)));
  return (
    <Screen
      phase={phase}
      footer={
        <ActionBar
          secondary={onPass ? <Button label={t.game.pass} variant="secondary" onPress={onPass} /> : undefined}
          primary={
            <Button
              label={selected.length ? t.game.confirmWith(selected.map(nameOf).join(' & ')) : t.game.confirm}
              phase={phase}
              disabled={!ready}
              onPress={() => ready && onConfirm(selected[0], selected[1])}
            />
          }
        />
      }
    >
      {header}
      {pill}
      <AppText variant="h2">{question}</AppText>
      {hint ? (
        <AppText variant="small" color={colors.text2}>
          {hint}
        </AppText>
      ) : null}
      <PlayerPicker items={items} selectedIds={selected} onSelect={toggle} phase={phase} />
    </Screen>
  );
}
