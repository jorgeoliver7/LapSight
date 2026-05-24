import React, { useState } from 'react';
import { Circuit } from '../../data/circuits';
import { getCircuitExtras } from '../../data/circuitMeta';
import CircuitMiniMap from '../CircuitMiniMap/CircuitMiniMap';
import { colors, fonts } from '../../theme/tokens';
import { Mono, Pill } from '../apex';

interface Props {
  circuit: Circuit;
  onClick?: (circuit: Circuit) => void;
  selected?: boolean;
  selectable?: boolean;
  personalBestMs?: number;
  sessionsCount?: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
  ES: '🇪🇸', BE: '🇧🇪', GB: '🇬🇧', IT: '🇮🇹', JP: '🇯🇵', DE: '🇩🇪',
  NL: '🇳🇱', MC: '🇲🇨', HU: '🇭🇺', AT: '🇦🇹', BR: '🇧🇷', AE: '🇦🇪',
  SA: '🇸🇦', AU: '🇦🇺', SG: '🇸🇬', CA: '🇨🇦', AR: '🇦🇷', MY: '🇲🇾',
  CN: '🇨🇳', AZ: '🇦🇿', TR: '🇹🇷', QA: '🇶🇦', MX: '🇲🇽', FR: '🇫🇷',
  PT: '🇵🇹',
};

function formatLapMs(ms?: number): string {
  if (ms == null) return '—';
  const totalSec = ms / 1000;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec - minutes * 60;
  if (minutes === 0) return seconds.toFixed(3);
  return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
}

const CircuitCard: React.FC<Props> = ({
  circuit,
  onClick,
  selected = false,
  personalBestMs,
  sessionsCount,
}) => {
  const extras = getCircuitExtras(circuit.name);
  const [hover, setHover] = useState(false);

  const bg = selected
    ? colors.surface3
    : hover
      ? colors.surface2
      : colors.surface;
  const borderColor = selected
    ? colors.accent
    : hover
      ? colors.borderHi
      : colors.border;

  return (
    <div
      onClick={() => onClick?.(circuit)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: 14,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 120ms ease, border-color 120ms ease',
        position: 'relative',
      }}
    >
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 3,
            height: '100%',
            background: colors.accent,
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>
          {COUNTRY_FLAGS[circuit.country || ''] || '🏁'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              fontWeight: 600,
              color: colors.text,
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {circuit.name}
          </div>
          {circuit.length_km && (
            <Mono
              style={{
                fontSize: 10,
                color: colors.textMute,
                marginTop: 4,
                letterSpacing: 0.3,
                display: 'block',
              }}
            >
              {circuit.length_km.toFixed(3)} km
              {extras.turns ? ` · ${extras.turns} turns` : ''}
              {extras.direction ? ` · ${extras.direction === 'CW' ? '↻' : '↺'}` : ''}
            </Mono>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 4,
          paddingBottom: 4,
        }}
      >
        <CircuitMiniMap
          circuit={circuit}
          size={140}
          stroke={selected ? colors.accent : colors.textDim}
          strokeWidth={selected ? 2 : 1.5}
        />
      </div>

      {extras.categories && extras.categories.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {extras.categories.slice(0, 4).map((cat) => (
            <span
              key={cat}
              style={{
                fontFamily: fonts.mono,
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                color: colors.textDim,
                border: `1px solid ${colors.border}`,
                padding: '2px 6px',
                height: 18,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {cat}
            </span>
          ))}
          {extras.categories.length > 4 && (
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: 9,
                fontWeight: 600,
                color: colors.textMute,
                padding: '2px 6px',
                height: 18,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              +{extras.categories.length - 4}
            </span>
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
          paddingTop: 6,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <Pill active={!!circuit.realData}>
          {circuit.realData ? 'Real GPS' : 'Stylized'}
        </Pill>
        {sessionsCount != null && sessionsCount > 0 && (
          <div style={{ textAlign: 'right' }}>
            <Mono
              style={{
                display: 'block',
                fontSize: 9,
                color: colors.textMute,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              {sessionsCount} session{sessionsCount === 1 ? '' : 's'}
            </Mono>
            {personalBestMs != null && (
              <Mono
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: colors.accent,
                  display: 'block',
                  marginTop: 2,
                }}
              >
                {formatLapMs(personalBestMs)}
              </Mono>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CircuitCard;
