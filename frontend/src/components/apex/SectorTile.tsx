import { colors, fonts } from '../../theme/tokens';
import { Mono } from './Mono';

interface SectorTileProps {
  sector: 'S1' | 'S2' | 'S3';
  time: number | null;
  delta?: number | null;
  isPurple?: boolean;
}

function fmtSec(t: number | null | undefined): string {
  if (t === null || t === undefined) return '—';
  return t.toFixed(3);
}

function fmtDelta(d: number | null | undefined): string {
  if (d === null || d === undefined) return '';
  const sign = d >= 0 ? '+' : '−';
  return `${sign}${Math.abs(d).toFixed(3)}`;
}

function deltaColor(d: number | null | undefined): string {
  if (d === null || d === undefined) return colors.textMute;
  if (d <= 0) return colors.green;
  if (d < 0.15) return colors.yellow;
  return colors.red;
}

export function SectorTile({ sector, time, delta, isPurple }: SectorTileProps) {
  return (
    <div
      style={{
        flex: 1,
        background: colors.surface2,
        border: `1px solid ${colors.border}`,
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 9,
          letterSpacing: '1.2px',
          color: colors.textMute,
          textTransform: 'uppercase',
        }}
      >
        {sector}
      </div>
      <Mono
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: isPurple ? colors.purple : colors.text,
        }}
      >
        {fmtSec(time)}
      </Mono>
      {delta !== undefined && delta !== null && (
        <Mono
          style={{
            fontSize: 10,
            color: deltaColor(delta),
          }}
        >
          {fmtDelta(delta)}
        </Mono>
      )}
    </div>
  );
}
