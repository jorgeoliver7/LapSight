import { colors, fonts, compoundColor } from '../../theme/tokens';

export type CompoundCode = 'S' | 'M' | 'H' | 'I' | 'W' | string;

interface CompoundProps {
  c: CompoundCode;
  size?: number;
}

const LABELS: Record<string, string> = {
  S: 'S',
  M: 'M',
  H: 'H',
  I: 'I',
  W: 'W',
};

export function Compound({ c, size = 18 }: CompoundProps) {
  const color = compoundColor(c);
  const label = LABELS[c] ?? c;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1.5px solid ${color}`,
        color,
        fontFamily: fonts.mono,
        fontSize: size * 0.55,
        fontWeight: 600,
        lineHeight: 1,
        background: 'transparent',
        flexShrink: 0,
      }}
    >
      {label || '·'}
    </span>
  );
}

// Re-export for convenience
export { colors };
