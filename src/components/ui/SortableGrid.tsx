import { useLayoutEffect, useState, type ReactNode } from 'react';
import { Animated, LayoutAnimation, PanResponder, StyleSheet, View, type ViewStyle } from 'react-native';

import { hapticTap } from '@/feedback/haptics';

type Props<T> = {
  data: T[];
  keyOf: (item: T) => string;
  columns: number;
  /** Her hücrenin sabit yüksekliği (konum hesabı için). */
  rowHeight: number;
  renderItem: (item: T, dragging: boolean) => ReactNode;
  onReorder: (data: T[]) => void;
  /** Sürükleme başlayınca/bitince (ör. ekran kaydırmasını kapatmak için). */
  onDragChange?: (dragging: boolean) => void;
};

/** Basılı tutunca sürüklemeye geçme süresi; daha kısa basışlar ve kaydırmalar normal davranır. */
const LONG_PRESS_MS = 250;
/** Bu kadar oynayan parmak basılı tutma değil, kaydırma sayılır. */
const MOVE_TOLERANCE = 8;

/**
 * Basılı tutup sürükleyerek sıralanabilen ızgara (dış kütüphane yok: PanResponder + Animated).
 * Sürüklerken diğer hücreler kayarak yer açar; bırakınca `onReorder` yeni sırayla çağrılır.
 */
export function SortableGrid<T>({ data, keyOf, columns, rowHeight, renderItem, onReorder, onDragChange }: Props<T>) {
  const [width, setWidth] = useState(0);
  const [drag, setDrag] = useState<{ key: string; order: string[] } | null>(null);
  const [pan] = useState(() => new Animated.ValueXY());

  const keys = data.map(keyOf);
  const order = drag?.order ?? keys;
  const cellWidth = width / columns;
  const slotOf = (index: number) => ({ left: (index % columns) * cellWidth, top: Math.floor(index / columns) * rowHeight });

  const start = (key: string) => {
    pan.setValue({ x: 0, y: 0 });
    setDrag({ key, order: keys });
    onDragChange?.(true);
    hapticTap();
  };

  const move = (key: string, dx: number, dy: number) => {
    if (!drag) return;
    pan.setValue({ x: dx, y: dy });
    const startIndex = keys.indexOf(key);
    const col = Math.min(columns - 1, Math.max(0, Math.round(((startIndex % columns) * cellWidth + dx) / cellWidth)));
    const row = Math.max(0, Math.round((Math.floor(startIndex / columns) * rowHeight + dy) / rowHeight));
    const target = Math.min(keys.length - 1, row * columns + col);
    const from = drag.order.indexOf(key);
    if (target === from) return;
    const next = [...drag.order];
    next.splice(from, 1);
    next.splice(target, 0, key);
    LayoutAnimation.configureNext(LayoutAnimation.create(160, 'easeInEaseOut', 'opacity'));
    setDrag({ key, order: next });
  };

  const end = () => {
    if (!drag) return;
    onReorder(drag.order.map((k) => data[keys.indexOf(k)]));
    pan.setValue({ x: 0, y: 0 });
    setDrag(null);
    onDragChange?.(false);
  };

  const rows = Math.ceil(data.length / columns);

  return (
    <View style={{ height: rows * rowHeight }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 &&
        data.map((item) => {
          const key = keyOf(item);
          const dragging = key === drag?.key;
          // Sürüklenen hücre başladığı yerden parmağı izler; diğerleri canlı sıradaki yerlerine geçer.
          const position = slotOf(dragging ? keys.indexOf(key) : order.indexOf(key));
          return (
            <SortableCell
              key={key}
              style={[
                styles.cell,
                { width: cellWidth, height: rowHeight, ...position },
                dragging && { zIndex: 10, transform: [...pan.getTranslateTransform(), { scale: 1.08 }] },
              ]}
              onStart={() => start(key)}
              onMove={(dx, dy) => move(key, dx, dy)}
              onEnd={end}
            >
              {renderItem(item, dragging)}
            </SortableCell>
          );
        })}
    </View>
  );
}

type CellProps = {
  style: (ViewStyle | false | Record<string, unknown>)[];
  onStart: () => void;
  onMove: (dx: number, dy: number) => void;
  onEnd: () => void;
  children: ReactNode;
};

type Handlers = Pick<CellProps, 'onStart' | 'onMove' | 'onEnd'>;

/** Hücre kimliği → en güncel geri çağırmalar. Yalnızca dokunma olaylarında okunur, render'da değil. */
const latestHandlers = new WeakMap<object, Handlers>();

/** Basılı tut → sürükle → bırak yanıtlayıcısı. Geri çağırmaları her dokunuşta tablodan taze okur. */
function createDragResponder(cellId: object) {
  const call = (name: keyof Handlers) => latestHandlers.get(cellId)?.[name] as (...args: number[]) => void;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let active = false;
  const finish = () => {
    clearTimeout(timer);
    if (active) call('onEnd')();
    active = false;
  };
  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      timer = setTimeout(() => {
        active = true;
        call('onStart')();
      }, LONG_PRESS_MS);
    },
    onPanResponderMove: (_, g) => {
      if (active) call('onMove')(g.dx, g.dy);
      else if (Math.abs(g.dx) > MOVE_TOLERANCE || Math.abs(g.dy) > MOVE_TOLERANCE) clearTimeout(timer);
    },
    onPanResponderRelease: finish,
    onPanResponderTerminate: finish,
    // Sürükleme başladıysa ekran kaydırması parmağı elimizden almasın.
    onPanResponderTerminationRequest: () => !active,
  });
}

/** Tek hücrenin dokunma yönetimi: yanıtlayıcı bir kez kurulur, geri çağırmalar her render'dan sonra tazelenir. */
function SortableCell({ style, onStart, onMove, onEnd, children }: CellProps) {
  const [cellId] = useState(() => ({}));
  const [responder] = useState(() => createDragResponder(cellId));
  useLayoutEffect(() => {
    latestHandlers.set(cellId, { onStart, onMove, onEnd });
  });

  return (
    <Animated.View {...responder.panHandlers} style={style}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cell: { position: 'absolute' },
});
