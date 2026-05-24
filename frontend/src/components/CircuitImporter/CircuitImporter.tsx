import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField,
  Typography, Alert, Stack,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { parseGeoJson, normalizeCoords, saveCustomCircuit } from '../../data/customCircuits';
import { Circuit } from '../../data/circuits';
import CircuitMiniMap from '../CircuitMiniMap/CircuitMiniMap';
import { colors } from '../../theme/tokens';

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: (circuit: Circuit) => void;
}

const CircuitImporter: React.FC<Props> = ({ open, onClose, onImported }) => {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [lengthKm, setLengthKm] = useState('');
  const [geoText, setGeoText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Circuit | null>(null);

  const reset = () => {
    setName(''); setCountry(''); setLengthKm(''); setGeoText('');
    setError(null); setPreview(null);
  };

  const handleClose = () => {
    reset(); onClose();
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    setGeoText(text);
    tryParse(text, name, country, lengthKm);
  };

  const tryParse = (text: string, nm: string, ctry: string, len: string) => {
    setError(null);
    setPreview(null);
    if (!text.trim()) return;
    const parsed = parseGeoJson(text);
    if (!parsed) {
      setError('No se pudo extraer un LineString del GeoJSON. Acepta FeatureCollection / Feature / LineString.');
      return;
    }
    if (parsed.coords.length < 3) {
      setError('El trazado debe tener al menos 3 puntos.');
      return;
    }
    const finalName = nm.trim() || parsed.name || 'Circuito custom';
    const finalLen = parseFloat(len) || parsed.length_km;
    const normalized = normalizeCoords(parsed.coords as [number, number][]);
    const circuit: Circuit = {
      name: finalName,
      aliases: [finalName.toLowerCase()],
      country: ctry.trim().toUpperCase() || parsed.country || undefined,
      length_km: finalLen,
      realData: true,
      sectorBoundaries: [0.33, 0.66],
      path: normalized,
    };
    setPreview(circuit);
  };

  const handleImport = () => {
    if (!preview) return;
    saveCustomCircuit(preview);
    onImported(preview);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Importar circuito desde GeoJSON</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="textSecondary">
            Sube un fichero GeoJSON con un LineString (coordenadas [lng, lat]).
            Se almacenará localmente en tu navegador.
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Nombre"
              value={name}
              onChange={(e) => { setName(e.target.value); if (geoText) tryParse(geoText, e.target.value, country, lengthKm); }}
              size="small"
              sx={{ flex: 2, minWidth: 200 }}
            />
            <TextField
              label="País (ISO)"
              value={country}
              onChange={(e) => { setCountry(e.target.value); if (geoText) tryParse(geoText, name, e.target.value, lengthKm); }}
              size="small"
              placeholder="ES"
              inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
              sx={{ width: 100 }}
            />
            <TextField
              label="Longitud (km)"
              value={lengthKm}
              onChange={(e) => { setLengthKm(e.target.value); if (geoText) tryParse(geoText, name, country, e.target.value); }}
              size="small"
              type="number"
              inputProps={{ step: 0.001 }}
              sx={{ width: 130 }}
            />
          </Box>

          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
          >
            Seleccionar archivo .geojson
            <input
              type="file"
              hidden
              accept=".geojson,.json,application/geo+json,application/json"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </Button>

          <TextField
            label="O pega el JSON aquí"
            multiline
            fullWidth
            minRows={4}
            maxRows={10}
            value={geoText}
            onChange={(e) => { setGeoText(e.target.value); tryParse(e.target.value, name, country, lengthKm); }}
            inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.8em' } }}
          />

          {error && <Alert severity="error">{error}</Alert>}

          {preview && (
            <Box sx={{ p: 2, bgcolor: colors.surface2, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.accent}`, display: 'flex', gap: 2, alignItems: 'center' }}>
              <CircuitMiniMap circuit={preview} size={120} stroke={colors.accent} strokeWidth={2.5} showStart />
              <Box>
                <Typography variant="subtitle2" sx={{ color: colors.text }}>{preview.name}</Typography>
                <Typography variant="caption" sx={{ color: colors.textDim, display: 'block', fontFamily: 'monospace' }}>
                  {preview.country || '—'} · {preview.length_km ? `${preview.length_km.toFixed(3)} km` : 'sin longitud'}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.textMute, display: 'block', fontFamily: 'monospace' }}>
                  {preview.path.length} puntos
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleImport} disabled={!preview}>
          Importar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CircuitImporter;
