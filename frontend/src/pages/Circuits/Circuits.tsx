import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, TextField, InputAdornment, Chip, Stack, Button, Paper, IconButton,
  ToggleButton, ToggleButtonGroup, Tooltip, Divider, Snackbar, Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  CompareArrows as CompareIcon,
  Clear as ClearIcon,
  GpsFixed as GpsIcon,
  Public as PublicIcon,
  EmojiEvents as TrophyIcon,
  Straighten as StraightenIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import { Circuit, findCircuit } from '../../data/circuits';
import { getCircuitExtras } from '../../data/circuitMeta';
import { useAllCircuits } from '../../data/useAllCircuits';
import CircuitCard from '../../components/CircuitCard/CircuitCard';
import CircuitDetailDialog from '../../components/CircuitDetailDialog/CircuitDetailDialog';
import CircuitImporter from '../../components/CircuitImporter/CircuitImporter';
import CircuitComparison from './CircuitComparison';
import { sessionsApi, formatLapTime } from '../../api/sessions';
import type { Session, SessionAnalytics } from '../../types';
import { PageHeader } from '../../components/apex';

type RegionFilter = 'all' | 'es' | 'eu' | 'asia' | 'me' | 'am' | 'oc';
type DataFilter = 'all' | 'gps' | 'stylized';
type SortOption = 'name' | 'length-desc' | 'length-asc' | 'turns-desc';

const REGION_MAP: Record<string, RegionFilter> = {
  ES: 'es',
  BE: 'eu', GB: 'eu', IT: 'eu', DE: 'eu', NL: 'eu', MC: 'eu', HU: 'eu', AT: 'eu', TR: 'eu', FR: 'eu', PT: 'eu',
  JP: 'asia', MY: 'asia', CN: 'asia', SG: 'asia',
  AE: 'me', SA: 'me', AZ: 'me', QA: 'me',
  CA: 'am', MX: 'am', BR: 'am', AR: 'am',
  AU: 'oc',
};

const REGION_LABELS: Record<RegionFilter, string> = {
  all: 'Todas',
  es: '🇪🇸 España',
  eu: '🇪🇺 Europa',
  asia: '🌏 Asia',
  me: '🕌 O. Medio',
  am: '🌎 Américas',
  oc: '🇦🇺 Oceanía',
};

const Circuits: React.FC = () => {
  const { circuits: allCircuits, refresh } = useAllCircuits();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<RegionFilter>('all');
  const [dataFilter, setDataFilter] = useState<DataFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [selected, setSelected] = useState<Circuit | null>(null);
  const [importerOpen, setImporterOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<Circuit | null>(null);
  const [compareB, setCompareB] = useState<Circuit | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  // Sesiones cargadas para mostrar récord personal por circuito
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bestLapsByCircuit, setBestLapsByCircuit] = useState<Record<string, number>>({});

  useEffect(() => {
    sessionsApi.list().then(setSessions).catch(() => setSessions([]));
  }, []);

  // Calcular mejor vuelta por circuito (canonical name) cargando analytics de cada sesión
  useEffect(() => {
    if (sessions.length === 0) return;
    let cancelled = false;
    // Solo cargamos las sesiones que tienen circuito
    const withCircuit = sessions.filter((s) => s.circuit);
    Promise.all(
      withCircuit.map((s) =>
        sessionsApi.analytics(s.id).then((a) => ({ session: s, analytics: a })).catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      const best: Record<string, number> = {};
      for (const r of results) {
        if (!r) continue;
        const canon = findCircuit(r.session.circuit)?.name || r.session.circuit;
        if (!canon) continue;
        const bestLapMs = r.analytics.perLap
          .filter((l) => l.valid && l.lapTimeMs)
          .reduce<number | null>((acc, l) => (acc == null || l.lapTimeMs < acc ? l.lapTimeMs : acc), null);
        if (bestLapMs != null && (best[canon] == null || bestLapMs < best[canon])) {
          best[canon] = bestLapMs;
        }
      }
      setBestLapsByCircuit(best);
    });
    return () => { cancelled = true; };
  }, [sessions]);

  // Sesiones por circuito (canonical)
  const sessionsByCircuit = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of sessions) {
      const canon = findCircuit(s.circuit)?.name || s.circuit || '';
      if (!canon) continue;
      map[canon] = (map[canon] || 0) + 1;
    }
    return map;
  }, [sessions]);

  // Filtrado y ordenación
  const filtered = useMemo(() => {
    const normalizedSearch = search.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return allCircuits
      .filter((c) => {
        // Filtro de búsqueda
        if (normalizedSearch) {
          const hay = [c.name, ...c.aliases, c.country || '']
            .join(' ')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '');
          if (!hay.includes(normalizedSearch)) return false;
        }
        // Filtro de región
        if (region !== 'all') {
          const cReg = REGION_MAP[c.country || ''] || 'eu';
          if (cReg !== region) return false;
        }
        // Filtro de tipo de datos
        if (dataFilter === 'gps' && !c.realData) return false;
        if (dataFilter === 'stylized' && c.realData) return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'length-desc': return (b.length_km || 0) - (a.length_km || 0);
          case 'length-asc': return (a.length_km || 0) - (b.length_km || 0);
          case 'turns-desc': return (getCircuitExtras(b.name).turns || 0) - (getCircuitExtras(a.name).turns || 0);
          default: return a.name.localeCompare(b.name);
        }
      });
  }, [allCircuits, search, region, dataFilter, sortBy]);

  // Stats globales
  const stats = useMemo(() => {
    const gps = allCircuits.filter((c) => c.realData).length;
    const stylized = allCircuits.filter((c) => !c.realData).length;
    const totalKmAvail = allCircuits.reduce((acc, c) => acc + (c.length_km || 0), 0);
    const totalKmDriven = sessions.reduce((acc, s) => {
      const c = findCircuit(s.circuit);
      return acc + (s.lapCount || 0) * (c?.length_km || 0);
    }, 0);
    const topCircuits = Object.entries(sessionsByCircuit)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    return { total: allCircuits.length, gps, stylized, totalKmAvail, totalKmDriven, topCircuits };
  }, [allCircuits, sessions, sessionsByCircuit]);

  const handleCardClick = (c: Circuit) => {
    if (compareMode) {
      if (compareA?.name === c.name) {
        setCompareA(null);
      } else if (compareB?.name === c.name) {
        setCompareB(null);
      } else if (!compareA) {
        setCompareA(c);
      } else if (!compareB) {
        setCompareB(c);
      } else {
        // Reemplazar A
        setCompareA(c);
      }
    } else {
      setSelected(c);
    }
  };

  const handleImported = (c: Circuit) => {
    refresh();
    setSnack(`Circuito "${c.name}" importado`);
  };

  const exitCompare = () => {
    setCompareMode(false);
    setCompareA(null);
    setCompareB(null);
    setComparisonOpen(false);
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PageHeader
        eyebrow="TELEMETRY · CIRCUITOS"
        title="Circuitos"
        subtitle="Galería completa con trazados, récords personales y notas técnicas."
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setImporterOpen(true)}
            >
              Importar GeoJSON
            </Button>
            <ToggleButton
              value="compare"
              selected={compareMode}
              onChange={() => (compareMode ? exitCompare() : setCompareMode(true))}
              color="primary"
              size="small"
            >
              <CompareIcon sx={{ mr: 1 }} fontSize="small" />
              {compareMode ? 'Salir comparar' : 'Comparar'}
            </ToggleButton>
          </Stack>
        }
      />

      {/* Stats */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', md: 'repeat(5, 1fr)' }} gap={2}>
          <StatBox icon={<PublicIcon />} label="Circuitos" value={stats.total.toString()} />
          <StatBox icon={<GpsIcon />} label="GPS reales" value={`${stats.gps}/${stats.total}`} />
          <StatBox icon={<StraightenIcon />} label="Km totales" value={`${stats.totalKmAvail.toFixed(0)} km`} />
          <StatBox
            icon={<LayersIcon />}
            label="Tus km en pista"
            value={stats.totalKmDriven > 0 ? `${stats.totalKmDriven.toFixed(0)} km` : '—'}
          />
          <Box>
            <Typography variant="caption" color="textSecondary" display="flex" alignItems="center" gap={0.5}>
              <TrophyIcon fontSize="small" /> Top usados
            </Typography>
            {stats.topCircuits.length === 0 ? (
              <Typography variant="body2" color="textSecondary">—</Typography>
            ) : (
              stats.topCircuits.map(([name, count]) => (
                <Typography key={name} variant="caption" display="block" sx={{ lineHeight: 1.3 }}>
                  {name.length > 22 ? name.slice(0, 22) + '…' : name}
                  <Typography component="span" variant="caption" color="textSecondary"> ({count})</Typography>
                </Typography>
              ))
            )}
          </Box>
        </Box>
      </Paper>

      {/* Compare bar */}
      {compareMode && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Typography variant="body2">
              <strong>Modo comparación:</strong> selecciona dos circuitos para compararlos.
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={compareA ? `A: ${compareA.name}` : 'A: —'}
                size="small"
                onDelete={compareA ? () => setCompareA(null) : undefined}
                sx={{ bgcolor: 'background.paper' }}
              />
              <Chip
                label={compareB ? `B: ${compareB.name}` : 'B: —'}
                size="small"
                onDelete={compareB ? () => setCompareB(null) : undefined}
                sx={{ bgcolor: 'background.paper' }}
              />
              <Button
                size="small"
                variant="contained"
                color="secondary"
                disabled={!compareA || !compareB}
                onClick={() => setComparisonOpen(true)}
              >
                Comparar
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Filtros */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
        <TextField
          size="small"
          placeholder="Buscar circuito..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ minWidth: 240 }}
        />
        <ToggleButtonGroup
          value={region}
          exclusive
          size="small"
          onChange={(_, v) => v && setRegion(v)}
        >
          {(Object.entries(REGION_LABELS) as [RegionFilter, string][]).map(([k, v]) => (
            <ToggleButton key={k} value={k} sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}>
              {v}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={dataFilter}
          exclusive
          size="small"
          onChange={(_, v) => v && setDataFilter(v)}
        >
          <ToggleButton value="all" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Todos</ToggleButton>
          <ToggleButton value="gps" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>GPS real</ToggleButton>
          <ToggleButton value="stylized" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Estilizado</ToggleButton>
        </ToggleButtonGroup>
        <Divider orientation="vertical" flexItem />
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          size="small"
          onChange={(_, v) => v && setSortBy(v)}
        >
          <ToggleButton value="name" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>A-Z</ToggleButton>
          <ToggleButton value="length-desc" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Más largo</ToggleButton>
          <ToggleButton value="length-asc" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Más corto</ToggleButton>
          <ToggleButton value="turns-desc" sx={{ textTransform: 'none', fontSize: '0.75rem' }}>+ Curvas</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="body1" color="textSecondary">
            No hay circuitos que coincidan con los filtros.
          </Typography>
        </Box>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(5, 1fr)',
          }}
          gap={2}
        >
          {filtered.map((c) => (
            <CircuitCard
              key={c.name}
              circuit={c}
              onClick={handleCardClick}
              selected={compareMode && (compareA?.name === c.name || compareB?.name === c.name)}
              personalBestMs={bestLapsByCircuit[c.name]}
              sessionsCount={sessionsByCircuit[c.name]}
            />
          ))}
        </Box>
      )}

      <CircuitDetailDialog
        circuit={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onCustomDeleted={() => { refresh(); setSelected(null); }}
      />
      <CircuitImporter
        open={importerOpen}
        onClose={() => setImporterOpen(false)}
        onImported={handleImported}
      />
      <CircuitComparison
        circuitA={compareA}
        circuitB={compareB}
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
      />

      <Snackbar
        open={!!snack}
        autoHideDuration={2500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snack ? <Alert severity="success" onClose={() => setSnack(null)}>{snack}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
};

const StatBox: React.FC<{ icon: React.ReactElement; label: string; value: string }> = ({ icon, label, value }) => (
  <Box>
    <Typography variant="caption" color="textSecondary" display="flex" alignItems="center" gap={0.5}>
      {React.cloneElement(icon, { fontSize: 'small' })} {label}
    </Typography>
    <Typography variant="h6" fontWeight={600}>{value}</Typography>
  </Box>
);

export default Circuits;
