import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete, TextField, Box, Typography, Popper } from '@mui/material';
import { Circuit } from '../../data/circuits';
import { useAllCircuits } from '../../data/useAllCircuits';
import CircuitMiniMap from '../CircuitMiniMap/CircuitMiniMap';
import { colors, fonts } from '../../theme/tokens';
import { Mono } from '../apex';

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

const CircuitSelector: React.FC<Props> = ({
  value,
  onChange,
  label,
  required = false,
  fullWidth = false,
  size = 'medium',
  freeSolo = true,
}) => {
  const { t } = useTranslation();
  const REGION_LABELS: Record<number, string> = {
    1: t('circuits.selector.regions.spain'),
    2: t('circuits.selector.regions.europe'),
    3: t('circuits.selector.regions.asia'),
    4: t('circuits.selector.regions.middleEast'),
    5: t('circuits.selector.regions.americas'),
    6: t('circuits.selector.regions.oceania'),
    99: t('circuits.selector.regions.other'),
  };
  const effectiveLabel = label ?? t('circuits.selector.label');
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
          return REGION_LABELS[region] || REGION_LABELS[99];
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
              <Box display="flex" alignItems="center" gap={0.75} flexShrink={0}>
                {option.length_km && (
                  <Mono style={{ fontSize: 11, color: colors.textMute }}>
                    {option.length_km.toFixed(3)} km
                  </Mono>
                )}
                {option.realData && (
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: 0.6,
                      textTransform: 'uppercase',
                      color: colors.accent,
                      border: `1px solid ${colors.accent}`,
                      padding: '1px 5px',
                      lineHeight: 1.4,
                    }}
                  >
                    GPS
                  </span>
                )}
              </Box>
            </Box>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={effectiveLabel}
            required={required}
            size={size}
            placeholder={t('circuits.selector.placeholder')}
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
          <div
            style={{
              padding: 12,
              maxWidth: 220,
              background: colors.surface2,
              border: `1px solid ${colors.borderHi}`,
            }}
          >
            <div
              style={{
                fontFamily: fonts.sans,
                fontSize: 12,
                fontWeight: 600,
                color: colors.text,
                marginBottom: 6,
              }}
            >
              {hovered.name}
            </div>
            <CircuitMiniMap
              circuit={hovered}
              size={160}
              stroke={colors.accent}
              strokeWidth={2}
              showStart
            />
            {hovered.length_km && (
              <Mono
                style={{
                  fontSize: 10,
                  color: colors.textMute,
                  marginTop: 6,
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                {hovered.length_km.toFixed(3)} km
              </Mono>
            )}
          </div>
        )}
      </Popper>
    </>
  );
};

export default CircuitSelector;
