import type { ComponentType } from 'react';

export type IconProps = { size?: number; color?: string; strokeWidth?: number };

/** Lucide ikonları ve özel çizilen ikonlar aynı arayüzü paylaşır. */
export type Icon = ComponentType<IconProps>;
