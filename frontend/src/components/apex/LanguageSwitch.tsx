import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../../theme/tokens';

export function LanguageSwitch() {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.startsWith('es') ? 'es' : 'en';
  const next = current === 'en' ? 'es' : 'en';

  const change = () => {
    i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={change}
      title={t('language.switchTo')}
      aria-label={t('language.switchTo')}
      style={{
        fontFamily: fonts.mono,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        background: 'transparent',
        color: colors.textDim,
        border: `1px solid ${colors.border}`,
        padding: '4px 8px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        transition: 'all 120ms ease',
        height: 24,
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
      <span style={{ color: current === 'en' ? colors.accent : colors.textMute }}>EN</span>
      <span style={{ opacity: 0.5 }}>/</span>
      <span style={{ color: current === 'es' ? colors.accent : colors.textMute }}>ES</span>
    </button>
  );
}
