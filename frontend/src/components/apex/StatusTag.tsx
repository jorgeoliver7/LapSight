import { type ReactNode } from 'react';
import { colors, fonts } from '../../theme/tokens';

export type StatusTone =
  | 'accent'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'cyan'
  | 'mute';

const TONE_COLOR: Record<StatusTone, string> = {
  accent: colors.accent,
  green: colors.green,
  yellow: colors.yellow,
  orange: colors.orange,
  red: colors.red,
  purple: colors.purple,
  cyan: colors.cyan,
  mute: colors.textMute,
};

interface StatusTagProps {
  tone: StatusTone;
  children: ReactNode;
  dot?: boolean;
  size?: 'sm' | 'md';
}

export function StatusTag({ tone, children, dot = true, size = 'md' }: StatusTagProps) {
  const c = TONE_COLOR[tone];
  const fontSize = size === 'sm' ? 9 : 10;
  const height = size === 'sm' ? 18 : 20;
  const padX = size === 'sm' ? 6 : 8;
  return (
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize,
        fontWeight: 600,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: c,
        border: `1px solid ${c}`,
        background: `${c}14`,
        padding: `0 ${padX}px`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            background: c,
            display: 'inline-block',
            borderRadius: '50%',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
