import React from 'react';
import { Box, Typography } from '@mui/material';
import { Circuit } from '../../data/circuits';
import { pathBoundingBox } from '../../data/circuitCharacteristics';

interface Props {
  circuit: Circuit;
  size?: number;
  /** Color del trazado. */
  stroke?: string;
  /** Grosor del trazado. */
  strokeWidth?: number;
  /** Mostrar la línea de meta. */
  showStart?: boolean;
  /** Mostrar marcadores de sector. */
  showSectors?: boolean;
  /** Color de fondo. */
  background?: string;
  /** Nombre debajo del mapa. */
  showLabel?: boolean;
}

/**
 * Renderiza un mini-mapa SVG del trazado. Ligero y sin dependencias.
 */
const CircuitMiniMap: React.FC<Props> = ({
  circuit,
  size = 120,
  stroke = '#d32f2f',
  strokeWidth = 2.5,
  showStart = false,
  showSectors = false,
  background = 'transparent',
  showLabel = false,
}) => {
  const path = circuit.path;
  if (!path || path.length < 2) {
    return (
      <Box sx={{ width: size, height: size, bgcolor: background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" color="textSecondary">sin trazado</Typography>
      </Box>
    );
  }

  const bbox = pathBoundingBox(path);
  // Margen interno del 5% para que no toque los bordes
  const pad = Math.max(bbox.w, bbox.h) * 0.08 || 2;
  const viewX = bbox.x - pad;
  const viewY = bbox.y - pad;
  const viewW = bbox.w + pad * 2;
  const viewH = bbox.h + pad * 2;

  const d = path
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ');

  const s1End = Math.floor(path.length * circuit.sectorBoundaries[0]);
  const s2End = Math.floor(path.length * circuit.sectorBoundaries[1]);

  return (
    <Box sx={{ display: 'inline-block', textAlign: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
        style={{ background, display: 'block' }}
      >
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {showStart && (
          <circle
            cx={path[0][0]}
            cy={path[0][1]}
            r={Math.max(viewW, viewH) * 0.02}
            fill="#000"
            stroke="#fff"
            strokeWidth={0.5}
          />
        )}
        {showSectors && path[s1End] && path[s2End] && (
          <>
            <circle cx={path[s1End][0]} cy={path[s1End][1]} r={Math.max(viewW, viewH) * 0.012} fill="#1976d2" />
            <circle cx={path[s2End][0]} cy={path[s2End][1]} r={Math.max(viewW, viewH) * 0.012} fill="#1976d2" />
          </>
        )}
      </svg>
      {showLabel && (
        <Typography variant="caption" display="block" sx={{ mt: 0.5, fontWeight: 500 }}>
          {circuit.name}
        </Typography>
      )}
    </Box>
  );
};

export default CircuitMiniMap;
