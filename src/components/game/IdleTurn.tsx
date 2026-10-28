import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Scene } from '@/components/art/Scene';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useCountdown } from '@/hooks/useCountdown';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, fonts, phases, radius, space } from '@/theme/tokens';

/** Yeteneği olmayan oyuncunun gece ekranında bekleme süresi; kimin ne kadar düşündüğü belli olmasın. */
const SLEEP_SECONDS = 3;

type IdleProps = { header: ReactNode; summary: ReactNode; text: string; wait: boolean; onDone: () => void };

/**
 * Bu gece yapacak bir şeyi olmayan oyuncu (tasarım 12). Yetenekli oyuncunun ekranıyla aynı iskelet: rol satırı, yönerge,
 * altta seçim. Gecelerde kısa bir bekleme var (kimin ne kadar düşündüğü belli olmasın); sonra iki şıklı soruda
 * bir şık seçilince ekran kapanır. Cevap kaydedilmez. Rol açılışında beklemeden seçilebilir.
 */
export function Idle({ header, summary, text, wait, onDone }: IdleProps) {
  const { t } = useLanguage();
  const { remaining } = useCountdown(wait ? SLEEP_SECONDS : 0, () => {});
  const [quiz] = useState(() => t.quiz[Math.floor(Math.random() * t.quiz.length)]);
  const waiting = wait && remaining > 0;
  const night = phases.night;
  return (
    <Screen phase="night" backdrop={<IdleBackdrop />} footer={<AppText variant="small" color={night.text2} style={styles.center}>{t.game.pickToClose}</AppText>}>
      {header}
      {summary}
      <AppText>{text}</AppText>
      {wait ? (
        <View style={[styles.card, styles.waitRow]}>
          <MiniRing remaining={remaining} total={SLEEP_SECONDS} />
          <AppText variant="small" color={night.text2} style={styles.flex1}>
            {t.game.optionsSoon}
          </AppText>
        </View>
      ) : null}
      <View style={styles.spacer} />
      <View style={[styles.card, styles.quiz]}>
        <AppText variant="caption" color={night.text2}>
          {t.game.quizTitle.toLocaleUpperCase('tr')}
        </AppText>
        <AppText variant="h2">{quiz.q}</AppText>
        <View style={styles.options}>
          {(['a', 'b'] as const).map((key) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityState={{ disabled: waiting }}
              disabled={waiting}
              onPress={onDone}
              style={({ pressed }) => [styles.option, waiting && styles.off, pressed && styles.pressed]}
            >
              <AppText variant="caption" color={night.text2}>
                {key.toUpperCase()}
              </AppText>
              <AppText style={styles.optionText}>{quiz[key]}</AppText>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

/** Gece bekleme zemini: soluk mezarlık sahnesi, üstü koyulaşır ki metin okunsun. */
function IdleBackdrop() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: phases.night.bg }]}>
      <Scene id="night-3" style={styles.scene} />
    </View>
  );
}

/** Küçük geri sayım halkası (52 px). */
function MiniRing({ remaining, total }: { remaining: number; total: number }) {
  const size = 52;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={phases.night.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.moon}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - remaining / total)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <AppText variant="h2">{remaining}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  flex1: { flex: 1 },
  spacer: { minHeight: space[14] * 2 },
  scene: { opacity: 0.55 },
  card: {
    padding: space[4],
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: phases.night.border,
    backgroundColor: phases.night.surface,
  },
  waitRow: { flexDirection: 'row', alignItems: 'center', gap: space[4] },
  quiz: { gap: space[3] },
  options: { flexDirection: 'row', gap: space[3] },
  option: {
    flex: 1,
    minHeight: 88,
    gap: space[1],
    paddingHorizontal: space[2],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#4A3F7A',
    backgroundColor: phases.night.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { textAlign: 'center', fontFamily: fonts.bodyBold },
  off: { opacity: 0.5 },
  pressed: { backgroundColor: phases.night.mist },
});
