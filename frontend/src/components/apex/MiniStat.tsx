import { type CSSProperties, type ReactNode } from 'react';
import { colors, fonts } from '../../theme/tokens';

interface MiniStatProps {
  label: string;
  value: ReactNode;
  tone?: 'text' | 'accent' | 'dim' | 'purple' | 'green' | 'red' | 'yellow' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}

const TONES: Record<string, string> = {
  text: colors.text,
  accent: colors.accent,
  dim: colors.textDim,
  purple: colors.purple,
  green: colors.green,
  red: colors.red,
  yellow: colors.yellow,
  orange: colors.orange,
};

export function MiniStat({
  label,
  value,
  tone = 'text',
  size = 'md',
  style,
}: MiniStatProps) {
  const valuePx = size === 'lg' ? 22 : size === 'md' ? 16 : 13;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, ...style }}>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 9,
          letterSpacing: '1.2px',
          color: colors.textMute,
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: valuePx,
          fontWeight: 600,
          color: TONES[tone] ?? colors.text,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}
