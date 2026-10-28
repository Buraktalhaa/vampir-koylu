import { type ReactNode, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { PuppetLight } from '@/components/art/PuppetLight';
import { usePuppetMotion } from '@/components/role/usePuppetMotion';
import type { RoleId } from '@/game/roles';
import { inlayColor, paintTeam, PORTRAITS, type PuppetPart } from '@/theme/portraits';
import type { Backdrop } from '@/theme/tokens';

type Props = {
  roleId: RoleId;
  width?: number;
  backdrop?: Backdrop;
  /** Kukla parçaları (kol, baş, şapka…) sürekli sallansın mı? Hareket azaltma açıksa her zaman durur. */
  animated?: boolean;
  /** Takım renginde kemer çerçevesi (ızgara hücrelerinde kapalı). */
  framed?: boolean;
};

const VIEW_W = 240;
const VIEW_H = 320;

/**
 * Büyük kukla portresi: kemerli perde (3:4) + siluet; çerçeve takım renginde. Rol bilgisi ve ansiklopedi.
 * Hareketli portrede her parça ayrı katmandır ve çizim sırası korunur; şapka başla birlikte, alev kolla birlikte döner.
 */
export function RoleFigure({ roleId, width = 180, backdrop = 'lamp', animated = true, framed = true }: Props) {
  const inlay = inlayColor(roleId);
  const height = (width * VIEW_H) / VIEW_W;
  const portrait = PORTRAITS[roleId];
  const parts = usePuppetMotion({ enabled: animated, salute: roleId === 'mayor' });
  const layers = useMemo(
    () => portrait.layers.map((l) => ({ chain: l.chain[0] === 'hat' ? (['head', ...l.chain] as PuppetPart[]) : l.chain, xml: paintTeam(l.xml, inlay) })),
    [portrait, inlay],
  );

  /** Katmanı, onu hareket ettiren parçaların dönen kapsayıcılarına (dıştan içe) sarar. */
  const wrap = (chain: readonly PuppetPart[], child: ReactNode): ReactNode =>
    chain.reduceRight<ReactNode>((inner, part) => {
      const [px, py] = portrait.pivots[part] ?? portrait.pivots.head ?? [VIEW_W / 2, VIEW_H / 2];
      const origin = { transformOrigin: [(px / VIEW_W) * width, (py / VIEW_H) * height, 0] };
      return <Animated.View style={[StyleSheet.absoluteFill, origin, parts[part]]}>{inner}</Animated.View>;
    }, child);

  return (
    <View
      style={[
        styles.arch,
        { width, height, borderTopLeftRadius: width / 2, borderTopRightRadius: width / 2, borderColor: inlay },
        !framed && styles.bare,
      ]}
    >
      <PuppetLight backdrop={backdrop} />
      {animated ? (
        layers.map((l, i) => <View key={i} style={StyleSheet.absoluteFill}>{wrap(l.chain, <SvgXml xml={l.xml} width={width} height={height} />)}</View>)
      ) : (
        <SvgXml xml={paintTeam(portrait.large, inlay)} width={width} height={height} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  arch: { overflow: 'hidden', borderWidth: 2, borderBottomWidth: 0, alignSelf: 'center' },
  bare: { borderWidth: 0, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
});
