import { type CSSProperties, type ReactNode } from 'react';
import { colors, fonts } from '../../theme/tokens';

interface LabelProps {
  children: ReactNode;
  style?: CSSProperties;
  size?: 'micro' | 'default';
  tone?: 'mute' | 'dim' | 'text' | 'accent';
}

export function Label({
  children,
  style,
  size = 'default',
  tone = 'mute',
}: LabelProps) {
  const toneColor =
    tone === 'accent'
      ? colors.accent
      : tone === 'text'
        ? colors.text
        : tone === 'dim'
          ? colors.textDim
          : colors.textMute;
  const sizePx = size === 'micro' ? 9 : 10;
  const tracking = size === 'micro' ? 1.2 : 1.4;
  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: sizePx,
        letterSpacing: tracking,
        color: toneColor,
        textTransform: 'uppercase',
        fontWeight: 500,
        lineHeight: 1.2,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
