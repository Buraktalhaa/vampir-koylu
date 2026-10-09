import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ErrorBox } from '@/components/ErrorBox';
import { Screen } from '@/components/Screen';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useGame } from '@/store/GameProvider';
import { colors, DEFAULT_PHASE, fonts, MAX_FONT_SCALE, phases, radius, space, touch } from '@/theme/tokens';

const MIN_PLAYERS = 3;

/** Kurulum 1/3: oyuncular. */
export default function PlayersStep() {
  const { t } = useLanguage();
  const { draft, updateDraft } = useGame();
  const { names } = draft;
  const [input, setInput] = useState('');
  const [triedNext, setTriedNext] = useState(false);

  const addName = () => {
    const name = input.trim();
    if (name && !names.includes(name)) updateDraft({ names: [...names, name] });
    setInput('');
  };

  return (
    <Screen
      title={`${t.setup.players} (${names.length})`}
      footer={
        <>
          <ErrorBox errors={triedNext && names.length < MIN_PLAYERS ? [t.setup.errors.minPlayers3] : []} />
          <Button
            label={t.setup.next}
            onPress={() => {
              if (names.length < MIN_PLAYERS) setTriedNext(true);
              else router.push('/new-game/roles');
            }}
          />
          <Button label={t.common.back} variant="secondary" onPress={() => router.back()} />
        </>
      }
    >
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addName}
          placeholder={t.setup.namePlaceholder}
          placeholderTextColor={colors.text3}
          returnKeyType="done"
          submitBehavior="submit"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={styles.input}
        />
        <Pressable accessibilityRole="button" onPress={addName} style={styles.addBtn}>
          <AppText variant="button" color={colors.textInverse}>
            {t.setup.add}
          </AppText>
        </Pressable>
      </View>
      {names.map((name, i) => (
        <View key={name} style={styles.row}>
          <AppText variant="caption" color={colors.text3} style={styles.index}>
            {i + 1}
          </AppText>
          <AppText variant="button" style={styles.name}>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', gap: space[2] },
  input: {
    flex: 1,
    minHeight: touch.button,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface1,
    color: colors.text1,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  addBtn: {
    minHeight: touch.button,
    paddingHorizontal: space[5],
    borderRadius: radius.md,
    backgroundColor: phases[DEFAULT_PHASE].accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    minHeight: touch.button,
    paddingLeft: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  index: { width: 20 },
  name: { flex: 1 },
  remove: { width: touch.button, height: touch.button, alignItems: 'center', justifyContent: 'center' },
});
