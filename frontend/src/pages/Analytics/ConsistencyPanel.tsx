import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { SessionAnalytics } from '../../types';
import { formatLapTime } from '../../api/sessions';
import { colors, fonts } from '../../theme/tokens';
import { Panel, Mono, Label, MiniStat } from '../../components/apex';

interface Props {
  analytics: SessionAnalytics;
}

interface ConsistencyMetrics {
  cv: number | null;
  iqrMs: number | null;
  p25Ms: number | null;
  p75Ms: number | null;
  consistencyScore: number | null;
  hotLapWindow: { startLap: number; avgMs: number; window: number } | null;
  paceWindow1pct: number;
  paceWindow2pct: number;
  paceWindow5pct: number;
  sectorVariance: { sector: 1 | 2 | 3; cv: number; spreadMs: number }[];
  weakestSector: 1 | 2 | 3 | null;
}

function percentile(sorted: number[], p: number): number | null {
  if (sorted.length === 0) return null;
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor(sorted.length * p)));
  return sorted[idx];
}

function computeMetrics(analytics: SessionAnalytics): ConsistencyMetrics {
  const validLaps = analytics.perLap.filter((l) => l.valid && !l.outlier);
  const times = validLaps.map((l) => l.lapTimeMs).filter((t) => t > 0);

  if (times.length < 2) {
    return {
      cv: null,
      iqrMs: null,
      p25Ms: null,
      p75Ms: null,
      consistencyScore: null,
      hotLapWindow: null,
      paceWindow1pct: 0,
      paceWindow2pct: 0,
      paceWindow5pct: 0,
      sectorVariance: [],
      weakestSector: null,
    };
  }

  const sorted = [...times].sort((a, b) => a - b);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((acc, t) => acc + (t - mean) ** 2, 0) / times.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? stdDev / mean : null;

  const p25Ms = percentile(sorted, 0.25);
  const p75Ms = percentile(sorted, 0.75);
  const iqrMs = p25Ms != null && p75Ms != null ? p75Ms - p25Ms : null;

  const bestMs = analytics.bestLapMs ?? sorted[0];

  let hotLapWindow: ConsistencyMetrics['hotLapWindow'] = null;
  const win = 3;
  if (validLaps.length >= win) {
    let bestAvg = Infinity;
    let bestStart = -1;
    for (let i = 0; i <= validLaps.length - win; i++) {
      const slice = validLaps.slice(i, i + win);
      const avg = slice.reduce((acc, l) => acc + l.lapTimeMs, 0) / win;
      if (avg < bestAvg) {
        bestAvg = avg;
        bestStart = i;
      }
    }
    if (bestStart >= 0) {
      hotLapWindow = {
        startLap: validLaps[bestStart].lapNumber,
        avgMs: bestAvg,
        window: win,
      };
    }
  }

  const paceWindow = (pct: number) =>
    (times.filter((t) => t <= bestMs * (1 + pct / 100)).length / times.length) * 100;

  let consistencyScore: number | null = null;
  if (cv != null) {
    consistencyScore = Math.max(0, Math.min(100, Math.round(100 - (cv * 100 / 3) * 100)));
  }

  const sectorVariance: ConsistencyMetrics['sectorVariance'] = [];
  for (const n of [1, 2, 3] as const) {
    const sectorTimes = validLaps
      .map((l) => (n === 1 ? l.sector1Ms : n === 2 ? l.sector2Ms : l.sector3Ms))
      .filter((t): t is number => t != null && t > 0);
    if (sectorTimes.length < 2) continue;
    const sMean = sectorTimes.reduce((a, b) => a + b, 0) / sectorTimes.length;
    const sVar = sectorTimes.reduce((acc, t) => acc + (t - sMean) ** 2, 0) / sectorTimes.length;
    const sStd = Math.sqrt(sVar);
    const sCV = sMean > 0 ? sStd / sMean : 0;
    const sortedSec = [...sectorTimes].sort((a, b) => a - b);
    const spread = sortedSec[sortedSec.length - 1] - sortedSec[0];
    sectorVariance.push({ sector: n, cv: sCV, spreadMs: spread });
  }
  const weakestSector =
    sectorVariance.length > 0
      ? sectorVariance.reduce((acc, s) => (s.cv > acc.cv ? s : acc)).sector
      : null;

  return {
    cv,
    iqrMs,
    p25Ms,
    p75Ms,
    consistencyScore,
    hotLapWindow,
    paceWindow1pct: paceWindow(1),
    paceWindow2pct: paceWindow(2),
    paceWindow5pct: paceWindow(5),
    sectorVariance,
    weakestSector,
  };
}

function scoreColor(score: number): string {
  if (score >= 80) return colors.green;
  if (score >= 60) return colors.accent;
  if (score >= 40) return colors.yellow;
  return colors.red;
}

function scoreLabel(t: (key: string) => string, score: number): string {
  if (score >= 80) return t('analytics.consistency.score.excellent');
  if (score >= 60) return t('analytics.consistency.score.good');
  if (score >= 40) return t('analytics.consistency.score.average');
  return t('analytics.consistency.score.needsWork');
}

const ConsistencyPanel: React.FC<Props> = ({ analytics }) => {
  const { t } = useTranslation();
  const m = useMemo(() => computeMetrics(analytics), [analytics]);

  if (m.cv == null || m.consistencyScore == null) {
    return (
      <Panel title={t('analytics.consistency.title')} padding={16}>
        <Mono
          style={{
            color: colors.textMute,
            fontSize: 11,
            letterSpacing: '0.4px',
          }}
        >
          {t('analytics.consistency.needMore')}
        </Mono>
      </Panel>
    );
  }

  const sc = m.consistencyScore;
  const scColor = scoreColor(sc);
  const cvPct = (m.cv * 100).toFixed(2);

  return (
    <Panel
      title={t('analytics.consistency.title')}
      right={
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <Mono
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: scColor,
              letterSpacing: '0.4px',
            }}
          >
            {sc}
          </Mono>
          <Mono style={{ color: colors.textMute }}>/ 100 · {scoreLabel(t, sc).toUpperCase()}</Mono>
        </span>
      }
      padding={0}
    >
      {/* Score bar (1px segments — no radius) */}
      <div
        style={{
          position: 'relative',
          height: 6,
          background: colors.surface3,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${sc}%`,
            background: scColor,
            transition: 'width 200ms ease',
          }}
        />
      </div>

      {/* KPI strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '14px 0',
        }}
      >
        <KCell
          label={t('analytics.consistency.cv')}
          value={`${cvPct}%`}
          sub={t('analytics.consistency.cvSub')}
        />
        <KCell
          label={t('analytics.consistency.iqr')}
          value={`±${m.iqrMs != null ? (m.iqrMs / 2 / 1000).toFixed(2) : '—'}s`}
          sub={t('analytics.consistency.iqrSub')}
        />
        <KCell
          label={t('analytics.consistency.hotLap')}
          value={
            m.hotLapWindow ? formatLapTime(m.hotLapWindow.avgMs) : '—'
          }
          sub={
            m.hotLapWindow ? t('analytics.consistency.hotLapSub', { start: m.hotLapWindow.startLap }) : t('analytics.consistency.hotLapNoData')
          }
          tone={m.hotLapWindow ? 'accent' : 'text'}
        />
        <KCell
          label={t('analytics.consistency.nearBest')}
          value={
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
              <span>{m.paceWindow1pct.toFixed(0)}%</span>
              <Mono
                style={{ fontSize: 10, color: colors.textMute, letterSpacing: '0.4px' }}
              >
                {t('analytics.consistency.atOnePct')}
              </Mono>
            </span>
          }
          sub={t('analytics.consistency.nearBestSub', { p2: m.paceWindow2pct.toFixed(0), p5: m.paceWindow5pct.toFixed(0) })}
          last
        />
      </div>

      {/* Sector variance */}
      {m.sectorVariance.length > 0 && (
        <div
          style={{
            padding: '14px 16px',
            borderTop: `1px solid ${colors.borderHi}`,
            background: colors.surface,
          }}
        >
          <Label>{t('analytics.consistency.bySector')}</Label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${m.sectorVariance.length}, 1fr)`,
              gap: 10,
              marginTop: 10,
            }}
          >
            {m.sectorVariance.map((s) => {
              const isWeakest =
                s.sector === m.weakestSector && m.sectorVariance.length > 1;
              const accent = isWeakest ? colors.red : colors.green;
              return (
                <div
                  key={s.sector}
                  style={{
                    background: colors.surface2,
                    border: `1px solid ${colors.border}`,
                    borderLeft: `2px solid ${accent}`,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Label tone="text">{t('analytics.consistency.sector', { n: s.sector })}</Label>
                    {isWeakest && (
                      <Mono
                        style={{
                          fontSize: 9,
                          color: colors.red,
                          letterSpacing: '0.8px',
                          textTransform: 'uppercase',
                          border: `1px solid ${colors.red}`,
                          padding: '0 4px',
                          fontWeight: 600,
                        }}
                      >
                        {t('analytics.consistency.leastConsistent')}
                      </Mono>
                    )}
                  </div>
                  <Mono
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: colors.text,
                      marginTop: 2,
                    }}
                  >
                    CV {(s.cv * 100).toFixed(2)}%
                  </Mono>
                  <Mono style={{ fontSize: 10, color: colors.textMute }}>
                    {t('analytics.consistency.spread', { value: (s.spreadMs / 1000).toFixed(3) })}
                  </Mono>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer note */}
      <div
        style={{
          padding: '10px 16px 14px',
          borderTop: `1px solid ${colors.border}`,
          background: colors.surface,
        }}
      >
        <Mono
          style={{
            fontSize: 10,
            color: colors.textMute,
            lineHeight: 1.5,
            letterSpacing: '0.3px',
          }}
        >
          {t('analytics.consistency.footer')}
          {m.weakestSector && m.sectorVariance.length > 1 && (
            <>
              {t('analytics.consistency.footerMostVariable')}
              <span style={{ color: colors.red, fontWeight: 600 }}>
                S{m.weakestSector}
              </span>
              {t('analytics.consistency.footerPractice')}
            </>
          )}
        </Mono>
      </div>
    </Panel>
  );
};

function KCell({
  label,
  value,
  sub,
  tone = 'text',
  last,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: 'text' | 'accent' | 'green' | 'red' | 'yellow';
  last?: boolean;
}) {
  return (
    <div
      style={{
        padding: '0 16px',
        borderRight: last ? 'none' : `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minWidth: 0,
      }}
    >
      <MiniStat label={label} value={value} tone={tone} size="md" />
      {sub && (
        <Mono
          style={{
            fontSize: 10,
            color: colors.textMute,
            letterSpacing: '0.3px',
          }}
        >
          {sub}
        </Mono>
      )}
    </div>
  );
}

export default ConsistencyPanel;
