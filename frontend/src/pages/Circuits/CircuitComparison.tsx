import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { Circuit } from '../../data/circuits';
import { getCircuitExtras } from '../../data/circuitMeta';
import { computeDirection, totalPathLength, findLongestStraight } from '../../data/circuitCharacteristics';
import CircuitMiniMap from '../../components/CircuitMiniMap/CircuitMiniMap';
import { colors, fonts } from '../../theme/tokens';
import { Mono, Label } from '../../components/apex';

interface Props {
  circuitA: Circuit | null;
  circuitB: Circuit | null;
  open: boolean;
  onClose: () => void;
}

interface RowData {
  label: string;
  a: string;
  b: string;
  winner?: 'a' | 'b' | null;
}

const COLOR_A = colors.accent;
const COLOR_B = colors.purple;

const CircuitComparison: React.FC<Props> = ({ circuitA, circuitB, open, onClose }) => {
  if (!circuitA || !circuitB) return null;

  const extA = getCircuitExtras(circuitA.name);
  const extB = getCircuitExtras(circuitB.name);

  const dirA = extA.direction ?? computeDirection(circuitA.path);
  const dirB = extB.direction ?? computeDirection(circuitB.path);

  const pathTotalA = totalPathLength(circuitA.path);
  const pathTotalB = totalPathLength(circuitB.path);
  const longestStraightKmA =
    extA.longestStraightKm ??
    (circuitA.length_km && pathTotalA > 0
      ? (findLongestStraight(circuitA.path) / pathTotalA) * circuitA.length_km
      : null);
  const longestStraightKmB =
    extB.longestStraightKm ??
    (circuitB.length_km && pathTotalB > 0
      ? (findLongestStraight(circuitB.path) / pathTotalB) * circuitB.length_km
      : null);

  const lenA = circuitA.length_km || 0;
  const lenB = circuitB.length_km || 0;

  const fmt = (v: number | null | undefined, unit = '') =>
    v == null ? '—' : `${v.toFixed(3)}${unit}`;

  const rows: RowData[] = [
    { label: 'País', a: circuitA.country || '—', b: circuitB.country || '—' },
    {
      label: 'Longitud',
      a: lenA ? `${lenA.toFixed(3)} km` : '—',
      b: lenB ? `${lenB.toFixed(3)} km` : '—',
      winner: lenA && lenB ? (lenA > lenB ? 'a' : lenA < lenB ? 'b' : null) : null,
    },
    {
      label: 'Curvas',
      a: extA.turns?.toString() ?? '—',
      b: extB.turns?.toString() ?? '—',
      winner:
        extA.turns != null && extB.turns != null
          ? extA.turns > extB.turns ? 'a' : extA.turns < extB.turns ? 'b' : null
          : null,
    },
    {
      label: 'Sentido',
      a: dirA === 'CW' ? '↻ Horario' : '↺ Antihorario',
      b: dirB === 'CW' ? '↻ Horario' : '↺ Antihorario',
    },
    {
      label: 'Recta más larga',
      a: fmt(longestStraightKmA, ' km'),
      b: fmt(longestStraightKmB, ' km'),
      winner:
        longestStraightKmA && longestStraightKmB
          ? longestStraightKmA > longestStraightKmB ? 'a' : longestStraightKmA < longestStraightKmB ? 'b' : null
          : null,
    },
    {
      label: 'Altitud',
      a: extA.altitudeM ? `${extA.altitudeM} m` : '—',
      b: extB.altitudeM ? `${extB.altitudeM} m` : '—',
      winner:
        extA.altitudeM != null && extB.altitudeM != null
          ? extA.altitudeM > extB.altitudeM ? 'a' : extA.altitudeM < extB.altitudeM ? 'b' : null
          : null,
    },
    { label: 'Inaugurado', a: extA.opened?.toString() ?? '—', b: extB.opened?.toString() ?? '—' },
    {
      label: 'Categorías',
      a: extA.categories?.join(', ') ?? '—',
      b: extB.categories?.join(', ') ?? '—',
    },
    { label: 'Récord', a: extA.lapRecord ?? '—', b: extB.lapRecord ?? '—' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          fontFamily: fonts.mono,
          fontSize: 13,
          letterSpacing: '1.4px',
          textTransform: 'uppercase',
          color: colors.textDim,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        Comparador de circuitos
      </DialogTitle>
      <DialogContent>
        <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }} mt={2} mb={3}>
          {[
            { c: circuitA, color: COLOR_A, lbl: 'A' },
            { c: circuitB, color: COLOR_B, lbl: 'B' },
          ].map(({ c, color, lbl }) => (
            <Box
              key={c.name}
              flex={1}
              sx={{
                background: colors.surface2,
                border: `1px solid ${colors.border}`,
                borderLeft: `3px solid ${color}`,
                p: 2,
                textAlign: 'center',
              }}
            >
              <Label tone="dim" style={{ color, marginBottom: 6 }}>
                CIRCUITO · {lbl}
              </Label>
              <div style={{ color: colors.text, fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
                {c.country || '🏁'} {c.name}
              </div>
              <CircuitMiniMap circuit={c} size={240} stroke={color} strokeWidth={2.5} showStart />
            </Box>
          ))}
        </Box>

        <Box sx={{ border: `1px solid ${colors.border}` }}>
          <Box
            display="grid"
            gridTemplateColumns="1fr 1fr 1fr"
            gap={0}
            sx={{
              background: colors.surface2,
              borderBottom: `1px solid ${colors.borderHi}`,
            }}
          >
            <div style={{ padding: '8px 14px' }}>
              <Label>Métrica</Label>
            </div>
            <div style={{ padding: '8px 14px', borderLeft: `1px solid ${colors.border}` }}>
              <Label style={{ color: COLOR_A }}>A · {circuitA.name}</Label>
            </div>
            <div style={{ padding: '8px 14px', borderLeft: `1px solid ${colors.border}` }}>
              <Label style={{ color: COLOR_B }}>B · {circuitB.name}</Label>
            </div>
          </Box>
          {rows.map((row, idx) => (
            <Box
              key={row.label}
              display="grid"
              gridTemplateColumns="1fr 1fr 1fr"
              gap={0}
              sx={{
                borderBottom: idx < rows.length - 1 ? `1px solid ${colors.border}` : 'none',
                '&:hover': { backgroundColor: colors.surface2 },
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  color: colors.textDim,
                  fontSize: 11,
                  fontFamily: fonts.mono,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  fontFamily: fonts.mono,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: row.winner === 'a' ? 700 : 500,
                  color: row.winner === 'a' ? COLOR_A : colors.text,
                  fontSize: 12,
                  borderLeft: `1px solid ${colors.border}`,
                }}
              >
                {row.a}
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  fontFamily: fonts.mono,
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: row.winner === 'b' ? 700 : 500,
                  color: row.winner === 'b' ? COLOR_B : colors.text,
                  fontSize: 12,
                  borderLeft: `1px solid ${colors.border}`,
                }}
              >
                {row.b}
              </div>
            </Box>
          ))}
        </Box>

        {extA.funFact && (
          <Box
            mt={2}
            p={1.5}
            sx={{
              background: colors.surface2,
              borderLeft: `3px solid ${COLOR_A}`,
            }}
          >
            <Mono style={{ fontSize: 11, color: colors.textDim, fontStyle: 'italic' }}>
              💡 <strong style={{ color: COLOR_A }}>{circuitA.name}:</strong> {extA.funFact}
            </Mono>
          </Box>
        )}
        {extB.funFact && (
          <Box
            mt={1}
            p={1.5}
            sx={{
              background: colors.surface2,
              borderLeft: `3px solid ${COLOR_B}`,
            }}
          >
            <Mono style={{ fontSize: 11, color: colors.textDim, fontStyle: 'italic' }}>
              💡 <strong style={{ color: COLOR_B }}>{circuitB.name}:</strong> {extB.funFact}
            </Mono>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
        <Button onClick={onClose} sx={{ color: colors.textDim, fontFamily: fonts.mono, letterSpacing: '1.2px' }}>
          CERRAR
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CircuitComparison;
