import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  OutlinedInput,
  Chip,
  CircularProgress,
} from '@mui/material';
import Plot from 'react-plotly.js';
import type { Session, SessionAnalytics } from '../../types';
import { sessionsApi } from '../../api/sessions';
import { kde, percentile } from '../../utils/stats';
import { colors, fonts } from '../../theme/tokens';
import {
  apexPlotlyLayout,
  apexPlotlyConfig,
  apexPaletteSeries,
} from '../../theme/apexPlotly';
import { Panel, Mono } from '../../components/apex';

interface Props {
  analytics: SessionAnalytics;
  sessions: Session[];
}

const DistributionsPanel: React.FC<Props> = ({ analytics, sessions }) => {
  const { t } = useTranslation();
  const [overlayIds, setOverlayIds] = useState<number[]>([]);
  const [overlayAnalytics, setOverlayAnalytics] = useState<SessionAnalytics[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (overlayIds.length === 0) {
      setOverlayAnalytics([]);
      return;
    }
    setLoading(true);
    Promise.all(overlayIds.map((id) => sessionsApi.analytics(id).catch(() => null)))
      .then((arr) => setOverlayAnalytics(arr.filter((x): x is SessionAnalytics => x != null)))
      .finally(() => setLoading(false));
  }, [overlayIds]);

  const datasets = useMemo(() => {
    const list = [
      { name: analytics.sessionName, analytics, isMain: true },
      ...overlayAnalytics.map((a) => ({
        name: a.sessionName,
        analytics: a,
        isMain: false,
      })),
    ];
    return list.map((d, i) => {
      const validLaps = d.analytics.perLap
        .filter((l) => l.valid && !l.outlier)
        .map((l) => l.lapTimeMs / 1000);
      return {
        name: d.name,
        color: apexPaletteSeries[i % apexPaletteSeries.length],
        times: validLaps,
        isMain: d.isMain,
      };
    });
  }, [analytics, overlayAnalytics]);

  const xRange = useMemo(() => {
    const all = datasets.flatMap((d) => d.times);
    if (all.length === 0) return null;
    const p1 = percentile(all, 0.01);
    const p99 = percentile(all, 0.99);
    const pad = (p99 - p1) * 0.05;
    return { min: p1 - pad, max: p99 + pad };
  }, [datasets]);

  const evalPoints = useMemo(() => {
    if (!xRange) return [];
    const n = 100;
    const step = (xRange.max - xRange.min) / (n - 1);
    return Array.from({ length: n }, (_, i) => xRange.min + i * step);
  }, [xRange]);

  return (
    <Panel
      title={t('analytics.distributions.title')}
      right={<Mono style={{ color: colors.textMute }}>{t('analytics.distributions.subtitle')}</Mono>}
      padding={16}
    >
      <Mono
        style={{
          fontSize: 11,
          color: colors.textMute,
          letterSpacing: '0.3px',
          marginBottom: 14,
          lineHeight: 1.5,
          display: 'block',
        }}
      >
        {t('analytics.distributions.helper')}
      </Mono>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>{t('analytics.distributions.overlay')}</InputLabel>
        <Select
          multiple
          value={overlayIds}
          onChange={(e) => setOverlayIds((e.target.value as number[]).slice(0, 5))}
          input={<OutlinedInput label={t('analytics.distributions.overlay')} />}
          renderValue={(selected) => (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {(selected as number[]).map((id) => {
                const s = sessions.find((x) => x.id === id);
                return <Chip key={id} size="small" label={s?.name || id} />;
              })}
            </div>
          )}
        >
          {sessions
            .filter((s) => s.id !== analytics.sessionId)
            .map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name} · {new Date(s.sessionDate).toLocaleDateString()}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {loading && (
        <div style={{ marginBottom: 8 }}>
          <CircularProgress size={16} />
        </div>
      )}

      {xRange && evalPoints.length > 0 && datasets[0].times.length >= 2 ? (
        <Plot
          data={
            [
              ...datasets.map((d) => ({
                x: d.times,
                type: 'histogram' as const,
                name: `${d.name} (hist)`,
                marker: { color: d.color, opacity: 0.22 },
                histnorm: 'probability density' as const,
                nbinsx: 25,
                xbins: { start: xRange.min, end: xRange.max },
                showlegend: false,
              })),
              ...datasets.map((d) => ({
                x: evalPoints,
                y: kde(d.times, evalPoints),
                type: 'scatter' as const,
                mode: 'lines' as const,
                name: d.name,
                line: { color: d.color, width: d.isMain ? 2.5 : 1.8 },
              })),
              ...datasets.map((d) => {
                const med = percentile(d.times, 0.5);
                return {
                  x: [med, med],
                  y: [0, 0.5],
                  type: 'scatter' as const,
                  mode: 'lines' as const,
                  name: `${d.name} median`,
                  line: { color: d.color, dash: 'dot' as const, width: 1 },
                  showlegend: false,
                  hoverinfo: 'x' as const,
                };
              }),
            ] as never
          }
          layout={
            apexPlotlyLayout({
              height: 360,
              barmode: 'overlay',
              margin: { l: 50, r: 14, t: 10, b: 36 },
              xaxis: {
                ...(apexPlotlyLayout().xaxis as object),
                title: {
                  text: t('analytics.distributions.lapTimeAxis'),
                  font: { family: fonts.mono, size: 10, color: colors.textMute },
                },
                range: [xRange.min, xRange.max],
              },
              yaxis: {
                ...(apexPlotlyLayout().yaxis as object),
                title: {
                  text: t('analytics.distributions.density'),
                  font: { family: fonts.mono, size: 10, color: colors.textMute },
                },
              },
            }) as never
          }
          useResizeHandler
          style={{ width: '100%', height: 360 }}
          config={apexPlotlyConfig as never}
        />
      ) : (
        <Mono
          style={{
            color: colors.textMute,
            fontSize: 11,
            letterSpacing: '0.4px',
          }}
        >
          {t('analytics.distributions.needMore')}
        </Mono>
      )}

      {/* Legend / stats */}
      {datasets[0].times.length >= 2 && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: `1px solid ${colors.border}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 8,
          }}
        >
          {datasets.map((d) => (
            <div
              key={d.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 8px',
                background: colors.surface2,
                border: `1px solid ${colors.border}`,
                borderLeft: `2px solid ${d.color}`,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  background: d.color,
                  flexShrink: 0,
                }}
              />
              <Mono
                style={{
                  fontSize: 11,
                  color: colors.text,
                  letterSpacing: '0.3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span style={{ color: colors.textDim, marginRight: 6 }}>{d.name}</span>
                {t('analytics.distributions.lapsMed', {
                  laps: d.times.length,
                  med: percentile(d.times, 0.5).toFixed(3),
                  iqr: (percentile(d.times, 0.75) - percentile(d.times, 0.25)).toFixed(3),
                })}
              </Mono>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
};

export default DistributionsPanel;
