import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { fonts } from '../../theme/tokens';

interface MonoProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  children: ReactNode;
  style?: CSSProperties;
  as?: 'span' | 'div';
}

const baseStyle: CSSProperties = {
  fontFamily: fonts.mono,
  fontVariantNumeric: 'tabular-nums',
  fontFeatureSettings: '"tnum"',
};

export function Mono({ children, style, as = 'span', ...rest }: MonoProps) {
  const Tag = as;
  return (
    <Tag style={{ ...baseStyle, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
