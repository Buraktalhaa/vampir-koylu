import { router } from 'expo-router';
import { ChevronRight, Plus, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ErrorBox } from '@/components/ui/ErrorBox';
import { PlayerAvatar } from '@/components/player/PlayerAvatar';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SortableGrid } from '@/components/ui/SortableGrid';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import { colors, DEFAULT_PHASE, phases, radius, space } from '@/theme/tokens';
import { TextField } from '@/components/ui/TextField';

const MIN_PLAYERS = 3;
/** Oyuncu hücresi: 64 avatar + isim + boşluklar. */
const PLAYER_CELL_HEIGHT = 116;
const accent = phases[DEFAULT_PHASE];

/** Türkçe büyük/küçük harf duyarsız karşılaştırma (İ/i, I/ı). */
const sameName = (a: string, b: string) => a.toLocaleLowerCase('tr') === b.toLocaleLowerCase('tr');

/** Kurulum 1/3: oyuncular. */
export default function PlayersStep() {
  const { t } = useLanguage();
  const { draft, updateDraft } = useGame();
  const { names } = draft;
  const [input, setInput] = useState('');
  const [triedNext, setTriedNext] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  // Açılıştaki liste önceki oyundan geldiyse "kaydedildi" notu gösterilir.
  const [restored] = useState(() => names.length > 0);
  const inputRef = useRef<TextInput>(null);

  const addName = () => {
    const name = input.trim();
    if (!name) return;
    if (names.some((n) => sameName(n, name))) {
      setDuplicate(true);
      return;
    }
    updateDraft({ names: [...names, name] });
    setInput('');
    setDuplicate(false);
    inputRef.current?.focus();
  };

  const missing = MIN_PLAYERS - names.length;

  return (
    <Screen
      scrollEnabled={scrollEnabled}
      footer={
        <>
          <ErrorBox errors={triedNext && missing > 0 ? [t.setup.needMore(missing)] : []} />
          <Button
            label={t.setup.next}
            trailingIcon={ChevronRight}
            onPress={() => (missing > 0 ? setTriedNext(true) : router.push('/new-game/roles'))}
          />
        </>
      }
    >
      <ScreenHeader title={t.setup.players} step={[1, 3]} stepLabel={t.setup.step(1, 3)} />
      <View style={styles.inputRow}>
        <TextField
          ref={inputRef}
          value={input}
          onChangeText={(v) => {
            setInput(v);
            setDuplicate(false);
          }}
          onSubmitEditing={addName}
          placeholder={t.setup.namePlaceholder}
          returnKeyType="done"
          submitBehavior="submit"
          error={duplicate}
        />
        <Pressable accessibilityRole="button" accessibilityLabel={t.setup.add} onPress={addName} style={styles.addBtn}>
          <Plus size={24} color={colors.textInverse} />
        </Pressable>
      </View>
      {duplicate ? (
        <AppText variant="small" color={colors.danger.fg}>
          {t.setup.duplicate}
        </AppText>
      ) : null}

      {names.length ? (
        <View style={styles.meta}>
          <AppText variant="small" color={colors.text2} style={styles.flex}>
            <AppText variant="small" style={styles.bold}>
              {t.setup.playerCount(names.length)}
            </AppText>
            {restored ? ` · ${t.setup.savedFromLast}` : ''}
          </AppText>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => updateDraft({ names: [] })}>
            <AppText variant="button" color={colors.text2}>
              {t.setup.clear}
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {names.length > 1 ? (
        <AppText variant="small" color={colors.text3}>
          {t.setup.reorderHint}
        </AppText>
      ) : null}
      <SortableGrid
        data={names}
        keyOf={(name) => name}
        columns={3}
        rowHeight={PLAYER_CELL_HEIGHT}
        onReorder={(next) => updateDraft({ names: next })}
        onDragChange={(dragging) => setScrollEnabled(!dragging)}
        renderItem={(name, dragging) => (
          <View style={styles.cell}>
            <View>
              <PlayerAvatar name={name} size={64} />
              {dragging ? null : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${name} ×`}
                  onPress={() => updateDraft({ names: names.filter((n) => n !== name) })}
                  hitSlop={10}
                  style={styles.remove}
                >
                  <X size={14} color={colors.text1} strokeWidth={2.5} />
                </Pressable>
              )}
            </View>
            <AppText variant="button" numberOfLines={1} style={styles.name}>
              {name}
            </AppText>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontWeight: '700', color: colors.text1 },
  inputRow: { flexDirection: 'row', gap: space[2] },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: accent.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  // 3 sütun: yuvarlak avatar, altında isim, köşede ✕ (sil). Basılı tutup sürükleyerek sıralanır.
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[2], paddingHorizontal: space[1] },
  name: { maxWidth: '100%', textAlign: 'center' },
  remove: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.bg1,
    backgroundColor: colors.surface3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
