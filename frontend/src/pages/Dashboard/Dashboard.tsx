import React, { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { useNavigate } from 'react-router-dom';
import { vehiclesApi } from '../../api/vehicles';
import { usersApi } from '../../api/users';
import { eventsApi } from '../../api/events';
import { sessionsApi, formatLapTime } from '../../api/sessions';
import { findCircuit } from '../../data/circuits';
import { UserRole } from '../../types';
import type { Vehicle, User, Event, Session, SessionAnalytics, LapAnalytics } from '../../types';
import { colors, fonts } from '../../theme/tokens';
import { apexPlotlyLayout, apexPlotlyConfig, apexPaletteSeries } from '../../theme/apexPlotly';
import { Panel, Mono, Label, MiniStat, BigStat, ToolButton } from '../../components/apex';

interface SessionWithAnalytics {
  session: Session;
  analytics: SessionAnalytics | null;
}

const ANALYTICS_RECENT_LIMIT = 15;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [analyticsBySession, setAnalyticsBySession] = useState<Record<number, SessionAnalytics>>({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([
      vehiclesApi.list(), usersApi.list(), eventsApi.list(), sessionsApi.list(),
    ]).then((results) => {
      if (cancelled) return;
      const [v, u, e, s] = results;
      setVehicles(v.status === 'fulfilled' ? v.value : []);
      setUsers(u.status === 'fulfilled' ? u.value : []);
      setEvents(e.status === 'fulfilled' ? e.value : []);
      setSessions(s.status === 'fulfilled' ? s.value : []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [refreshTick]);

  useEffect(() => {
    if (sessions.length === 0) return;
    let cancelled = false;
    const recent = [...sessions]
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
      .slice(0, ANALYTICS_RECENT_LIMIT);
    setAnalyticsLoading(true);
    Promise.all(
      recent.map((s) =>
        sessionsApi.analytics(s.id).then((a) => ({ id: s.id, a })).catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return;
      const byId: Record<number, SessionAnalytics> = {};
      for (const r of results) if (r) byId[r.id] = r.a;
      setAnalyticsBySession(byId);
      setAnalyticsLoading(false);
    });
    return () => { cancelled = true; };
  }, [sessions]);

  const recentWithAnalytics = useMemo<SessionWithAnalytics[]>(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
      .slice(0, ANALYTICS_RECENT_LIMIT)
      .map((s) => ({ session: s, analytics: analyticsBySession[s.id] || null }));
  }, [sessions, analyticsBySession]);

  const kpis = useMemo(() => {
    const totalLaps = sessions.reduce((acc, s) => acc + (s.lapCount || 0), 0);
    const validLaps = recentWithAnalytics.reduce((acc, x) => acc + (x.analytics?.validLaps || 0), 0);
    const totalCandidate = recentWithAnalytics.reduce((acc, x) => acc + (x.analytics?.totalLaps || 0), 0);
    const drivers = new Set(sessions.map((s) => s.driverId).filter((id): id is number => id != null));
    const totalKm = sessions.reduce((acc, s) => {
      const c = findCircuit(s.circuit);
      return acc + (s.lapCount || 0) * (c?.length_km || 0);
    }, 0);
    return {
      sessions: sessions.length,
      totalLaps,
      validLaps,
      totalCandidate,
      drivers: drivers.size || users.filter((u) => u.role === UserRole.PILOT).length,
      vehicles: vehicles.length,
      totalKm,
    };
  }, [sessions, recentWithAnalytics, users, vehicles]);

  const bestByCircuit = useMemo(() => {
    const map: Record<string, {
      circuit: string;
      sessions: number;
      bestMs: number | null;
      bestSession: Session | null;
      theoreticalBestMs: number | null;
      lapCount: number;
    }> = {};
    for (const { session, analytics } of recentWithAnalytics) {
      const canon = findCircuit(session.circuit)?.name || session.circuit || 'sin circuito';
      if (!map[canon]) {
        map[canon] = { circuit: canon, sessions: 0, bestMs: null, bestSession: null, theoreticalBestMs: null, lapCount: 0 };
      }
      const m = map[canon];
      m.sessions++;
      m.lapCount += session.lapCount || 0;
      if (analytics?.bestLapMs != null && (m.bestMs == null || analytics.bestLapMs < m.bestMs)) {
        m.bestMs = analytics.bestLapMs;
        m.bestSession = session;
      }
      if (analytics?.theoreticalBestLapMs != null && (m.theoreticalBestMs == null || analytics.theoreticalBestLapMs < m.theoreticalBestMs)) {
        m.theoreticalBestMs = analytics.theoreticalBestLapMs;
      }
    }
    return Object.values(map).sort((a, b) => b.sessions - a.sessions);
  }, [recentWithAnalytics]);

  const driversLeaderboard = useMemo(() => {
    const map: Record<string, {
      name: string;
      sessions: number;
      laps: number;
      bestMs: number | null;
      avgCV: number | null;
      cvSamples: number;
    }> = {};
    for (const { session, analytics } of recentWithAnalytics) {
      const key = session.driverName || 'sin piloto';
      if (!map[key]) map[key] = { name: key, sessions: 0, laps: 0, bestMs: null, avgCV: null, cvSamples: 0 };
      const m = map[key];
      m.sessions++;
      m.laps += session.lapCount || 0;
      if (analytics?.bestLapMs != null && (m.bestMs == null || analytics.bestLapMs < m.bestMs)) {
        m.bestMs = analytics.bestLapMs;
      }
      if (analytics?.averageMs && analytics.stdDevMs != null && analytics.averageMs > 0) {
        const cv = analytics.stdDevMs / analytics.averageMs;
        m.avgCV = m.avgCV == null ? cv : (m.avgCV * m.cvSamples + cv) / (m.cvSamples + 1);
        m.cvSamples++;
      }
    }
    return Object.values(map)
      .sort((a, b) => {
        if (a.bestMs == null) return 1;
        if (b.bestMs == null) return -1;
        return a.bestMs - b.bestMs;
      })
      .slice(0, 10);
  }, [recentWithAnalytics]);

  const pbEvolution = useMemo(() => {
    return recentWithAnalytics
      .filter((x) => x.analytics?.bestLapMs != null)
      .map((x) => ({
        date: new Date(x.session.sessionDate),
        bestMs: x.analytics!.bestLapMs!,
        sessionName: x.session.name,
        circuit: x.session.circuit || '—',
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [recentWithAnalytics]);

  const lapTimesDist = useMemo(() => {
    const byCircuit: Record<string, number[]> = {};
    for (const { session, analytics } of recentWithAnalytics) {
      if (!analytics) continue;
      const canon = findCircuit(session.circuit)?.name || session.circuit || '—';
      const valid = analytics.perLap.filter((l: LapAnalytics) => l.valid && !l.outlier).map((l) => l.lapTimeMs / 1000);
      if (valid.length === 0) continue;
      if (!byCircuit[canon]) byCircuit[canon] = [];
      byCircuit[canon].push(...valid);
    }
    const out: { circuit: string; times: number[] }[] = [];
    for (const [circuit, times] of Object.entries(byCircuit)) {
      if (times.length >= 3) out.push({ circuit, times });
    }
    return out.slice(0, 6);
  }, [recentWithAnalytics]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => new Date(e.startDate).getTime() >= now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3);
  }, [events]);

  const allTimeBest = useMemo(() => {
    let best: { ms: number; session: Session } | null = null;
    for (const { session, analytics } of recentWithAnalytics) {
      if (analytics?.bestLapMs != null && (best == null || analytics.bestLapMs < best.ms)) {
        best = { ms: analytics.bestLapMs, session };
      }
    }
    return best;
  }, [recentWithAnalytics]);

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Page title strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
          padding: '4px 4px 0',
        }}
      >
        <div>
          <Label size="micro">TEAM · OVERVIEW</Label>
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 0.2,
              color: colors.text,
              marginTop: 4,
            }}
          >
            Dashboard
          </div>
          <Mono
            style={{
              color: colors.textMute,
              fontSize: 11,
              marginTop: 4,
              letterSpacing: '0.4px',
            }}
          >
            Latest {ANALYTICS_RECENT_LIMIT} sessions · {analyticsLoading ? 'loading analytics…' : 'up to date'}
          </Mono>
        </div>
        <ToolButton onClick={() => setRefreshTick((t) => t + 1)} disabled={loading}>
          ↻ Refresh
        </ToolButton>
      </div>

      {/* KPI strip */}
      <Panel padding={16}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 0,
          }}
        >
          <KpiCell label="Sessions" value={loading ? '—' : kpis.sessions} />
          <KpiCell label="Laps recorded" value={loading ? '—' : kpis.totalLaps} />
          <KpiCell
            label="Valid"
            value={kpis.validLaps}
            sub={`of ${kpis.totalCandidate} total`}
          />
          <KpiCell label="Drivers" value={loading ? '—' : kpis.drivers} />
          <KpiCell label="Vehicles" value={loading ? '—' : kpis.vehicles} />
          <KpiCell
            label="Total km"
            value={kpis.totalKm.toFixed(0)}
            sub="estimated"
            last
          />
        </div>
        {analyticsLoading && (
          <div
            style={{
              height: 2,
              background: colors.surface3,
              marginTop: 12,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              className="apex-fade"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '40%',
                background: colors.accent,
                animation: 'apex-live-pulse 1.4s ease-in-out infinite',
              }}
            />
          </div>
        )}
      </Panel>

      {/* All-time best lap hero */}
      {allTimeBest && (
        <Panel
          padding={0}
          style={{ background: colors.surface2, borderColor: colors.borderHi }}
        >
          <div
            style={{
              padding: 18,
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: 22,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: 4,
                alignSelf: 'stretch',
                background: colors.accent,
              }}
            />
            <div>
              <Label>Best lap · recent dataset</Label>
              <Mono
                style={{
                  fontSize: 36,
                  fontWeight: 600,
                  letterSpacing: '1px',
                  color: colors.purple,
                  marginTop: 4,
                  lineHeight: 1,
                }}
              >
                {formatLapTime(allTimeBest.ms)}
              </Mono>
              <Mono
                style={{
                  fontSize: 11,
                  color: colors.textDim,
                  marginTop: 8,
                  letterSpacing: '0.4px',
                }}
              >
                {allTimeBest.session.driverName || '—'} · {allTimeBest.session.circuit || '—'}
                {allTimeBest.session.vehicleName ? ` · ${allTimeBest.session.vehicleName}` : ''}
                {' · '}
                {new Date(allTimeBest.session.sessionDate).toLocaleDateString()}
              </Mono>
            </div>
            <ToolButton onClick={() => navigate('/analytics')} variant="accent">
              Open analytics →
            </ToolButton>
          </div>
        </Panel>
      )}

      {/* 2x2 panel grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        {/* Best per circuit */}
        <Panel
          title="Best lap · per circuit"
          right={
            <Mono style={{ color: colors.textMute }}>
              {bestByCircuit.length} circuit{bestByCircuit.length === 1 ? '' : 's'}
            </Mono>
          }
          padding={0}
        >
          {loading ? (
            <EmptyState text="Loading…" />
          ) : bestByCircuit.length === 0 ? (
            <EmptyState text="No data yet." />
          ) : (
            <DenseTable
              columns={[
                { key: 'circuit', label: 'Circuit', align: 'left', grow: 1 },
                { key: 'sessions', label: 'Ses', align: 'right' },
                { key: 'laps', label: 'Laps', align: 'right' },
                { key: 'best', label: 'Best', align: 'right', mono: true },
                { key: 'theor', label: 'Theor.', align: 'right', mono: true, dim: true },
                { key: 'delta', label: 'Δ', align: 'right', mono: true, tone: 'yellow' },
              ]}
              rows={bestByCircuit.slice(0, 10).map((row) => {
                const delta =
                  row.bestMs != null && row.theoreticalBestMs != null
                    ? row.bestMs - row.theoreticalBestMs
                    : null;
                return {
                  key: row.circuit,
                  cells: {
                    circuit: row.circuit,
                    sessions: row.sessions,
                    laps: row.lapCount,
                    best: formatLapTime(row.bestMs),
                    theor: formatLapTime(row.theoreticalBestMs),
                    delta: delta != null ? `+${(delta / 1000).toFixed(3)}` : '—',
                  },
                };
              })}
            />
          )}
        </Panel>

        {/* Drivers leaderboard */}
        <Panel
          title="Leaderboard · drivers"
          right={<Mono style={{ color: colors.textMute }}>by best lap</Mono>}
          padding={0}
        >
          {loading ? (
            <EmptyState text="Loading…" />
          ) : driversLeaderboard.length === 0 ? (
            <EmptyState text="No data." />
          ) : (
            <DenseTable
              columns={[
                { key: 'pos', label: '#', align: 'left', mono: true, width: 28 },
                { key: 'name', label: 'Driver', align: 'left', grow: 1 },
                { key: 'sessions', label: 'Ses', align: 'right' },
                { key: 'laps', label: 'Laps', align: 'right' },
                { key: 'best', label: 'Best', align: 'right', mono: true },
                { key: 'cv', label: 'CV', align: 'right', mono: true, dim: true },
              ]}
              rows={driversLeaderboard.map((d, i) => ({
                key: d.name,
                highlight: i === 0,
                cells: {
                  pos: i === 0 ? '★' : String(i + 1),
                  name: d.name,
                  sessions: d.sessions,
                  laps: d.laps,
                  best: formatLapTime(d.bestMs),
                  cv: d.avgCV != null ? `${(d.avgCV * 100).toFixed(2)}%` : '—',
                },
              }))}
            />
          )}
        </Panel>

        {/* PB evolution */}
        <Panel
          title="Best lap evolution"
          right={<Mono style={{ color: colors.textMute }}>{pbEvolution.length} points</Mono>}
          padding={12}
        >
          {pbEvolution.length < 2 ? (
            <EmptyState text="Need at least 2 sessions with analytics." />
          ) : (
            <Plot
              data={
                [
                  {
                    x: pbEvolution.map((p) => p.date),
                    y: pbEvolution.map((p) => p.bestMs / 1000),
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { color: colors.accent, width: 2 },
                    marker: { size: 6, color: colors.accent, line: { color: colors.bg, width: 1 } },
                    text: pbEvolution.map((p) => `${p.sessionName}<br>${p.circuit}`),
                    hovertemplate: '%{text}<br>%{y:.3f}s<extra></extra>',
                  },
                ] as never
              }
              layout={
                apexPlotlyLayout({
                  height: 240,
                  yaxis: {
                    ...apexPlotlyLayout().yaxis as object,
                    title: { text: 'Best lap (s)', font: { family: fonts.mono, size: 10, color: colors.textMute } },
                  },
                }) as never
              }
              useResizeHandler
              style={{ width: '100%', height: 240 }}
              config={apexPlotlyConfig as never}
            />
          )}
        </Panel>

        {/* Per-circuit distribution */}
        <Panel
          title="Distribution · per circuit"
          right={<Mono style={{ color: colors.textMute }}>boxplot · valid laps</Mono>}
          padding={12}
        >
          {lapTimesDist.length === 0 ? (
            <EmptyState text="Not enough data for boxplots." />
          ) : (
            <Plot
              data={
                lapTimesDist.map((d, i) => ({
                  y: d.times,
                  type: 'box' as const,
                  name: d.circuit.length > 22 ? d.circuit.slice(0, 22) + '…' : d.circuit,
                  boxpoints: 'outliers' as const,
                  marker: { size: 3, color: apexPaletteSeries[i % apexPaletteSeries.length] },
                  line: { color: apexPaletteSeries[i % apexPaletteSeries.length] },
                  fillcolor: 'rgba(62, 197, 209, 0.08)',
                })) as never
              }
              layout={
                apexPlotlyLayout({
                  height: 240,
                  margin: { l: 50, r: 14, t: 10, b: 100 },
                  yaxis: {
                    ...apexPlotlyLayout().yaxis as object,
                    title: { text: 'Lap time (s)', font: { family: fonts.mono, size: 10, color: colors.textMute } },
                  },
                  xaxis: {
                    ...apexPlotlyLayout().xaxis as object,
                    tickangle: -35,
                  },
                }) as never
              }
              useResizeHandler
              style={{ width: '100%', height: 240 }}
              config={apexPlotlyConfig as never}
            />
          )}
        </Panel>
      </div>

      {/* Recent sessions */}
      <Panel
        title="Recent sessions"
        right={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {upcomingEvents.length > 0 && (
              <Mono
                style={{
                  color: colors.accent,
                  cursor: 'pointer',
                  letterSpacing: '0.6px',
                }}
                onClick={() => navigate('/calendar')}
              >
                {upcomingEvents.length} upcoming event{upcomingEvents.length === 1 ? '' : 's'} →
              </Mono>
            )}
            <Mono
              style={{
                color: colors.accent,
                cursor: 'pointer',
                letterSpacing: '0.6px',
              }}
              onClick={() => navigate('/analytics')}
            >
              Go to analytics →
            </Mono>
          </div>
        }
        padding={0}
      >
        {loading ? (
          <EmptyState text="Loading…" />
        ) : (
          <DenseTable
            columns={[
              { key: 'name', label: 'Session', align: 'left', grow: 2 },
              { key: 'date', label: 'Date', align: 'left', mono: true },
              { key: 'circuit', label: 'Circuit', align: 'left', grow: 1 },
              { key: 'driver', label: 'Driver', align: 'left' },
              { key: 'vehicle', label: 'Vehicle', align: 'left' },
              { key: 'laps', label: 'Laps', align: 'right' },
              { key: 'best', label: 'Best', align: 'right', mono: true },
              { key: 'median', label: 'Median', align: 'right', mono: true, dim: true },
              { key: 'cv', label: 'CV', align: 'right', mono: true },
              { key: 'cond', label: 'Cond.', align: 'right', mono: true, dim: true },
            ]}
            rows={recentWithAnalytics.map(({ session, analytics }) => {
              const cv =
                analytics?.averageMs && analytics.stdDevMs != null && analytics.averageMs > 0
                  ? (analytics.stdDevMs / analytics.averageMs) * 100
                  : null;
              const condParts: string[] = [];
              if (session.trackTempC != null) condParts.push(`${session.trackTempC}°`);
              if (session.trackCondition) condParts.push(session.trackCondition);
              return {
                key: String(session.id),
                onClick: () => navigate('/analytics'),
                cells: {
                  name: session.name,
                  date: new Date(session.sessionDate).toLocaleDateString(),
                  circuit: session.circuit || '—',
                  driver: session.driverName || '—',
                  vehicle: session.vehicleName || '—',
                  laps: session.lapCount,
                  best: formatLapTime(analytics?.bestLapMs),
                  median: formatLapTime(analytics?.medianMs),
                  cv: cv != null ? `${cv.toFixed(2)}%` : '—',
                  cond: condParts.length ? condParts.join(' ') : '—',
                },
              };
            })}
          />
        )}
      </Panel>
    </div>
  );
};

/* ─── Local cells ─────────────────────────────────────────────────────────── */

interface KpiCellProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  last?: boolean;
}

const KpiCell: React.FC<KpiCellProps> = ({ label, value, sub, last }) => (
  <div
    style={{
      padding: '4px 18px',
      borderLeft: 'none',
      borderRight: last ? 'none' : `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minWidth: 0,
    }}
  >
    <MiniStat label={label} value={value} size="md" />
    {sub && (
      <Mono style={{ fontSize: 10, color: colors.textMute, letterSpacing: '0.4px' }}>
        {sub}
      </Mono>
    )}
  </div>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      padding: '32px 16px',
      textAlign: 'center',
      color: colors.textMute,
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: '0.6px',
    }}
  >
    {text}
  </div>
);

/* ─── Dense table primitive (local, will move to apex/ if reused) ────────── */

interface Column {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width?: number;
  grow?: number;
  mono?: boolean;
  dim?: boolean;
  tone?: 'yellow' | 'green' | 'red' | 'purple' | 'accent';
}

interface Row {
  key: string;
  cells: Record<string, React.ReactNode>;
  highlight?: boolean;
  onClick?: () => void;
}

const TONE_COLOR: Record<string, string> = {
  yellow: colors.yellow,
  green: colors.green,
  red: colors.red,
  purple: colors.purple,
  accent: colors.accent,
};

const DenseTable: React.FC<{ columns: Column[]; rows: Row[] }> = ({ columns, rows }) => (
  <div style={{ width: '100%', overflow: 'auto' }}>
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: fonts.sans,
      }}
    >
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              style={{
                textAlign: c.align ?? 'left',
                fontFamily: fonts.mono,
                fontSize: 10,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: colors.textMute,
                fontWeight: 600,
                padding: '8px 12px',
                background: colors.surface2,
                borderBottom: `1px solid ${colors.borderHi}`,
                width: c.width,
                whiteSpace: 'nowrap',
              }}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr
            key={r.key}
            onClick={r.onClick}
            style={{
              cursor: r.onClick ? 'pointer' : 'default',
              background: r.highlight
                ? 'rgba(187, 108, 255, 0.06)'
                : idx % 2 === 0
                  ? 'transparent'
                  : colors.surface2,
              transition: 'background 80ms ease',
            }}
            onMouseEnter={(e) => {
              if (r.onClick) (e.currentTarget as HTMLTableRowElement).style.background = colors.surface3;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLTableRowElement).style.background = r.highlight
                ? 'rgba(187, 108, 255, 0.06)'
                : idx % 2 === 0
                  ? 'transparent'
                  : colors.surface2;
            }}
          >
            {columns.map((c) => (
              <td
                key={c.key}
                style={{
                  textAlign: c.align ?? 'left',
                  fontFamily: c.mono ? fonts.mono : fonts.sans,
                  fontSize: 12,
                  fontWeight: c.mono ? 600 : 500,
                  color: c.tone
                    ? TONE_COLOR[c.tone]
                    : c.dim
                      ? colors.textDim
                      : colors.text,
                  padding: '8px 12px',
                  borderBottom: `1px solid ${colors.border}`,
                  whiteSpace: 'nowrap',
                  maxWidth: c.grow ? undefined : 220,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontVariantNumeric: c.mono ? 'tabular-nums' : undefined,
                }}
              >
                {r.cells[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Dashboard;
