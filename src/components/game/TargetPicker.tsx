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
  onConfirm: (id: PlayerId) => void;
  /** Verilmezse pas geçilemez (zorunlu seçim). */
  onPass?: () => void;
};

/** Ortak hedef şablonu: gece yetenekleri, gizli oy ve intikam. Önce kutucuk seçilir, sonra onaylanır. */
export function TargetPicker({ phase, header, pill, question, hint, items, onConfirm, onPass }: TargetPickerProps) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<PlayerId>();
  const selectedName = items.find((i) => i.player.id === selected)?.player.name;
  return (
    <Screen
      phase={phase}
      footer={
        <ActionBar
          secondary={onPass ? <Button label={t.game.pass} variant="secondary" onPress={onPass} /> : undefined}
          primary={
            <Button
              label={selectedName ? t.game.confirmWith(selectedName) : t.game.confirm}
              phase={phase}
              disabled={!selected}
              onPress={() => selected && onConfirm(selected)}
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
      <PlayerPicker items={items} selectedId={selected} onSelect={setSelected} phase={phase} />
    </Screen>
  );
}
