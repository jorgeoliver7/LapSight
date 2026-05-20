import { type ReactNode } from 'react';
import { colors, fonts } from '../../theme/tokens';

interface BigStatProps {
  label: string;
  value: ReactNode;
  unit?: string;
  note?: ReactNode;
  tone?: 'text' | 'accent' | 'purple' | 'green' | 'red' | 'yellow' | 'orange';
  borderTone?: 'default' | 'accent' | 'orange' | 'green';
}

const TONES: Record<string, string> = {
  text: colors.text,
  accent: colors.accent,
  purple: colors.purple,
  green: colors.green,
  red: colors.red,
  yellow: colors.yellow,
  orange: colors.orange,
};

const BORDER_TONES: Record<string, string> = {
  default: colors.border,
  accent: colors.accent,
  orange: colors.orange,
  green: colors.green,
};

export function BigStat({
  label,
  value,
  unit,
  note,
  tone = 'text',
  borderTone = 'default',
}: BigStatProps) {
  return (
    <div
      style={{
        background: colors.surface2,
        border: `1px solid ${BORDER_TONES[borderTone]}`,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: '1.4px',
          color: colors.textMute,
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 28,
            fontWeight: 600,
            color: TONES[tone] ?? colors.text,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        {unit && (
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.textDim,
              letterSpacing: '0.6px',
            }}
          >
            {unit}
          </div>
        )}
      </div>
      {note && (
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.textDim,
            letterSpacing: '0.4px',
            marginTop: 2,
          }}
        >
          {note}
        </div>
      )}
    </div>
  );
}
