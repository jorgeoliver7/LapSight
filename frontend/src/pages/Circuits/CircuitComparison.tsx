import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Divider } from '@mui/material';
import { Circuit } from '../../data/circuits';
import { getCircuitExtras } from '../../data/circuitMeta';
import { computeDirection, totalPathLength, findLongestStraight } from '../../data/circuitCharacteristics';
import CircuitMiniMap from '../../components/CircuitMiniMap/CircuitMiniMap';

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
  /** ¿Qué es "mejor"? null = sin comparar, 'a'/'b' = ese gana. */
  winner?: 'a' | 'b' | null;
}

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
    {
      label: 'País',
      a: circuitA.country || '—',
      b: circuitB.country || '—',
    },
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
          ? extA.turns > extB.turns
            ? 'a'
            : extA.turns < extB.turns
            ? 'b'
            : null
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
          ? longestStraightKmA > longestStraightKmB
            ? 'a'
            : longestStraightKmA < longestStraightKmB
            ? 'b'
            : null
          : null,
    },
    {
      label: 'Altitud',
      a: extA.altitudeM ? `${extA.altitudeM} m` : '—',
      b: extB.altitudeM ? `${extB.altitudeM} m` : '—',
      winner:
        extA.altitudeM != null && extB.altitudeM != null
          ? extA.altitudeM > extB.altitudeM
            ? 'a'
            : extA.altitudeM < extB.altitudeM
            ? 'b'
            : null
          : null,
    },
    {
      label: 'Inaugurado',
      a: extA.opened?.toString() ?? '—',
      b: extB.opened?.toString() ?? '—',
    },
    {
      label: 'Categorías',
      a: extA.categories?.join(', ') ?? '—',
      b: extB.categories?.join(', ') ?? '—',
    },
    {
      label: 'Récord',
      a: extA.lapRecord ?? '—',
      b: extB.lapRecord ?? '—',
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Comparador de circuitos</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }} mb={3}>
          {[circuitA, circuitB].map((c, i) => (
            <Box key={c.name} flex={1} sx={{ bgcolor: '#fafafa', borderRadius: 1, p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {c.country || '🏁'} {c.name}
              </Typography>
              <CircuitMiniMap circuit={c} size={240} stroke={i === 0 ? '#d32f2f' : '#1976d2'} strokeWidth={3} showStart />
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box>
          {rows.map((row) => (
            <Box
              key={row.label}
              display="grid"
              gridTemplateColumns="1fr 1fr 1fr"
              gap={2}
              alignItems="center"
              sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Typography variant="body2" color="textSecondary" fontWeight={500}>
                {row.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: row.winner === 'a' ? 700 : 400,
                  color: row.winner === 'a' ? 'primary.main' : 'text.primary',
                }}
              >
                {row.a}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: row.winner === 'b' ? 700 : 400,
                  color: row.winner === 'b' ? 'info.main' : 'text.primary',
                }}
              >
                {row.b}
              </Typography>
            </Box>
          ))}
        </Box>

        {extA.funFact && (
          <Box mt={2} p={1.5} bgcolor="error.light" sx={{ opacity: 0.85, borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
              💡 <strong>{circuitA.name}:</strong> {extA.funFact}
            </Typography>
          </Box>
        )}
        {extB.funFact && (
          <Box mt={1} p={1.5} bgcolor="info.light" sx={{ opacity: 0.85, borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
              💡 <strong>{circuitB.name}:</strong> {extB.funFact}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CircuitComparison;
