import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { PuppetLight } from '@/components/art/PuppetLight';
import type { RoleId } from '@/game/roles';
import { inlayColor, paintTeam, PORTRAITS } from '@/theme/portraits';
import type { Backdrop } from '@/theme/tokens';

type Props = {
  roleId: RoleId;
  size?: number;
  /** lamp: gündüz / menü / rol açılışı · night: gece ekranları */
  backdrop?: Backdrop;
  /** Takımı ele vermemesi gereken yerlerde (devir, oylama) kakma ve halka nötr. */
  hidden?: boolean;
};

/** Karakter madalyonu: yuvarlak perde + küçük kukla silueti + takım renginde halka. Tüm küçük boyutlar (40–84) tek bileşen. */
export function RolePortrait({ roleId, size = 56, backdrop = 'lamp', hidden }: Props) {
  const inlay = inlayColor(roleId, hidden);
  const xml = useMemo(() => paintTeam(PORTRAITS[roleId].small, inlay), [roleId, inlay]);
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2, borderColor: inlay, borderWidth: size >= 72 ? 3 : 2 }]}>
      <PuppetLight backdrop={backdrop} />
      <SvgXml xml={xml} width="100%" height="100%" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
