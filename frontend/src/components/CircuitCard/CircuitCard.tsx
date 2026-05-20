import React from 'react';
import { Card, CardActionArea, CardContent, Box, Typography, Chip, Stack } from '@mui/material';
import { Circuit } from '../../data/circuits';
import { getCircuitExtras } from '../../data/circuitMeta';
import CircuitMiniMap from '../CircuitMiniMap/CircuitMiniMap';

interface Props {
  circuit: Circuit;
  onClick?: (circuit: Circuit) => void;
  /** Si está seleccionado en modo comparación. */
  selected?: boolean;
  /** Si está seleccionable (visual). */
  selectable?: boolean;
  /** Récord personal de mejor vuelta para este circuito (ms). */
  personalBestMs?: number;
  /** Cuántas sesiones tienes en este circuito. */
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
  selectable = false,
  personalBestMs,
  sessionsCount,
}) => {
  const extras = getCircuitExtras(circuit.name);

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        transition: 'all 0.15s ease',
        borderColor: selected ? 'primary.main' : undefined,
        borderWidth: selected ? 2 : 1,
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardActionArea
        onClick={() => onClick?.(circuit)}
        disabled={!onClick}
        sx={{ height: '100%', alignItems: 'stretch' }}
      >
        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5 }}>
          {/* Header: bandera + nombre */}
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Typography component="span" sx={{ fontSize: '1.5em', lineHeight: 1, flexShrink: 0 }}>
              {COUNTRY_FLAGS[circuit.country || ''] || '🏁'}
            </Typography>
            <Box flex={1} minWidth={0}>
              <Typography variant="subtitle2" fontWeight={600} sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {circuit.name}
              </Typography>
              {circuit.length_km && (
                <Typography variant="caption" color="textSecondary" fontFamily="monospace">
                  {circuit.length_km.toFixed(3)} km
                  {extras.turns ? ` · ${extras.turns} curvas` : ''}
                  {extras.direction ? ` · ${extras.direction === 'CW' ? '↻' : '↺'}` : ''}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Mini-mapa */}
          <Box display="flex" justifyContent="center" alignItems="center" py={1}>
            <CircuitMiniMap circuit={circuit} size={140} stroke={selected ? '#d32f2f' : '#424242'} />
          </Box>

          {/* Chips de categorías */}
          {extras.categories && extras.categories.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {extras.categories.slice(0, 4).map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.65rem' }}
                />
              ))}
              {extras.categories.length > 4 && (
                <Chip label={`+${extras.categories.length - 4}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
              )}
            </Stack>
          )}

          {/* Footer: GPS real + stats personales */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
            {circuit.realData ? (
              <Chip label="GPS real" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
            ) : (
              <Chip label="estilizado" size="small" color="default" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
            )}
            {sessionsCount != null && sessionsCount > 0 && (
              <Box textAlign="right">
                <Typography variant="caption" color="textSecondary" display="block" lineHeight={1}>
                  {sessionsCount} sesión{sessionsCount === 1 ? '' : 'es'}
                </Typography>
                {personalBestMs != null && (
                  <Typography variant="caption" fontFamily="monospace" fontWeight={600} color="primary.main">
                    {formatLapMs(personalBestMs)}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CircuitCard;
