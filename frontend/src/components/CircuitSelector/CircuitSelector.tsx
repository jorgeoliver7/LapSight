import React, { useState } from 'react';
import { Autocomplete, TextField, Box, Typography, Chip, Popper, Paper } from '@mui/material';
import { Circuit } from '../../data/circuits';
import { useAllCircuits } from '../../data/useAllCircuits';
import CircuitMiniMap from '../CircuitMiniMap/CircuitMiniMap';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  /** Si true, permite escribir cualquier texto (no sólo de la lista). */
  freeSolo?: boolean;
}

const COUNTRY_FLAGS: Record<string, string> = {
  ES: '🇪🇸', BE: '🇧🇪', GB: '🇬🇧', IT: '🇮🇹', JP: '🇯🇵', DE: '🇩🇪',
  NL: '🇳🇱', MC: '🇲🇨', HU: '🇭🇺', AT: '🇦🇹', BR: '🇧🇷', AE: '🇦🇪',
  SA: '🇸🇦', AU: '🇦🇺', SG: '🇸🇬', CA: '🇨🇦', AR: '🇦🇷', MY: '🇲🇾',
  CN: '🇨🇳', AZ: '🇦🇿', TR: '🇹🇷', QA: '🇶🇦', MX: '🇲🇽', FR: '🇫🇷',
  PT: '🇵🇹',
};

const REGION_ORDER: Record<string, number> = {
  ES: 1,
  BE: 2, GB: 2, IT: 2, DE: 2, NL: 2, MC: 2, HU: 2, AT: 2, TR: 2, FR: 2, PT: 2,
  JP: 3, MY: 3, CN: 3, SG: 3,
  AE: 4, SA: 4, AZ: 4, QA: 4,
  CA: 5, MX: 5, BR: 5, AR: 5,
  AU: 6,
};

const REGION_LABELS: Record<number, string> = {
  1: '🇪🇸 España',
  2: '🇪🇺 Europa',
  3: '🌏 Asia',
  4: '🕌 Oriente Medio',
  5: '🌎 Américas',
  6: '🇦🇺 Oceanía',
  99: '🏁 Otros',
};

const CircuitSelector: React.FC<Props> = ({
  value,
  onChange,
  label = 'Circuito',
  required = false,
  fullWidth = false,
  size = 'medium',
  freeSolo = true,
}) => {
  const { circuits } = useAllCircuits();
  const [hovered, setHovered] = useState<Circuit | null>(null);
  const [hoverAnchor, setHoverAnchor] = useState<HTMLElement | null>(null);

  const sortedCircuits = React.useMemo(() => {
    return [...circuits].sort((a, b) => {
      const ra = REGION_ORDER[a.country || ''] ?? 99;
      const rb = REGION_ORDER[b.country || ''] ?? 99;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
  }, [circuits]);

  return (
    <>
      <Autocomplete
        freeSolo={freeSolo}
        options={sortedCircuits}
        value={value}
        onChange={(_, newValue) => {
          if (typeof newValue === 'string') {
            onChange(newValue);
          } else if (newValue) {
            onChange(newValue.name);
          } else {
            onChange('');
          }
        }}
        onInputChange={(_, newInputValue, reason) => {
          if (reason === 'input' && freeSolo) {
            onChange(newInputValue);
          }
        }}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
        groupBy={(option) => {
          const region = REGION_ORDER[option.country || ''] ?? 99;
          return REGION_LABELS[region] || '🏁 Otros';
        }}
        isOptionEqualToValue={(option, val) => {
          const valName = typeof val === 'string' ? val : (val as Circuit).name;
          return option.name === valName;
        }}
        renderOption={(props, option) => (
          <Box
            component="li"
            {...props}
            key={option.name}
            onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
              setHovered(option);
              setHoverAnchor(e.currentTarget);
            }}
            onMouseLeave={() => {
              setHovered(null);
              setHoverAnchor(null);
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" gap={1}>
              <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                <Typography component="span" sx={{ fontSize: '1.2em', flexShrink: 0 }}>
                  {COUNTRY_FLAGS[option.country || ''] || '🏁'}
                </Typography>
                <Typography component="span" noWrap>
                  {option.name}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                {option.length_km && (
                  <Typography component="span" variant="caption" color="textSecondary" fontFamily="monospace">
                    {option.length_km.toFixed(3)} km
                  </Typography>
                )}
                {option.realData && (
                  <Chip
                    label="GPS"
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.5 } }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            size={size}
            placeholder="Buscar o escribir circuito..."
          />
        )}
        fullWidth={fullWidth}
        size={size}
      />

      {/* Mini-mapa preview en hover */}
      <Popper
        open={!!hovered && !!hoverAnchor}
        anchorEl={hoverAnchor}
        placement="right-start"
        modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
        sx={{ zIndex: 1500, pointerEvents: 'none' }}
      >
        {hovered && (
          <Paper elevation={6} sx={{ p: 1.5, maxWidth: 220 }}>
            <Typography variant="caption" fontWeight={600} display="block" mb={0.5}>
              {hovered.name}
            </Typography>
            <CircuitMiniMap circuit={hovered} size={160} stroke="#d32f2f" strokeWidth={2.5} showStart />
            {hovered.length_km && (
              <Typography variant="caption" color="textSecondary" display="block" mt={0.5} textAlign="center">
                {hovered.length_km.toFixed(3)} km
              </Typography>
            )}
          </Paper>
        )}
      </Popper>
    </>
  );
};

export default CircuitSelector;
