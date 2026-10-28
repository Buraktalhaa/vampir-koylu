import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight, Crosshair, DoorOpen, Eye, GitCompare, HeartPulse, Shield, ShieldHalf, Skull, Sparkles, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { PuppetLight } from '@/components/art/PuppetLight';
import type { Icon } from '@/components/icons/types';
import { RoleFigure } from '@/components/role/RoleFigure';
import { ROLE_ORDER } from '@/components/role/roleOrder';
import { TeamBadge } from '@/components/role/TeamBadge';
import { AppText } from '@/components/ui/AppText';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { ROLES, type RoleId } from '@/game/roles';
import type { EffectKind } from '@/game/types';
import { getStrings } from '@/i18n';
import { abilityTags } from '@/i18n/abilityTags';
import { useLanguage } from '@/i18n/LanguageProvider';
import { specialTraits, winCondition } from '@/i18n/roleTraits';
import { PhaseProvider } from '@/theme/PhaseContext';
import { colors, fonts, gutter, phases, puppet, radius, space } from '@/theme/tokens';

const EFFECT_ICON: Record<EffectKind, Icon> = {
  protect: Shield,
  protectAll: Shield,
  guard: ShieldHalf,
  visit: DoorOpen,
  kill: Skull,
  investigate: Eye,
  compare: GitCompare,
  revive: HeartPulse,
  mark: Crosshair,
};

/** Üstteki kandil perdesinin yüksekliği (tasarım 09). */
const HERO = 400;

/**
 * Karakter detayı (tasarım 09): tam ekran; üstte kandil perdesi önünde hareketli kukla, altında ad, yetenekler,
 * kazanma koşulu ve özel durumlar. Sağa-sola kaydırarak (ya da ‹ › ile) ansiklopedi sırasıyla karakterler arasında gezilir.
 */
export default function RoleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const start = Math.max(0, ROLE_ORDER.indexOf(id as RoleId));
  const [index, setIndex] = useState(start);
  const list = useRef<FlatList<RoleId>>(null);
  const go = (next: number) => {
    const i = Math.min(ROLE_ORDER.length - 1, Math.max(0, next));
    list.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  return (
    <PhaseProvider value="day">
      <View style={styles.root}>
        <FlatList
          ref={list}
          data={ROLE_ORDER}
          keyExtractor={(roleId) => roleId}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={start}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          windowSize={3}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item, index: i }) => <RolePage roleId={item} width={width} active={i === index} topInset={insets.top} />}
        />

        <View style={[styles.topBar, { top: insets.top + space[2] }]} pointerEvents="box-none">
          <RoundButton icon={X} label={t.encyclopedia.close} onPress={() => router.back()} />
          <View style={styles.dots}>
            {ROLE_ORDER.map((roleId, i) => (
              <View key={roleId} style={[styles.dot, i === index && styles.dotOn]} />
            ))}
          </View>
          <AppText variant="caption" color={colors.textInverse} style={styles.counter}>
            {`${index + 1}/${ROLE_ORDER.length}`}
          </AppText>
        </View>
        <View style={[styles.arrows, { top: insets.top + HERO / 2 - 22 }]} pointerEvents="box-none">
          {index > 0 ? <RoundButton icon={ChevronLeft} label={t.encyclopedia.prev} onPress={() => go(index - 1)} /> : <View />}
          {index < ROLE_ORDER.length - 1 ? <RoundButton icon={ChevronRight} label={t.encyclopedia.next} onPress={() => go(index + 1)} /> : null}
        </View>
      </View>
    </PhaseProvider>
  );
}

/** Tek karakterin sayfası; yalnız görünen sayfanın kuklası oynar. */
function RolePage({ roleId, width, active, topInset }: { roleId: RoleId; width: number; active: boolean; topInset: number }) {
  const { t, language } = useLanguage();
  const role = ROLES[roleId];
  const text = t.roles[roleId];
  const other = getStrings(language === 'tr' ? 'en' : 'tr').roles[roleId].name;
  const inlay = puppet.team[role.team];
  const traits = specialTraits(role, t);

  return (
    <ScrollView style={{ width }} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { height: HERO + topInset, paddingTop: topInset }]}>
        <PuppetLight backdrop="lamp" />
        <RoleFigure roleId={roleId} width={240} animated={active} framed={false} />
        <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 10 10" pointerEvents="none">
          <Defs>
            <LinearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0.78" stopColor={phases.day.bg} stopOpacity={0} />
              <Stop offset="1" stopColor={phases.day.bg} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect width="10" height="10" fill="url(#hero-fade)" />
        </Svg>
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <View style={styles.flex1}>
            <AppText variant="display" numberOfLines={2}>
              {text.name.toLocaleUpperCase(language)}
            </AppText>
            <AppText color={colors.text2} style={styles.otherName}>
              {other}
            </AppText>
          </View>
          <TeamBadge team={role.team} />
        </View>
        <AppText style={styles.lead}>{text.description}</AppText>

        {role.abilities.map((ability) => {
          const AbilityIcon = EFFECT_ICON[ability.effect] ?? Sparkles;
          const copy = text.abilities?.[ability.id];
          return (
            <View key={ability.id} style={styles.card}>
              <AppText variant="caption" color={colors.text2}>
                {t.encyclopedia.ability.toLocaleUpperCase(language)}
              </AppText>
              <View style={styles.abilityRow}>
                <View style={[styles.abilityIcon, { borderColor: inlay, backgroundColor: `${inlay}29` }]}>
                  <AbilityIcon size={20} color={inlay} />
                </View>
                <View style={styles.flex1}>
                  <AppText style={styles.abilityName}>{copy?.name ?? ability.id}</AppText>
                  {copy?.description ? (
                    <AppText variant="small" color={colors.text2}>
                      {copy.description}
                    </AppText>
                  ) : null}
                  <ChipRow>
                    {abilityTags(ability, t).map((tag) => (
                      <Chip key={tag} label={tag} />
                    ))}
                  </ChipRow>
                </View>
              </View>
            </View>
          );
        })}

        <Section title={t.roleTraits.winSection}>
          <AppText>{winCondition(role, t)}</AppText>
        </Section>
        {traits.length ? (
          <Section title={t.roleTraits.specialSection}>
            {traits.map((line) => (
              <AppText key={line}>• {line}</AppText>
            ))}
          </Section>
        ) : null}
        {text.tip ? (
          <Section title={t.encyclopedia.tip}>
            <AppText color={colors.text2}>{text.tip}</AppText>
          </Section>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { language } = useLanguage();
  return (
    <View style={styles.section}>
      <AppText variant="caption" color={colors.text2}>
        {title.toLocaleUpperCase(language)}
      </AppText>
      {children}
    </View>
  );
}

/** Yarı saydam yuvarlak düğme (kapat, önceki / sonraki). */
function RoundButton({ icon: IconComponent, label, onPress }: { icon: Icon; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={6} style={({ pressed }) => [styles.round, pressed && styles.roundPressed]}>
      <IconComponent size={22} color={colors.text1} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: phases.day.bg },
  flex1: { flex: 1 },
  page: { paddingBottom: space[14] },
  hero: { justifyContent: 'flex-end', alignItems: 'center', overflow: 'hidden' },
  body: { paddingHorizontal: gutter, gap: space[4], marginTop: -space[6] },
  nameRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space[3] },
  otherName: { fontFamily: fonts.bodyItalic, fontSize: 15 },
  lead: { fontSize: 17, lineHeight: 25 },
  card: { gap: space[3], padding: space[4], borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface1 },
  abilityRow: { flexDirection: 'row', gap: space[3] },
  abilityIcon: { width: 40, height: 40, borderRadius: radius.pill, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  abilityName: { fontFamily: fonts.bodyBold, marginBottom: 2 },
  section: { gap: space[2] },
  topBar: { position: 'absolute', left: gutter - space[1], right: gutter, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 5, flex: 1, paddingHorizontal: space[3] },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(26, 13, 7, 0.35)' },
  dotOn: { width: 18, backgroundColor: colors.textInverse },
  counter: { minWidth: 44, textAlign: 'right' },
  arrows: { position: 'absolute', left: space[3], right: space[3], flexDirection: 'row', justifyContent: 'space-between' },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(26, 13, 7, 0.45)', alignItems: 'center', justifyContent: 'center' },
  roundPressed: { backgroundColor: 'rgba(26, 13, 7, 0.65)' },
});
