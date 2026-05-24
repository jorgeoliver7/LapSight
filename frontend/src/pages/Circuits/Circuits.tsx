import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, TextField, InputAdornment, Button, IconButton,
  Snackbar, Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  CompareArrows as CompareIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { Circuit, findCircuit } from '../../data/circuits';
import { getCircuitExtras } from '../../data/circuitMeta';
import { useAllCircuits } from '../../data/useAllCircuits';
import CircuitCard from '../../components/CircuitCard/CircuitCard';
import CircuitDetailDialog from '../../components/CircuitDetailDialog/CircuitDetailDialog';
import CircuitImporter from '../../components/CircuitImporter/CircuitImporter';
import CircuitComparison from './CircuitComparison';
import { sessionsApi } from '../../api/sessions';
import type { Session } from '../../types';
import { PageHeader, Mono, Pill, MiniStat, Label } from '../../components/apex';
import { colors, fonts } from '../../theme/tokens';
import { useTranslation } from 'react-i18next';

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

const Circuits: React.FC = () => {
  const { t } = useTranslation();
  const REGION_LABELS: Record<RegionFilter, string> = {
    all: t('circuits.regions.all'),
    es: t('circuits.regions.es'),
    eu: t('circuits.regions.eu'),
    asia: t('circuits.regions.asia'),
    me: t('circuits.regions.me'),
    am: t('circuits.regions.am'),
    oc: t('circuits.regions.oc'),
  };
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

  const [sessions, setSessions] = useState<Session[]>([]);
  const [bestLapsByCircuit, setBestLapsByCircuit] = useState<Record<string, number>>({});

  useEffect(() => {
    sessionsApi.list().then(setSessions).catch(() => setSessions([]));
  }, []);

  useEffect(() => {
    if (sessions.length === 0) return;
    let cancelled = false;
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

  const sessionsByCircuit = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of sessions) {
      const canon = findCircuit(s.circuit)?.name || s.circuit || '';
      if (!canon) continue;
      map[canon] = (map[canon] || 0) + 1;
    }
    return map;
  }, [sessions]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return allCircuits
      .filter((c) => {
        if (normalizedSearch) {
          const hay = [c.name, ...c.aliases, c.country || '']
            .join(' ')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '');
          if (!hay.includes(normalizedSearch)) return false;
        }
        if (region !== 'all') {
          const cReg = REGION_MAP[c.country || ''] || 'eu';
          if (cReg !== region) return false;
        }
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

  const stats = useMemo(() => {
    const gps = allCircuits.filter((c) => c.realData).length;
    const totalKmAvail = allCircuits.reduce((acc, c) => acc + (c.length_km || 0), 0);
    const totalKmDriven = sessions.reduce((acc, s) => {
      const c = findCircuit(s.circuit);
      return acc + (s.lapCount || 0) * (c?.length_km || 0);
    }, 0);
    const topCircuits = Object.entries(sessionsByCircuit)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    return { total: allCircuits.length, gps, totalKmAvail, totalKmDriven, topCircuits };
  }, [allCircuits, sessions, sessionsByCircuit]);

  const handleCardClick = (c: Circuit) => {
    if (compareMode) {
      if (compareA?.name === c.name) setCompareA(null);
      else if (compareB?.name === c.name) setCompareB(null);
      else if (!compareA) setCompareA(c);
      else if (!compareB) setCompareB(c);
      else setCompareA(c);
    } else {
      setSelected(c);
    }
  };

  const handleImported = (c: Circuit) => {
    refresh();
    setSnack(t('circuits.imported', { name: c.name }));
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
        eyebrow={t('circuits.eyebrow')}
        title={t('circuits.title')}
        subtitle={t('circuits.subtitle')}
        actions={
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setImporterOpen(true)}
              sx={{
                borderColor: colors.border,
                color: colors.textDim,
                fontFamily: fonts.mono,
                fontSize: 10,
                letterSpacing: '1.2px',
                '&:hover': { borderColor: colors.borderHi, color: colors.text, bgcolor: colors.surface2 },
              }}
            >
              {t('circuits.importGeoJson')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<CompareIcon />}
              onClick={() => (compareMode ? exitCompare() : setCompareMode(true))}
              sx={{
                borderColor: compareMode ? colors.accent : colors.border,
                color: compareMode ? colors.accent : colors.textDim,
                bgcolor: compareMode ? `${colors.accent}14` : 'transparent',
                fontFamily: fonts.mono,
                fontSize: 10,
                letterSpacing: '1.2px',
                '&:hover': {
                  borderColor: colors.accent,
                  color: colors.accent,
                  bgcolor: `${colors.accent}1f`,
                },
              }}
            >
              {compareMode ? t('circuits.exitCompare') : t('circuits.compare')}
            </Button>
          </Box>
        }
      />

      <Box
        sx={{
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          p: 2,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
          gap: 2,
        }}
      >
        <MiniStat label={t('circuits.stats.total')} value={stats.total} />
        <MiniStat label={t('circuits.stats.gps')} value={`${stats.gps}/${stats.total}`} tone="accent" />
        <MiniStat label={t('circuits.stats.totalKm')} value={`${stats.totalKmAvail.toFixed(0)} km`} />
        <MiniStat
          label={t('circuits.stats.yourKm')}
          value={stats.totalKmDriven > 0 ? `${stats.totalKmDriven.toFixed(0)} km` : '—'}
          tone={stats.totalKmDriven > 0 ? 'green' : 'dim'}
        />
        <Box>
          <Label tone="mute">{t('circuits.stats.topUsed')}</Label>
          {stats.topCircuits.length === 0 ? (
            <Mono style={{ fontSize: 12, color: colors.textMute, marginTop: 4, display: 'block' }}>—</Mono>
          ) : (
            <div style={{ marginTop: 4 }}>
              {stats.topCircuits.map(([name, count]) => (
                <Mono
                  key={name}
                  style={{
                    fontSize: 11,
                    display: 'block',
                    lineHeight: 1.4,
                    color: colors.text,
                  }}
                >
                  {name.length > 20 ? name.slice(0, 20) + '…' : name}
                  <span style={{ color: colors.textMute }}> ({count})</span>
                </Mono>
              ))}
            </div>
          )}
        </Box>
      </Box>

      {compareMode && (
        <Box
          sx={{
            background: colors.surface2,
            border: `1px solid ${colors.accent}`,
            borderLeft: `3px solid ${colors.accent}`,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Mono style={{ fontSize: 11, color: colors.textDim, letterSpacing: 0.4 }}>
            <strong style={{ color: colors.accent }}>{t('circuits.compareBar.intro')}</strong>
          </Mono>
          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                fontWeight: 600,
                color: compareA ? colors.accent : colors.textMute,
                border: `1px solid ${compareA ? colors.accent : colors.border}`,
                padding: '3px 8px',
                letterSpacing: 0.5,
              }}
            >
              A · {compareA?.name || '—'}
            </span>
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                fontWeight: 600,
                color: compareB ? colors.accent : colors.textMute,
                border: `1px solid ${compareB ? colors.accent : colors.border}`,
                padding: '3px 8px',
                letterSpacing: 0.5,
              }}
            >
              B · {compareB?.name || '—'}
            </span>
            <Button
              size="small"
              variant="contained"
              disabled={!compareA || !compareB}
              onClick={() => setComparisonOpen(true)}
              sx={{
                bgcolor: colors.accent,
                color: colors.bg,
                fontFamily: fonts.mono,
                fontSize: 10,
                letterSpacing: '1.2px',
                '&:hover': { bgcolor: colors.accent, opacity: 0.85 },
              }}
            >
              {t('circuits.compareBar.compareBtn')}
            </Button>
          </Box>
        </Box>
      )}

      <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
        <TextField
          size="small"
          placeholder={t('circuits.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: colors.textMute }} />
              </InputAdornment>
            ),
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
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {(Object.entries(REGION_LABELS) as [RegionFilter, string][]).map(([k, v]) => (
            <Pill key={k} active={region === k} onClick={() => setRegion(k)}>
              {v}
            </Pill>
          ))}
        </Box>
        <Box display="flex" gap={0.5}>
          <Pill active={dataFilter === 'all'} onClick={() => setDataFilter('all')}>{t('circuits.data.all')}</Pill>
          <Pill active={dataFilter === 'gps'} onClick={() => setDataFilter('gps')}>{t('circuits.data.gps')}</Pill>
          <Pill active={dataFilter === 'stylized'} onClick={() => setDataFilter('stylized')}>{t('circuits.data.stylized')}</Pill>
        </Box>
        <Box
          sx={{
            width: 1,
            height: 22,
            background: colors.border,
            mx: 0.5,
          }}
        />
        <Box display="flex" gap={0.5}>
          <Pill active={sortBy === 'name'} onClick={() => setSortBy('name')}>{t('circuits.sort.name')}</Pill>
          <Pill active={sortBy === 'length-desc'} onClick={() => setSortBy('length-desc')}>{t('circuits.sort.lengthDesc')}</Pill>
          <Pill active={sortBy === 'length-asc'} onClick={() => setSortBy('length-asc')}>{t('circuits.sort.lengthAsc')}</Pill>
          <Pill active={sortBy === 'turns-desc'} onClick={() => setSortBy('turns-desc')}>{t('circuits.sort.turnsDesc')}</Pill>
        </Box>
      </Box>

      {filtered.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Mono style={{ color: colors.textMute, fontSize: 12, letterSpacing: 1 }}>
            {t('circuits.noResults')}
          </Mono>
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
          gap={1.5}
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
        {snack ? (
          <Alert severity="success" sx={{ borderRadius: 0 }} onClose={() => setSnack(null)}>
            {snack}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};

export default Circuits;
