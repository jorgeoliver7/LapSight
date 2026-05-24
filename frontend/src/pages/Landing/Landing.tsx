import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircularProgress, Alert } from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  CloudUpload as ImportIcon,
  Map as MapIcon,
  Groups as TeamIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts } from '../../theme/tokens';
import { Mono, Label, MiniStat, Panel, StatusTag, LanguageSwitch } from '../../components/apex';

const Pillar: React.FC<{
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
}> = ({ icon, eyebrow, title, body }) => (
  <div
    style={{
      background: colors.surface,
      border: `1px solid ${colors.border}`,
      padding: '20px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      minHeight: 220,
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        background: colors.surface2,
        border: `1px solid ${colors.borderHi}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.accent,
      }}
    >
      {icon}
    </div>
    <Label tone="accent">{eyebrow}</Label>
    <div
      style={{
        fontFamily: fonts.sans,
        fontSize: 17,
        fontWeight: 600,
        color: colors.text,
        lineHeight: 1.25,
      }}
    >
      {title}
    </div>
    <Mono style={{ fontSize: 12, color: colors.textDim, lineHeight: 1.55, letterSpacing: 0.2 }}>
      {body}
    </Mono>
  </div>
);

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { demoLogin, isLoading, error } = useAuthStore();
  const [demoBusy, setDemoBusy] = useState(false);

  const launchDemo = async () => {
    setDemoBusy(true);
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch {
      setDemoBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.text,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: 0.16,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 500,
          background: `radial-gradient(circle at center, ${colors.accentDim}80 0%, transparent 70%)`,
          pointerEvents: 'none',
          filter: 'blur(60px)',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: 1180,
          margin: '0 auto',
          padding: '28px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 48,
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 32, background: colors.accent }} />
            <div>
              <div
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 3,
                  lineHeight: 1,
                }}
              >
                LAPSIGHT
              </div>
              <Mono
                style={{
                  fontSize: 9,
                  color: colors.textMute,
                  marginTop: 4,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >
                {t('landing.topbarSubtitle')}
              </Mono>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LanguageSwitch />
            <button
              onClick={() => navigate('/login')}
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: 'uppercase',
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                color: colors.textDim,
                padding: '8px 16px',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.borderHi;
                e.currentTarget.style.color = colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.color = colors.textDim;
              }}
            >
              {t('landing.topbarSignIn')}
            </button>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.85fr)',
            gap: 32,
            alignItems: 'center',
            marginTop: 16,
          }}
        >
          <div>
            <Label tone="accent" style={{ marginBottom: 14 }}>
              {t('landing.heroEyebrow')}
            </Label>
            <h1
              style={{
                fontFamily: fonts.sans,
                fontSize: 52,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.5px',
                color: colors.text,
                margin: 0,
                marginBottom: 18,
              }}
            >
              {t('landing.heroTitleLine1')}<br />
              <span style={{ color: colors.accent }}>{t('landing.heroTitleLine2')}</span>
            </h1>
            <Mono
              style={{
                fontSize: 14,
                color: colors.textDim,
                lineHeight: 1.6,
                letterSpacing: 0.2,
                maxWidth: 520,
                marginBottom: 32,
                display: 'block',
              }}
            >
              {t('landing.heroBody')}
            </Mono>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={launchDemo}
                disabled={demoBusy || isLoading}
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  background: colors.accent,
                  color: colors.bg,
                  border: `1px solid ${colors.accent}`,
                  padding: '14px 28px',
                  cursor: demoBusy ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  opacity: demoBusy ? 0.7 : 1,
                  transition: 'opacity 120ms ease',
                }}
              >
                {demoBusy ? (
                  <>
                    <CircularProgress size={14} sx={{ color: colors.bg }} />
                    {t('landing.ctaDemoLoading')}
                  </>
                ) : (
                  <>{t('landing.ctaDemo')}</>
                )}
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  background: 'transparent',
                  color: colors.textDim,
                  border: `1px solid ${colors.border}`,
                  padding: '14px 28px',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.borderHi;
                  e.currentTarget.style.color = colors.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.textDim;
                }}
              >
                {t('landing.ctaRegister')}
              </button>
            </div>

            {error && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 0, maxWidth: 520 }}>
                {error}
              </Alert>
            )}

            <Mono
              style={{
                fontSize: 10,
                color: colors.textMute,
                marginTop: 20,
                letterSpacing: 0.5,
                display: 'block',
              }}
            >
              {t('landing.demoNote')}
            </Mono>
          </div>

          <Panel title={t('landing.mockTitle')} live padding={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Label tone="dim">{t('landing.mockSessionLabel')}</Label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <MiniStat label={t('landing.mockBestLap')} value="1:42.187" tone="accent" size="lg" />
                <MiniStat label={t('landing.mockGap')} value="+0.412" tone="yellow" size="lg" />
                <MiniStat label={t('landing.mockLaps')} value={24} />
                <MiniStat label={t('landing.mockConsistency')} value="92.4%" tone="green" />
              </div>

              <div
                style={{
                  borderTop: `1px solid ${colors.border}`,
                  paddingTop: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <Label tone="dim">{t('landing.mockSectorsLabel')}</Label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                  }}
                >
                  {[
                    { s: 'S1', t: '28.412', tone: colors.purple },
                    { s: 'S2', t: '41.876', tone: colors.accent },
                    { s: 'S3', t: '31.899', tone: colors.green },
                  ].map((x) => (
                    <div
                      key={x.s}
                      style={{
                        background: colors.surface2,
                        borderLeft: `3px solid ${x.tone}`,
                        padding: '8px 10px',
                      }}
                    >
                      <Mono
                        style={{
                          fontSize: 9,
                          color: colors.textMute,
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          display: 'block',
                        }}
                      >
                        {x.s}
                      </Mono>
                      <Mono
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: x.tone,
                          display: 'block',
                          marginTop: 2,
                        }}
                      >
                        {x.t}
                      </Mono>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 4 }}>
                <StatusTag tone="green" size="sm">{t('landing.mockGpsReal')}</StatusTag>
                <StatusTag tone="accent" size="sm">{t('landing.mockDry')}</StatusTag>
                <StatusTag tone="yellow" size="sm" dot={false}>{t('landing.mockTrackTemp')}</StatusTag>
              </div>
            </div>
          </Panel>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Label tone="dim">{t('landing.pillarsOverlineLabel')}</Label>
            <h2
              style={{
                fontFamily: fonts.sans,
                fontSize: 28,
                fontWeight: 600,
                color: colors.text,
                margin: '6px 0 0',
                letterSpacing: '-0.2px',
              }}
            >
              {t('landing.pillarsTitle')}
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            <Pillar
              icon={<AnalyticsIcon fontSize="small" />}
              eyebrow={t('landing.pillar1Eyebrow')}
              title={t('landing.pillar1Title')}
              body={t('landing.pillar1Body')}
            />
            <Pillar
              icon={<ImportIcon fontSize="small" />}
              eyebrow={t('landing.pillar2Eyebrow')}
              title={t('landing.pillar2Title')}
              body={t('landing.pillar2Body')}
            />
            <Pillar
              icon={<MapIcon fontSize="small" />}
              eyebrow={t('landing.pillar3Eyebrow')}
              title={t('landing.pillar3Title')}
              body={t('landing.pillar3Body')}
            />
            <Pillar
              icon={<TeamIcon fontSize="small" />}
              eyebrow={t('landing.pillar4Eyebrow')}
              title={t('landing.pillar4Title')}
              body={t('landing.pillar4Body')}
            />
          </div>
        </section>

        <section
          style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Label tone="dim">{t('landing.stackLabel')}</Label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 20,
            }}
          >
            {[
              {
                name: t('landing.stackBackend'),
                tech: ['Spring Boot 3.2', 'Java 17', 'JPA · Flyway', 'JWT auth'],
                tone: colors.accent,
              },
              {
                name: t('landing.stackAnalytics'),
                tech: ['FastAPI', 'pandas · numpy', 'scipy · sklearn', 'Plotly'],
                tone: colors.purple,
              },
              {
                name: t('landing.stackFrontend'),
                tech: ['React 18 + TS', 'Vite + MUI', 'Zustand', 'Apex design system'],
                tone: colors.cyan,
              },
              {
                name: t('landing.stackInfra'),
                tech: ['PostgreSQL 15', 'Docker Compose', 'Nginx', 'CI with tests'],
                tone: colors.green,
              },
            ].map((bucket) => (
              <div
                key={bucket.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  borderLeft: `2px solid ${bucket.tone}`,
                  paddingLeft: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    letterSpacing: 1.4,
                    textTransform: 'uppercase',
                    color: bucket.tone,
                    fontWeight: 600,
                  }}
                >
                  {bucket.name}
                </div>
                {bucket.tech.map((tech) => (
                  <Mono key={tech} style={{ fontSize: 12, color: colors.textDim, display: 'block' }}>
                    · {tech}
                  </Mono>
                ))}
              </div>
            ))}
          </div>
        </section>

        <footer
          style={{
            borderTop: `1px solid ${colors.border}`,
            paddingTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Mono style={{ fontSize: 10, color: colors.textMute, letterSpacing: 0.5 }}>
            {t('landing.footerCopy', { year: new Date().getFullYear() })}
          </Mono>
          <Mono style={{ fontSize: 10, color: colors.textMute, letterSpacing: 0.5 }}>
            {t('landing.footerDesign')}
          </Mono>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
