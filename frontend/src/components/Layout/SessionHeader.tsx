import { useState, useRef, useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { colors, fonts, space } from '../../theme/tokens';
import { Label } from '../apex/Label';
import { Mono } from '../apex/Mono';
import { LanguageSwitch } from '../apex/LanguageSwitch';
import { useAuthStore } from '../../store/authStore';

export interface SessionMeta {
  event?: string;
  round?: string;
  circuit?: string;
  circuitKm?: number;
  session?: string;
  duration?: string;
  conditions?: {
    air?: number;
    track?: number;
    humidity?: number;
    wind?: string;
    wx?: string;
  };
  live?: boolean;
}

interface NavTabSpec {
  labelKey: string;
  path: string;
  roles?: string[];
}

interface SecondaryItem {
  labelKey: string;
  path: string;
  roles?: string[];
}

const PRIMARY_TABS: NavTabSpec[] = [
  { labelKey: 'nav.dashboard', path: '/dashboard' },
  { labelKey: 'nav.sessions', path: '/analytics' },
  { labelKey: 'nav.circuits', path: '/circuits' },
];

const SECONDARY: SecondaryItem[] = [
  { labelKey: 'nav.pilots', path: '/users', roles: ['MANAGER'] },
  { labelKey: 'nav.vehicles', path: '/vehicles' },
  { labelKey: 'nav.events', path: '/events' },
  { labelKey: 'nav.calendar', path: '/calendar' },
  { labelKey: 'nav.teams', path: '/teams', roles: ['MANAGER', 'FINANCE'] },
];

interface SessionHeaderProps {
  meta?: SessionMeta;
}

export function SessionHeader({ meta }: SessionHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const tabs = PRIMARY_TABS.filter((t) => {
    if (!t.roles) return true;
    return user?.role && t.roles.includes(user.role);
  });
  const secondary = SECONDARY.filter((t) => {
    if (!t.roles) return true;
    return user?.role && t.roles.includes(user.role);
  });

  const initials =
    `${user?.firstName?.charAt(0) ?? ''}${user?.lastName?.charAt(0) ?? ''}`.toUpperCase() ||
    'U';

  return (
    <div
      style={{
        height: space.headerH,
        flexShrink: 0,
        borderBottom: `1px solid ${colors.border}`,
        display: 'grid',
        gridTemplateColumns: meta ? '220px 1fr auto' : '220px 1fr auto',
        alignItems: 'center',
        background: colors.surface,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate('/dashboard')}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          height: '100%',
          borderRight: `1px solid ${colors.border}`,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 8,
            height: 24,
            background: colors.accent,
            marginRight: 10,
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              lineHeight: 1,
              color: colors.text,
            }}
          >
            LAPSIGHT
          </div>
          <Mono
            style={{
              fontSize: 9,
              color: colors.textMute,
              marginTop: 3,
              letterSpacing: '0.6px',
            }}
          >
            v1.0 · {t('nav.telemetry')}
          </Mono>
        </div>
      </div>

      {/* Session metadata strip (optional) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          padding: '0 22px',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {meta ? (
          <SessionMetaStrip meta={meta} />
        ) : (
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.textMute,
              letterSpacing: '0.6px',
            }}
          >
            {t('nav.noActiveSession')}
          </div>
        )}
      </div>

      {/* Nav tabs + user */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
        }}
      >
        {tabs.map((tab) => {
          const active =
            location.pathname === tab.path ||
            (tab.path !== '/' && location.pathname.startsWith(tab.path));
          return (
            <NavTab
              key={tab.path}
              active={active}
              onClick={() => navigate(tab.path)}
            >
              {t(tab.labelKey)}
            </NavTab>
          );
        })}
        <div
          style={{
            width: 1,
            height: 28,
            background: colors.border,
            margin: '0 12px',
          }}
        />
        <LanguageSwitch />
        <div
          style={{
            width: 1,
            height: 28,
            background: colors.border,
            margin: '0 12px',
          }}
        />

        {/* Avatar / menu */}
        <div ref={menuRef} style={{ position: 'relative', paddingRight: 14 }}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              color: colors.text,
            }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: colors.surface3,
                border: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: fonts.mono,
                letterSpacing: '0.4px',
                color: colors.text,
              }}
            >
              {initials}
            </div>
          </button>

          {menuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                right: 8,
                top: '100%',
                marginTop: 4,
                minWidth: 220,
                background: colors.surface2,
                border: `1px solid ${colors.borderHi}`,
                zIndex: 20,
              }}
            >
              <div
                style={{
                  padding: '10px 14px',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colors.text,
                  }}
                >
                  {user?.firstName} {user?.lastName}
                </div>
                <Mono
                  style={{
                    fontSize: 10,
                    color: colors.textMute,
                    marginTop: 2,
                    letterSpacing: '0.6px',
                  }}
                >
                  {user?.email}
                </Mono>
              </div>

              {secondary.length > 0 && (
                <>
                  <div style={{ padding: '8px 14px 4px' }}>
                    <Label size="micro">{t('nav.adminData')}</Label>
                  </div>
                  {secondary.map((s) => (
                    <MenuRow
                      key={s.path}
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(s.path);
                      }}
                    >
                      {t(s.labelKey)}
                    </MenuRow>
                  ))}
                </>
              )}

              <div
                style={{
                  borderTop: `1px solid ${colors.border}`,
                  marginTop: 4,
                }}
              />
              <MenuRow
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                tone="red"
              >
                {t('nav.logOut')}
              </MenuRow>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavTab({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '1.4px',
        textTransform: 'uppercase',
        cursor: 'pointer',
        color: active ? colors.text : colors.textDim,
        background: 'transparent',
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: active
          ? `2px solid ${colors.accent}`
          : '2px solid transparent',
        borderLeft: `1px solid ${colors.border}`,
        fontFamily: fonts.mono,
        transition: 'color 100ms ease',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.color = colors.text;
      }}
      onMouseLeave={(e) => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.color = colors.textDim;
      }}
    >
      {children}
    </button>
  );
}

function MenuRow({
  children,
  onClick,
  tone = 'text',
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: 'text' | 'red';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '8px 14px',
        background: 'transparent',
        border: 'none',
        color: tone === 'red' ? colors.red : colors.text,
        fontFamily: fonts.sans,
        fontSize: 13,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = colors.surface3;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

function SessionMetaStrip({ meta }: { meta: SessionMeta }) {
  return (
    <>
      {meta.event && (
        <Slot label="EVENT">
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {meta.event}
            {meta.round && (
              <span style={{ color: colors.textDim, fontWeight: 400 }}>
                {' '}
                · {meta.round}
              </span>
            )}
          </span>
        </Slot>
      )}
      {meta.circuit && (
        <>
          <Sep />
          <Slot label="CIRCUIT">
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {meta.circuit}
              {meta.circuitKm && (
                <Mono
                  style={{
                    color: colors.textDim,
                    fontWeight: 400,
                    marginLeft: 6,
                  }}
                >
                  · {meta.circuitKm.toFixed(3)} km
                </Mono>
              )}
            </span>
          </Slot>
        </>
      )}
      {meta.session && (
        <>
          <Sep />
          <Slot label="SESSION">
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: meta.live ? colors.accent : colors.text,
              }}
            >
              {meta.session}
              {meta.duration && (
                <Mono
                  style={{
                    color: colors.textDim,
                    fontWeight: 400,
                    marginLeft: 6,
                  }}
                >
                  · {meta.duration}
                </Mono>
              )}
            </span>
          </Slot>
        </>
      )}
      {meta.conditions && (
        <>
          <Sep />
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {meta.conditions.air !== undefined && (
              <CondItem label="AIR" value={`${meta.conditions.air}°`} />
            )}
            {meta.conditions.track !== undefined && (
              <CondItem label="TRK" value={`${meta.conditions.track}°`} />
            )}
            {meta.conditions.humidity !== undefined && (
              <CondItem label="HUM" value={`${meta.conditions.humidity}%`} />
            )}
            {meta.conditions.wind && (
              <CondItem label="WIND" value={meta.conditions.wind} />
            )}
            {meta.conditions.wx && (
              <Mono
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  border: `1px solid ${colors.green}`,
                  color: colors.green,
                  letterSpacing: '1px',
                }}
              >
                {meta.conditions.wx}
              </Mono>
            )}
          </div>
        </>
      )}
    </>
  );
}

function Slot({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ minWidth: 0 }}>
      <Label>{label}</Label>
      <div style={{ marginTop: 2, color: colors.text }}>{children}</div>
    </div>
  );
}

function CondItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 38 }}>
      <Label size="micro">{label}</Label>
      <Mono style={{ fontSize: 12, marginTop: 2, color: colors.text }}>
        {value}
      </Mono>
    </div>
  );
}

function Sep() {
  return (
    <div style={{ width: 1, height: 28, background: colors.border, flexShrink: 0 }} />
  );
}
