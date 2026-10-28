import { Check, ChevronRight, Shield, Skull } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { type Ability, getRole, needsTarget, type Player, type RoleId } from '@/game';
import { useLanguage } from '@/i18n/LanguageProvider';
import { colors, phases, radius, space } from '@/theme/tokens';

import { ActionBar } from '@/components/ui/ActionBar';
import { Chip, ChipRow } from '@/components/ui/Chip';

type SpellChoiceProps = {
  header: ReactNode;
  summary: ReactNode;
  player: Player;
  available: Ability[];
  onSkip: () => void;
  onChoose: (a: Ability) => void;
};

/** Birden fazla gece yeteneği olan rol (ör. Büyücü): önce hangisini kullanacağını seçer. */
export function SpellChoice({ header, summary, player, available, onSkip, onChoose }: SpellChoiceProps) {
  const { t } = useLanguage();
  const roleId = player.roleId as RoleId;
  const texts = t.roles[roleId].abilities ?? {};
  const all = getRole(roleId).abilities.filter((a) => a.trigger === 'night');
  const [picked, setPicked] = useState<Ability>();
  const accent = phases.night.accent;
  const primaryLabel = !picked ? t.game.choose : needsTarget(picked) ? t.game.chooseTarget : t.game.useShield;

  return (
    <Screen
      phase="night"
      footer={
        <ActionBar
          secondary={<Button label={t.game.pass} variant="secondary" onPress={onSkip} />}
          primary={
            <Button
              label={primaryLabel}
              disabled={!picked}
              trailingIcon={picked && needsTarget(picked) ? ChevronRight : undefined}
              onPress={() => picked && onChoose(picked)}
            />
          }
        />
      }
    >
      {header}
      {summary}
      <AppText variant="h2">{t.game.spellQuestion}</AppText>
      <AppText variant="small" color={colors.text2}>
        {t.game.spellHint}
      </AppText>
      <View style={styles.spells}>
        {all.map((a) => {
          const usable = available.includes(a);
          const state = player.abilityState[a.id];
          const selected = picked === a;
          const kill = a.effect === 'kill';
          const fg = kill ? colors.danger.fg : colors.info.fg;
          return (
            <Pressable
              key={a.id}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: !usable }}
              disabled={!usable}
              onPress={() => setPicked(a)}
              style={[
                styles.spell,
                selected && { borderColor: accent, borderWidth: 2, backgroundColor: phases.night.selectBg },
                !usable && styles.spellUsed,
              ]}
            >
              <View style={[styles.spellIcon, { backgroundColor: kill ? colors.team.vampire.bg : colors.info.bg }]}>
                {kill ? <Skull size={18} color={fg} /> : <Shield size={18} color={fg} />}
              </View>
              <AppText variant="h3">{texts[a.id]?.name ?? a.id}</AppText>
              <AppText variant="small" color={colors.text2} style={styles.flex1}>
                {texts[a.id]?.description}
              </AppText>
              <ChipRow>
                {a.uses !== undefined ? (
                  <Chip shape="tag" color={colors.text1} label={t.game.usesOf(state?.usesLeft ?? 0, a.uses)} />
                ) : null}
                <Chip shape="tag" color={fg} label={t.abilityTags.effects[a.effect]} />
              </ChipRow>
              {selected ? (
                <View style={[styles.spellCheck, { backgroundColor: accent }]}>
                  <Check size={13} color={colors.textInverse} strokeWidth={3} />
                </View>
              ) : null}
              {!usable && state?.lastUsedRound ? (
                <View style={styles.stamp} pointerEvents="none">
                  <AppText variant="caption" color={colors.danger.fg}>
                    {t.game.usedStamp(state.lastUsedRound).toLocaleUpperCase('tr')}
                  </AppText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  spells: { flexDirection: 'row', gap: space[3] },
  spell: {
    flex: 1,
    gap: space[2],
    padding: space[3],
    borderRadius: 18,
    borderWidth: 1,
    borderColor: phases.night.border,
    backgroundColor: phases.night.surface,
    overflow: 'hidden',
  },
  spellUsed: { opacity: 0.45, borderStyle: 'dashed', backgroundColor: 'transparent' },
  spellIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  spellCheck: {
    position: 'absolute',
    top: space[3],
    right: space[3],
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    position: 'absolute',
    top: '42%',
    left: -10,
    right: -10,
    paddingVertical: 4,
    borderWidth: 2.5,
    borderColor: colors.danger.fg,
    backgroundColor: colors.bg1,
    alignItems: 'center',
    transform: [{ rotate: '-14deg' }],
  },
});
