import { colors, fonts } from '../../theme/tokens';

export type FlagKind = 'OUT' | 'IN' | 'SB' | 'PB';

interface FlagProps {
  f?: FlagKind | null;
}

const MAP: Record<FlagKind, { bg: string; fg: string; label: string }> = {
  OUT: { bg: 'transparent', fg: colors.textMute, label: 'OUT' },
  IN: { bg: 'transparent', fg: colors.textMute, label: 'IN' },
  SB: { bg: colors.purple, fg: '#fff', label: 'SB' },
  PB: { bg: colors.green, fg: '#000', label: 'PB' },
};

export function Flag({ f }: FlagProps) {
  if (!f) return null;
  const m = MAP[f];
  if (!m) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 4px',
        background: m.bg,
        color: m.fg,
        fontFamily: fonts.mono,
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.5px',
        border: m.bg === 'transparent' ? `1px solid ${colors.border}` : 'none',
      }}
    >
      {m.label}
    </span>
  );
}
