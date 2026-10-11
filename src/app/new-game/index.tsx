import { router } from 'expo-router';
import { ChevronRight, Plus, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ErrorBox } from '@/components/ErrorBox';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import { colors, DEFAULT_PHASE, fonts, MAX_FONT_SCALE, phases, radius, space, touch } from '@/theme/tokens';

const MIN_PLAYERS = 3;
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
        <TextInput
          ref={inputRef}
          value={input}
          onChangeText={(v) => {
            setInput(v);
            setDuplicate(false);
          }}
          onSubmitEditing={addName}
          placeholder={t.setup.namePlaceholder}
          placeholderTextColor={colors.text3}
          returnKeyType="done"
          submitBehavior="submit"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={[styles.input, duplicate && styles.inputError]}
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

      <View style={styles.list}>
        {names.map((name) => (
          <View key={name} style={styles.row}>
            <PlayerAvatar name={name} size={28} />
            <AppText variant="button" style={styles.flex} numberOfLines={1}>
              {name}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${name} ×`}
              onPress={() => updateDraft({ names: names.filter((n) => n !== name) })}
              style={styles.remove}
            >
              <X size={18} color={colors.text3} />
            </Pressable>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontWeight: '700', color: colors.text1 },
  inputRow: { flexDirection: 'row', gap: space[2] },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface1,
    color: colors.text1,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  inputError: { borderColor: colors.danger.fg },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: accent.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  list: { gap: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: 52,
    paddingLeft: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  remove: { width: touch.min, height: touch.min, alignItems: 'center', justifyContent: 'center' },
});
