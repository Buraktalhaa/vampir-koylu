import { Eye } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { NightScene } from '@/components/art/NightScene';
import { useCountdown } from '@/hooks/useCountdown';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, phases, radius, space } from '@/theme/tokens';

/** Yeteneği olmayan oyuncunun gece ekranında bekleme süresi; kimin ne kadar düşündüğü belli olmasın. */
const SLEEP_SECONDS = 3;

type IdleProps = { header: ReactNode; summary: ReactNode; text: string; wait: boolean; onDone: () => void };

/**
 * Bu gece yapacak bir şeyi olmayan oyuncu. Gecelerde kısa bir bekleme var (kimin ne kadar düşündüğü belli olmasın);
 * rol açılışında beklemeden geçilir.
 */
export function Idle({ header, summary, text, wait, onDone }: IdleProps) {
  const { t } = useLanguage();
  const { remaining } = useCountdown(wait ? SLEEP_SECONDS : 0, () => {});
  // Herkes ekrana bir şey bassın diye basit bir soru; cevap kaydedilmez.
  const [quiz] = useState(() => t.quiz[Math.floor(Math.random() * t.quiz.length)]);
  const [answer, setAnswer] = useState<'a' | 'b'>();
  const waiting = wait && remaining > 0;
  const accent = phases.night.accent;
  return (
    <Screen
      phase="night"
      footer={
        <Button
          label={waiting ? t.game.continueIn(remaining) : wait ? t.game.continue : t.game.gotIt}
          icon={wait ? undefined : Eye}
          disabled={waiting || !answer}
          onPress={onDone}
        />
      }
    >
      {header}
      {summary}
      {wait ? <AppText variant="h2">{t.game.sleepTitle}</AppText> : null}
      <View style={styles.idleBox}>
        <AppText variant="small" color={colors.text1}>
          {text}
        </AppText>
      </View>
      <View style={styles.quiz}>
        <AppText variant="h3">{quiz.q}</AppText>
        <View style={styles.actionBar}>
          {(['a', 'b'] as const).map((key) => {
            const selected = answer === key;
            return (
              <Pressable
                key={key}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setAnswer(key)}
                style={[styles.quizOption, selected && { borderColor: accent, borderWidth: 2, backgroundColor: phases.night.selectBg }]}
              >
                <AppText variant="button" style={styles.center}>
                  {quiz[key]}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
      {wait ? <NightScene style={styles.idleScene} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  actionBar: { flexDirection: 'row', gap: 10 },
  quiz: {
    gap: space[3],
    padding: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface1,
  },
  quizOption: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: space[2],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.bg1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleScene: { height: 200, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line },
  idleBox: {
    padding: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.lineStrong,
  },
});
