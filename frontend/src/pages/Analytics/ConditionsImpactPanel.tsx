import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgress } from '@mui/material';
import Plot from 'react-plotly.js';
import type { Session, SessionAnalytics } from '../../types';
import { sessionsApi } from '../../api/sessions';
import { findCircuit } from '../../data/circuits';
import { linearFit } from '../../utils/stats';
import { colors, fonts } from '../../theme/tokens';
import { apexPlotlyLayout, apexPlotlyConfig } from '../../theme/apexPlotly';
import { Panel, Mono, Pill } from '../../components/apex';

interface Props {
  analytics: SessionAnalytics;
  sessions: Session[];
}

type Variable = 'trackTemp' | 'ambientTemp' | 'humidity';

interface DataPoint {
  x: number;
  y: number;
  session: Session;
}

const ConditionsImpactPanel: React.FC<Props> = ({ analytics, sessions }) => {
  const { t } = useTranslation();
  const VAR_LABEL: Record<Variable, { label: string; unit: string }> = {
    trackTemp: { label: t('analytics.conditions.var.trackTempLabel'), unit: t('analytics.conditions.var.trackTempUnit') },
    ambientTemp: { label: t('analytics.conditions.var.ambientTempLabel'), unit: t('analytics.conditions.var.ambientTempUnit') },
    humidity: { label: t('analytics.conditions.var.humidityLabel'), unit: t('analytics.conditions.var.humidityUnit') },
  };
  const [variable, setVariable] = useState<Variable>('trackTemp');
  const [analyticsCache, setAnalyticsCache] = useState<Record<number, SessionAnalytics>>({});
  const [loading, setLoading] = useState(false);

  const currentSession = sessions.find((s) => s.id === analytics.sessionId);
  const currentCircuit = useMemo(() => {
    return findCircuit(currentSession?.circuit)?.name || currentSession?.circuit || null;
  }, [currentSession]);

  const sameCircuitSessions = useMemo(() => {
    if (!currentCircuit) return [];
    return sessions.filter((s) => {
      const canon = findCircuit(s.circuit)?.name || s.circuit;
      return canon === currentCircuit;
    });
  }, [sessions, currentCircuit]);

  useEffect(() => {
    if (sameCircuitSessions.length === 0) return;
    const missing = sameCircuitSessions.filter((s) => !(s.id in analyticsCache));
    if (missing.length === 0) return;
    setLoading(true);
    Promise.all(
      missing.map((s) =>
        sessionsApi
          .analytics(s.id)
          .then((a) => ({ id: s.id, a }))
          .catch(() => null),
      ),
    ).then((results) => {
      const next = { ...analyticsCache };
      next[analytics.sessionId] = analytics;
      for (const r of results) if (r) next[r.id] = r.a;
      setAnalyticsCache(next);
      setLoading(false);
    });
  }, [sameCircuitSessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const dataPoints = useMemo<DataPoint[]>(() => {
    return sameCircuitSessions
      .map((s) => {
        const a = analyticsCache[s.id] || (s.id === analytics.sessionId ? analytics : null);
        if (!a?.bestLapMs) return null;
        const x =
          variable === 'trackTemp'
            ? s.trackTempC
            : variable === 'ambientTemp'
              ? s.ambientTempC
              : s.humidityPct;
        if (x == null) return null;
        return { x: Number(x), y: a.bestLapMs, session: s };
      })
      .filter((p): p is DataPoint => p != null);
  }, [sameCircuitSessions, analyticsCache, analytics, variable]);

  const fit = useMemo(() => {
    if (dataPoints.length < 3) return null;
    return linearFit(
      dataPoints.map((p) => p.x),
      dataPoints.map((p) => p.y),
    );
  }, [dataPoints]);

  const xs = dataPoints.map((p) => p.x);
  const minX = xs.length ? Math.min(...xs) : 0;
  const maxX = xs.length ? Math.max(...xs) : 0;

  return (
    <Panel
      title={t('analytics.conditions.title')}
      right={
        <Mono style={{ color: colors.textMute }}>
          {currentCircuit ? t('analytics.conditions.circuitOf', { name: currentCircuit }) : t('analytics.conditions.noCircuit')}
        </Mono>
      }
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
        {t('analytics.conditions.helper')}
      </Mono>

      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <Pill active={variable === 'trackTemp'} onClick={() => setVariable('trackTemp')}>
          {t('analytics.conditions.trackTemp')}
        </Pill>
        <Pill active={variable === 'ambientTemp'} onClick={() => setVariable('ambientTemp')}>
          {t('analytics.conditions.airTemp')}
        </Pill>
        <Pill active={variable === 'humidity'} onClick={() => setVariable('humidity')}>
          {t('analytics.conditions.humidity')}
        </Pill>
      </div>

      {loading && (
        <div style={{ marginBottom: 8 }}>
          <CircularProgress size={16} />
        </div>
      )}

      {dataPoints.length < 3 ? (
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderLeft: `3px solid ${colors.accent}`,
            background: 'rgba(62, 197, 209, 0.04)',
            padding: '10px 14px',
            fontSize: 12,
            color: colors.textDim,
            lineHeight: 1.5,
          }}
        >
          {t('analytics.conditions.needMore', { var: VAR_LABEL[variable].label })}{' '}
          <Mono style={{ color: colors.text, fontWeight: 600 }}>{dataPoints.length}</Mono>.
        </div>
      ) : (
        <>
          <Plot
            data={
              [
                {
                  x: dataPoints.map((p) => p.x),
                  y: dataPoints.map((p) => p.y / 1000),
                  type: 'scatter' as const,
                  mode: 'markers' as const,
                  name: t('analytics.conditions.sessions'),
                  marker: {
                    color: colors.accent,
                    size: 8,
                    line: { color: colors.bg, width: 1 },
                  },
                  text: dataPoints.map(
                    (p) =>
                      `${p.session.name}<br>${new Date(p.session.sessionDate).toLocaleDateString()}`,
                  ),
                  hovertemplate:
                    '%{text}<br>%{x} ' +
                    VAR_LABEL[variable].unit +
                    '<br>%{y:.3f}s<extra></extra>',
                },
                ...(fit
                  ? [
                      {
                        x: [minX, maxX],
                        y: [fit.predict(minX) / 1000, fit.predict(maxX) / 1000],
                        type: 'scatter' as const,
                        mode: 'lines' as const,
                        name: t('analytics.conditions.fit', { r: fit.r2.toFixed(3) }),
                        line: { color: colors.purple, width: 2, dash: 'dash' as const },
                      },
                    ]
                  : []),
              ] as never
            }
            layout={
              apexPlotlyLayout({
                height: 280,
                margin: { l: 60, r: 14, t: 10, b: 40 },
                xaxis: {
                  ...(apexPlotlyLayout().xaxis as object),
                  title: {
                    text: `${VAR_LABEL[variable].label} (${VAR_LABEL[variable].unit})`,
                    font: { family: fonts.mono, size: 10, color: colors.textMute },
                  },
                },
                yaxis: {
                  ...(apexPlotlyLayout().yaxis as object),
                  title: {
                    text: t('analytics.conditions.bestLapAxis'),
                    font: { family: fonts.mono, size: 10, color: colors.textMute },
                  },
                },
              }) as never
            }
            useResizeHandler
            style={{ width: '100%', height: 280 }}
            config={apexPlotlyConfig as never}
          />

          {fit && (
            <div
              style={{
                marginTop: 14,
                border: `1px solid ${colors.border}`,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {[t('analytics.conditions.col.metric'), t('analytics.conditions.col.value'), t('analytics.conditions.col.interp')].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          textAlign: i === 1 ? 'right' : 'left',
                          fontFamily: fonts.mono,
                          fontSize: 10,
                          letterSpacing: '1.2px',
                          textTransform: 'uppercase',
                          color: colors.textMute,
                          fontWeight: 600,
                          padding: '8px 12px',
                          background: colors.surface2,
                          borderBottom: `1px solid ${colors.borderHi}`,
                          width: i === 0 ? 110 : i === 1 ? 160 : undefined,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <FitRow
                    metric={t('analytics.conditions.slope')}
                    value={
                      <Mono style={{ color: fit.slope > 0 ? colors.red : colors.green, fontWeight: 600 }}>
                        {fit.slope > 0 ? '+' : ''}
                        {fit.slope.toFixed(1)} {t('analytics.conditions.msPer', { unit: VAR_LABEL[variable].unit })}
                      </Mono>
                    }
                    interp={
                      <>
                        {t('analytics.conditions.each')}{' '}
                        {VAR_LABEL[variable].unit === '°C' ? t('analytics.conditions.degree') : t('analytics.conditions.point')}{' '}
                        {fit.slope > 0 ? t('analytics.conditions.adds') : t('analytics.conditions.removes')}{' '}
                        <Mono
                          style={{
                            color: fit.slope > 0 ? colors.red : colors.green,
                            fontWeight: 600,
                          }}
                        >
                          {Math.abs(fit.slope).toFixed(0)} ms
                        </Mono>{' '}
                        {t('analytics.conditions.msOnBest')}
                      </>
                    }
                  />
                  <FitRow
                    metric={t('analytics.conditions.r2')}
                    value={<Mono>{fit.r2.toFixed(3)}</Mono>}
                    interp={
                      fit.r2 > 0.7
                        ? t('analytics.conditions.r2Strong')
                        : fit.r2 > 0.4
                          ? t('analytics.conditions.r2Moderate')
                          : fit.r2 > 0.2
                            ? t('analytics.conditions.r2Weak')
                            : t('analytics.conditions.r2None')
                    }
                  />
                  <FitRow
                    metric={t('analytics.conditions.nSessions')}
                    value={<Mono>{fit.n}</Mono>}
                    interp={
                      fit.n < 5
                        ? t('analytics.conditions.nSmall')
                        : fit.n < 10
                          ? t('analytics.conditions.nReasonable')
                          : t('analytics.conditions.nRobust')
                    }
                    last
                  />
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Panel>
  );
};

function FitRow({
  metric,
  value,
  interp,
  last,
}: {
  metric: React.ReactNode;
  value: React.ReactNode;
  interp: React.ReactNode;
  last?: boolean;
}) {
  return (
    <tr>
      <td
        style={{
          padding: '8px 12px',
          borderBottom: last ? 'none' : `1px solid ${colors.border}`,
          fontFamily: fonts.sans,
          fontSize: 12,
          fontWeight: 600,
          color: colors.text,
          verticalAlign: 'top',
        }}
      >
        {metric}
      </td>
      <td
        style={{
          padding: '8px 12px',
          borderBottom: last ? 'none' : `1px solid ${colors.border}`,
          fontFamily: fonts.mono,
          fontSize: 12,
          color: colors.text,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          verticalAlign: 'top',
        }}
      >
        {value}
      </td>
      <td
        style={{
          padding: '8px 12px',
          borderBottom: last ? 'none' : `1px solid ${colors.border}`,
          fontFamily: fonts.sans,
          fontSize: 12,
          color: colors.textDim,
          verticalAlign: 'top',
        }}
      >
        {interp}
      </td>
    </tr>
  );
}

export default ConditionsImpactPanel;
