import React, { useEffect, useMemo, useState } from 'react';
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

const VAR_LABEL: Record<Variable, { label: string; unit: string }> = {
  trackTemp: { label: 'Track temperature', unit: '°C' },
  ambientTemp: { label: 'Air temperature', unit: '°C' },
  humidity: { label: 'Relative humidity', unit: '%' },
};

const ConditionsImpactPanel: React.FC<Props> = ({ analytics, sessions }) => {
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
      title="Conditions impact"
      right={
        <Mono style={{ color: colors.textMute }}>
          {currentCircuit ? `circuit · ${currentCircuit}` : '— no circuit —'}
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
        Linear regression of your best lap against a conditions variable across all sessions
        on the same circuit.
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
          Track temp
        </Pill>
        <Pill active={variable === 'ambientTemp'} onClick={() => setVariable('ambientTemp')}>
          Air temp
        </Pill>
        <Pill active={variable === 'humidity'} onClick={() => setVariable('humidity')}>
          Humidity
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
          You need at least 3 sessions on this circuit with "
          <span style={{ color: colors.text }}>{VAR_LABEL[variable].label}</span>" filled in to
          run the regression. You have <Mono style={{ color: colors.text, fontWeight: 600 }}>{dataPoints.length}</Mono>.
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
                  name: 'Sessions',
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
                        name: `Fit (R²=${fit.r2.toFixed(3)})`,
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
                    text: 'Best lap (s)',
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
                    {['Metric', 'Value', 'Interpretation'].map((h, i) => (
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
                    metric="Slope"
                    value={
                      <Mono style={{ color: fit.slope > 0 ? colors.red : colors.green, fontWeight: 600 }}>
                        {fit.slope > 0 ? '+' : ''}
                        {fit.slope.toFixed(1)} ms / {VAR_LABEL[variable].unit}
                      </Mono>
                    }
                    interp={
                      <>
                        Each {VAR_LABEL[variable].unit === '°C' ? 'degree' : 'point'}{' '}
                        {fit.slope > 0 ? 'adds' : 'removes'}{' '}
                        <Mono
                          style={{
                            color: fit.slope > 0 ? colors.red : colors.green,
                            fontWeight: 600,
                          }}
                        >
                          {Math.abs(fit.slope).toFixed(0)} ms
                        </Mono>{' '}
                        on your best lap.
                      </>
                    }
                  />
                  <FitRow
                    metric="R²"
                    value={<Mono>{fit.r2.toFixed(3)}</Mono>}
                    interp={
                      fit.r2 > 0.7
                        ? 'strong correlation'
                        : fit.r2 > 0.4
                          ? 'moderate correlation'
                          : fit.r2 > 0.2
                            ? 'weak correlation'
                            : 'no clear correlation — many other factors'
                    }
                  />
                  <FitRow
                    metric="n sessions"
                    value={<Mono>{fit.n}</Mono>}
                    interp={
                      fit.n < 5
                        ? 'Small sample, limited conclusions.'
                        : fit.n < 10
                          ? 'Reasonable sample.'
                          : 'Robust sample.'
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
