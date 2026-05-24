import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuItem, TextField, CircularProgress } from '@mui/material';
import type { Session, SessionAnalytics } from '../../types';
import { sessionsApi, formatLapTime } from '../../api/sessions';
import { welchTTest, mannWhitneyU, cohenDLabel, pValueLabel } from '../../utils/stats';
import { colors, fonts } from '../../theme/tokens';
import { Panel, Mono, Label, MiniStat } from '../../components/apex';

interface Props {
  analytics: SessionAnalytics;
  sessions: Session[];
}

const StatisticalTestsPanel: React.FC<Props> = ({ analytics, sessions }) => {
  const { t } = useTranslation();
  const [otherId, setOtherId] = useState<number | ''>('');
  const [otherAnalytics, setOtherAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!otherId) {
      setOtherAnalytics(null);
      return;
    }
    setLoading(true);
    sessionsApi
      .analytics(otherId as number)
      .then(setOtherAnalytics)
      .catch(() => setOtherAnalytics(null))
      .finally(() => setLoading(false));
  }, [otherId]);

  const validA = useMemo(
    () =>
      analytics.perLap.filter((l) => l.valid && !l.outlier).map((l) => l.lapTimeMs),
    [analytics],
  );
  const validB = useMemo(
    () =>
      otherAnalytics?.perLap.filter((l) => l.valid && !l.outlier).map((l) => l.lapTimeMs) || [],
    [otherAnalytics],
  );

  const tTest = useMemo(
    () => (validB.length >= 2 ? welchTTest(validA, validB) : null),
    [validA, validB],
  );
  const mwU = useMemo(
    () => (validB.length >= 2 ? mannWhitneyU(validA, validB) : null),
    [validA, validB],
  );

  return (
    <Panel
      title={t('analytics.tests.title')}
      right={<Mono style={{ color: colors.textMute }}>{t('analytics.tests.subtitle')}</Mono>}
      padding={16}
    >
      <Mono
        style={{
          fontSize: 11,
          color: colors.textMute,
          letterSpacing: '0.3px',
          marginBottom: 14,
          display: 'block',
          lineHeight: 1.5,
        }}
      >
        {t('analytics.tests.helper')}
      </Mono>

      <TextField
        select
        label={t('analytics.tests.compareWith')}
        value={otherId}
        onChange={(e) => setOtherId(e.target.value === '' ? '' : Number(e.target.value))}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="">{t('analytics.tests.selectSession')}</MenuItem>
        {sessions
          .filter((s) => s.id !== analytics.sessionId)
          .map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name} · {new Date(s.sessionDate).toLocaleDateString()}
              {s.circuit ? ` · ${s.circuit}` : ''}
            </MenuItem>
          ))}
      </TextField>

      {loading && (
        <div style={{ padding: 12, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={20} />
        </div>
      )}

      {!loading && otherAnalytics && tTest && mwU && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Summary strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              border: `1px solid ${colors.border}`,
              background: colors.surface2,
            }}
          >
            <SCell label={t('analytics.tests.meanA')} value={formatLapTime(tTest.meanA)} />
            <SCell label={t('analytics.tests.meanB')} value={formatLapTime(tTest.meanB)} />
            <SCell
              label={t('analytics.tests.diff')}
              value={`${tTest.diff > 0 ? '+' : ''}${(tTest.diff / 1000).toFixed(3)}s`}
              tone={tTest.diff < 0 ? 'green' : 'red'}
            />
            <SCell
              label={t('analytics.tests.nAnB')}
              value={`${validA.length} · ${validB.length}`}
              last
            />
          </div>

          {/* Test table */}
          <div style={{ border: `1px solid ${colors.border}` }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[t('analytics.tests.col.test'), t('analytics.tests.col.statistic'), t('analytics.tests.col.pValue'), t('analytics.tests.col.interp')].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        textAlign: i === 0 || i === 3 ? 'left' : 'right',
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
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <TD>
                    <strong style={{ color: colors.text }}>{t('analytics.tests.welch')}</strong>
                    <Mono
                      style={{
                        display: 'block',
                        fontSize: 10,
                        color: colors.textMute,
                        marginTop: 2,
                      }}
                    >
                      {t('analytics.tests.welchSub')}
                    </Mono>
                  </TD>
                  <TD align="right" mono>
                    t = {tTest.t.toFixed(3)}
                    <Mono
                      style={{
                        display: 'block',
                        fontSize: 10,
                        color: colors.textMute,
                      }}
                    >
                      df ≈ {tTest.df.toFixed(1)}
                    </Mono>
                  </TD>
                  <TD align="right" mono bold>
                    {tTest.pValue.toExponential(2)}
                  </TD>
                  <TD>
                    <SigTag
                      label={pValueLabel(tTest.pValue)}
                      significant={tTest.significant05}
                    />
                  </TD>
                </tr>
                <tr>
                  <TD>
                    <strong style={{ color: colors.text }}>{t('analytics.tests.mwu')}</strong>
                    <Mono
                      style={{
                        display: 'block',
                        fontSize: 10,
                        color: colors.textMute,
                        marginTop: 2,
                      }}
                    >
                      {t('analytics.tests.mwuSub')}
                    </Mono>
                  </TD>
                  <TD align="right" mono>
                    U = {mwU.u.toFixed(0)}
                    <Mono
                      style={{
                        display: 'block',
                        fontSize: 10,
                        color: colors.textMute,
                      }}
                    >
                      z = {mwU.z.toFixed(3)}
                    </Mono>
                  </TD>
                  <TD align="right" mono bold>
                    {mwU.pValue.toExponential(2)}
                  </TD>
                  <TD>
                    <SigTag
                      label={pValueLabel(mwU.pValue)}
                      significant={mwU.significant05}
                    />
                  </TD>
                </tr>
                <tr>
                  <TD>
                    <strong style={{ color: colors.text }}>{t('analytics.tests.cohen')}</strong>
                    <Mono
                      style={{
                        display: 'block',
                        fontSize: 10,
                        color: colors.textMute,
                        marginTop: 2,
                      }}
                    >
                      {t('analytics.tests.cohenSub')}
                    </Mono>
                  </TD>
                  <TD align="right" mono>
                    d = {tTest.cohenD.toFixed(3)}
                  </TD>
                  <TD align="right" mono dim>
                    —
                  </TD>
                  <TD>
                    <EffectTag
                      label={`${cohenDLabel(tTest.cohenD)} ${t('analytics.tests.effectSuffix')}`}
                      strong={Math.abs(tTest.cohenD) >= 0.5}
                    />
                  </TD>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verdict callout */}
          <div
            style={{
              border: `1px solid ${tTest.significant05 ? colors.green : colors.border}`,
              borderLeft: `3px solid ${tTest.significant05 ? colors.green : colors.accent}`,
              background: tTest.significant05
                ? 'rgba(38, 208, 124, 0.06)'
                : 'rgba(62, 197, 209, 0.04)',
              padding: '10px 14px',
              fontSize: 12,
              color: colors.text,
              lineHeight: 1.5,
            }}
          >
            {tTest.significant05 ? (
              <>
                {t('analytics.tests.verdictSig')} <strong>{t('analytics.tests.verdictSigStrong')}</strong> {t('analytics.tests.verdictSigAt5')}{' '}
                {tTest.diff < 0 ? t('analytics.tests.faster') : t('analytics.tests.slower')} {t('analytics.tests.by')}{' '}
                <Mono style={{ color: tTest.diff < 0 ? colors.green : colors.red, fontWeight: 600 }}>
                  {(Math.abs(tTest.diff) / 1000).toFixed(3)}s
                </Mono>{' '}
                {t('analytics.tests.effectParen', { label: cohenDLabel(tTest.cohenD) })}
              </>
            ) : (
              <>
                {t('analytics.tests.verdictNotSig')} <strong>{t('analytics.tests.verdictNotSigStrong')}</strong> {t('analytics.tests.verdictNotSigDetail')}
              </>
            )}
          </div>
        </div>
      )}

      {!loading && otherId && !otherAnalytics && (
        <div
          style={{
            padding: '10px 14px',
            border: `1px solid ${colors.yellow}`,
            color: colors.yellow,
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: '0.6px',
          }}
        >
          {t('analytics.tests.loadError')}
        </div>
      )}
    </Panel>
  );
};

function SCell({
  label,
  value,
  tone = 'text',
  last,
}: {
  label: string;
  value: React.ReactNode;
  tone?: 'text' | 'green' | 'red' | 'accent';
  last?: boolean;
}) {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRight: last ? 'none' : `1px solid ${colors.border}`,
      }}
    >
      <MiniStat label={label} value={value} tone={tone} size="md" />
    </div>
  );
}

function TD({
  children,
  align = 'left',
  mono,
  bold,
  dim,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  bold?: boolean;
  dim?: boolean;
}) {
  return (
    <td
      style={{
        textAlign: align,
        padding: '10px 12px',
        borderBottom: `1px solid ${colors.border}`,
        fontFamily: mono ? fonts.mono : fonts.sans,
        fontSize: 12,
        color: dim ? colors.textMute : colors.text,
        fontWeight: bold ? 600 : 500,
        fontVariantNumeric: mono ? 'tabular-nums' : undefined,
        verticalAlign: 'top',
      }}
    >
      {children}
    </td>
  );
}

function SigTag({ label, significant }: { label: string; significant: boolean }) {
  const color = significant ? colors.green : colors.textMute;
  return (
    <Mono
      style={{
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        color,
        border: `1px solid ${significant ? color : colors.border}`,
        padding: '1px 6px',
        display: 'inline-block',
      }}
    >
      {label}
    </Mono>
  );
}

function EffectTag({ label, strong }: { label: string; strong: boolean }) {
  const color = strong ? colors.accent : colors.textMute;
  return (
    <Mono
      style={{
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        color,
        border: `1px solid ${strong ? color : colors.border}`,
        padding: '1px 6px',
        display: 'inline-block',
      }}
    >
      {label}
    </Mono>
  );
}

export default StatisticalTestsPanel;
