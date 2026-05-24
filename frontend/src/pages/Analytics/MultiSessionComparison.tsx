import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Plot from 'react-plotly.js';
import { SessionAnalytics } from '../../types';
import { formatGap, formatLapTime } from '../../api/sessions';
import { colors, fonts } from '../../theme/tokens';
import {
  apexPlotlyLayout,
  apexPlotlyConfig,
  apexPaletteSeries,
} from '../../theme/apexPlotly';
import { Panel, Mono, Label } from '../../components/apex';

interface Props {
  analytics: SessionAnalytics[];
}

const MultiSessionComparison: React.FC<Props> = ({ analytics }) => {
  const { t } = useTranslation();
  const allLapNumbers = useMemo(() => {
    const set = new Set<number>();
    analytics.forEach((a) => a.perLap.forEach((l) => set.add(l.lapNumber)));
    return Array.from(set).sort((a, b) => a - b);
  }, [analytics]);

  const validTimesBySession = useMemo(
    () =>
      analytics.map((a) =>
        a.perLap.filter((l) => l.valid).map((l) => l.lapTimeMs / 1000),
      ),
    [analytics],
  );

  const referenceBest = useMemo(() => {
    const bests = analytics.map((a) => a.bestLapMs ?? Number.POSITIVE_INFINITY);
    return Math.min(...bests);
  }, [analytics]);

  const lineData = useMemo(
    () =>
      analytics.map((a, idx) => {
        const color = apexPaletteSeries[idx % apexPaletteSeries.length];
        const lapMap = new Map(a.perLap.map((l) => [l.lapNumber, l]));
        return {
          x: allLapNumbers,
          y: allLapNumbers.map((n) => {
            const lap = lapMap.get(n);
            if (!lap || !lap.valid) return null;
            return lap.lapTimeMs / 1000;
          }),
          type: 'scatter' as const,
          mode: 'lines+markers' as const,
          name: a.sessionName,
          line: { color, width: idx === 0 ? 2.5 : 2 },
          marker: {
            color,
            size: 5,
            line: { color: colors.bg, width: 1 },
          },
          connectgaps: false,
        };
      }),
    [analytics, allLapNumbers],
  );

  const violinData = analytics.map((a, idx) => {
    const color = apexPaletteSeries[idx % apexPaletteSeries.length];
    return {
      y: validTimesBySession[idx],
      type: 'violin' as const,
      name: a.sessionName,
      line: { color },
      fillcolor: color,
      opacity: 0.45,
      box: { visible: true, fillcolor: colors.surface3, line: { color } },
      meanline: { visible: true, color: colors.text },
      points: 'all' as const,
      jitter: 0.4,
      pointpos: 0,
      marker: { size: 3, color },
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Legend */}
      <Panel padding={12}>
        <div
          style={{
            display: 'flex',
            gap: 18,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Label>{t('analytics.multi.comparedSessions')}</Label>
          {analytics.map((a, idx) => (
            <div
              key={a.sessionId}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  background: apexPaletteSeries[idx % apexPaletteSeries.length],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: colors.text,
                  fontFamily: fonts.sans,
                }}
              >
                {a.sessionName}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {/* KPI cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(analytics.length, 4)}, 1fr)`,
          gap: 12,
        }}
      >
        {analytics.map((a, idx) => {
          const color = apexPaletteSeries[idx % apexPaletteSeries.length];
          const gapToRef =
            a.bestLapMs != null && referenceBest !== Number.POSITIVE_INFINITY
              ? a.bestLapMs - referenceBest
              : null;
          return (
            <div
              key={a.sessionId}
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderLeft: `3px solid ${color}`,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minWidth: 0,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <Label size="micro">{t('analytics.multi.bestLap')}</Label>
                <Mono
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: gapToRef === 0 ? colors.purple : colors.text,
                    letterSpacing: '0.4px',
                    marginTop: 4,
                    display: 'block',
                  }}
                >
                  {formatLapTime(a.bestLapMs)}
                </Mono>
                {gapToRef != null && gapToRef !== 0 && (
                  <Mono
                    style={{
                      fontSize: 11,
                      color: gapToRef > 0 ? colors.red : colors.green,
                      letterSpacing: '0.3px',
                      marginTop: 4,
                      display: 'block',
                    }}
                  >
                    {t('analytics.multi.gapVsBest', { gap: formatGap(gapToRef) })}
                  </Mono>
                )}
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: 4,
                  paddingTop: 8,
                  borderTop: `1px solid ${colors.border}`,
                }}
              >
                <KRow label={t('analytics.multi.average')} value={formatLapTime(a.averageMs)} />
                <KRow label={t('analytics.multi.median')} value={formatLapTime(a.medianMs)} />
                <KRow
                  label={t('analytics.multi.sigma')}
                  value={a.stdDevMs != null ? `±${(a.stdDevMs / 1000).toFixed(3)}s` : '—'}
                />
                <KRow
                  label={t('analytics.multi.theoretical')}
                  value={formatLapTime(a.theoreticalBestLapMs)}
                />
                <KRow
                  label={t('analytics.multi.valid')}
                  value={`${a.validLaps}/${a.totalLaps}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Line overlay */}
      <Panel
        title={t('analytics.multi.lapTimesOverlay')}
        right={<Mono style={{ color: colors.textMute }}>{t('analytics.multi.allSessions')}</Mono>}
        padding={12}
      >
        <Plot
          data={lineData as never}
          layout={
            apexPlotlyLayout({
              height: 360,
              margin: { l: 50, r: 14, t: 10, b: 60 },
              xaxis: {
                ...(apexPlotlyLayout().xaxis as object),
                title: {
                  text: t('analytics.multi.lap'),
                  font: { family: fonts.mono, size: 10, color: colors.textMute },
                },
                dtick: 1,
              },
              yaxis: {
                ...(apexPlotlyLayout().yaxis as object),
                title: {
                  text: t('analytics.multi.seconds'),
                  font: { family: fonts.mono, size: 10, color: colors.textMute },
                },
                tickformat: '.2f',
                autorange: true,
              },
              showlegend: true,
              legend: {
                orientation: 'h' as const,
                y: -0.18,
                font: { family: fonts.mono, size: 10, color: colors.textDim },
              },
            }) as never
          }
          useResizeHandler
          style={{ width: '100%', height: 360 }}
          config={apexPlotlyConfig as never}
        />
      </Panel>

      {/* Violin plot */}
      <Panel title={t('analytics.multi.distributionsViolin')} padding={12}>
        <Mono
          style={{
            fontSize: 11,
            color: colors.textMute,
            letterSpacing: '0.3px',
            marginBottom: 10,
            display: 'block',
            lineHeight: 1.5,
          }}
        >
          {t('analytics.multi.violinHelper')}
        </Mono>
        <Plot
          data={violinData as never}
          layout={
            apexPlotlyLayout({
              height: 380,
              margin: { l: 50, r: 14, t: 10, b: 80 },
              yaxis: {
                ...(apexPlotlyLayout().yaxis as object),
                title: {
                  text: t('analytics.multi.seconds'),
                  font: { family: fonts.mono, size: 10, color: colors.textMute },
                },
                tickformat: '.2f',
              },
              showlegend: false,
            }) as never
          }
          useResizeHandler
          style={{ width: '100%', height: 380 }}
          config={apexPlotlyConfig as never}
        />
      </Panel>

      {/* Comparison table */}
      <Panel title={t('analytics.multi.comparisonTable')} padding={0}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    color: colors.textMute,
                    fontWeight: 600,
                    padding: '8px 12px',
                    background: colors.surface2,
                    borderBottom: `1px solid ${colors.borderHi}`,
                  }}
                >
                  {t('analytics.multi.col.metric')}
                </th>
                {analytics.map((a, idx) => (
                  <th
                    key={a.sessionId}
                    style={{
                      textAlign: 'right',
                      fontFamily: fonts.mono,
                      fontSize: 10,
                      letterSpacing: '1.2px',
                      textTransform: 'uppercase',
                      color: apexPaletteSeries[idx % apexPaletteSeries.length],
                      fontWeight: 700,
                      padding: '8px 12px',
                      background: colors.surface2,
                      borderBottom: `1px solid ${colors.borderHi}`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.sessionName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                label={t('analytics.multi.row.bestLap')}
                values={analytics.map((a) => a.bestLapMs)}
                format={formatLapTime}
              />
              <ComparisonRow
                label={t('analytics.multi.row.average')}
                values={analytics.map((a) => a.averageMs)}
                format={formatLapTime}
              />
              <ComparisonRow
                label={t('analytics.multi.row.median')}
                values={analytics.map((a) => a.medianMs)}
                format={formatLapTime}
              />
              <ComparisonRow
                label={t('analytics.multi.row.consistency')}
                values={analytics.map((a) => a.stdDevMs)}
                format={(n) => (n != null ? `±${(n / 1000).toFixed(3)}s` : '—')}
                lowerIsBetter
              />
              <ComparisonRow
                label={t('analytics.multi.row.theoretical')}
                values={analytics.map((a) => a.theoreticalBestLapMs)}
                format={formatLapTime}
              />
              <ComparisonRow
                label={t('analytics.multi.row.bestS1')}
                values={analytics.map((a) => a.bestSector1Ms)}
                format={formatLapTime}
              />
              <ComparisonRow
                label={t('analytics.multi.row.bestS2')}
                values={analytics.map((a) => a.bestSector2Ms)}
                format={formatLapTime}
              />
              <ComparisonRow
                label={t('analytics.multi.row.bestS3')}
                values={analytics.map((a) => a.bestSector3Ms)}
                format={formatLapTime}
                last
              />
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
};

function KRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 8,
      }}
    >
      <Mono
        style={{
          fontSize: 9,
          color: colors.textMute,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Mono>
      <Mono
        style={{
          fontSize: 12,
          color: colors.text,
          fontWeight: 600,
        }}
      >
        {value}
      </Mono>
    </div>
  );
}

interface ComparisonRowProps {
  label: string;
  values: (number | null | undefined)[];
  format: (n: number | null | undefined) => string;
  lowerIsBetter?: boolean;
  last?: boolean;
}

const ComparisonRow: React.FC<ComparisonRowProps> = ({
  label,
  values,
  format,
  lowerIsBetter = true,
  last,
}) => {
  const validValues = values.filter((v): v is number => v != null);
  let bestIdx = -1;
  if (validValues.length > 0) {
    const target = lowerIsBetter
      ? Math.min(...validValues)
      : Math.max(...validValues);
    bestIdx = values.findIndex((v) => v === target);
  }
  return (
    <tr>
      <td
        style={{
          padding: '8px 12px',
          borderBottom: last ? 'none' : `1px solid ${colors.border}`,
          fontSize: 12,
          color: colors.textDim,
          fontWeight: 500,
          fontFamily: fonts.sans,
        }}
      >
        {label}
      </td>
      {values.map((v, idx) => (
        <td
          key={idx}
          style={{
            padding: '8px 12px',
            borderBottom: last ? 'none' : `1px solid ${colors.border}`,
            textAlign: 'right',
            fontFamily: fonts.mono,
            fontSize: 12,
            color: idx === bestIdx ? colors.purple : colors.text,
            fontWeight: idx === bestIdx ? 700 : 500,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {format(v)}
        </td>
      ))}
    </tr>
  );
};

export default MultiSessionComparison;
