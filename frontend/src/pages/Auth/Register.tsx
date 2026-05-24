import React, { useState } from 'react';
import {
  TextField,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../../theme/tokens';
import { Label, Mono, LanguageSwitch } from '../../components/apex';

type Category = 'CAR' | 'MOTORCYCLE';

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamCategory, setTeamCategory] = useState<Category>('CAR');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName) errs.firstName = t('common.required');
    if (!lastName) errs.lastName = t('common.required');
    if (!email) errs.email = t('common.required');
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = t('common.invalidEmail');
    if (!password) errs.password = t('common.required');
    else if (password.length < 6) errs.password = t('common.minChars', { n: 6 });
    if (!teamName) errs.teamName = t('common.required');
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await register({
        firstName,
        lastName,
        email,
        password,
        teamName,
        teamCategory,
      });
      navigate('/dashboard');
    } catch {
      /* handled in store */
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${colors.border} 1px, transparent 1px), linear-gradient(90deg, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 520,
          height: 320,
          background: `radial-gradient(circle at center, ${colors.accentDim}55 0%, transparent 70%)`,
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            padding: '24px 28px 18px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div style={{ width: 10, height: 40, background: colors.accent }} />
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: 3,
                lineHeight: 1,
                color: colors.text,
              }}
            >
              LAPSIGHT
            </div>
            <Mono
              style={{
                fontSize: 10,
                color: colors.textMute,
                marginTop: 6,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
              }}
            >
              {t('auth.register.subtitle')}
            </Mono>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <LanguageSwitch />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '22px 28px 26px' }}>
          <Label>{t('auth.register.eyebrow')}</Label>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: colors.text,
              marginTop: 6,
              marginBottom: 18,
            }}
          >
            {t('auth.register.title')}
          </div>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
              {error}
            </Alert>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>{t('auth.register.firstName')}</Label>
              <TextField
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                size="small"
                sx={{ mt: 0.5 }}
                autoComplete="given-name"
              />
            </div>
            <div>
              <Label>{t('auth.register.lastName')}</Label>
              <TextField
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                size="small"
                sx={{ mt: 0.5 }}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <Label>{t('auth.register.email')}</Label>
            <TextField
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              size="small"
              sx={{ mt: 0.5 }}
              autoComplete="email"
              placeholder={t('auth.register.emailPlaceholder')}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <Label>{t('auth.register.password')}</Label>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password || t('auth.register.passwordHelp')}
              size="small"
              sx={{ mt: 0.5 }}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 14,
              borderTop: `1px solid ${colors.border}`,
            }}
          >
            <Label tone="accent">{t('auth.register.yourTeam')}</Label>
            <Mono
              style={{
                fontSize: 10,
                color: colors.textMute,
                marginTop: 4,
                marginBottom: 10,
                display: 'block',
              }}
            >
              {t('auth.register.teamNote')}
            </Mono>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div>
                <Label>{t('auth.register.teamName')}</Label>
                <TextField
                  fullWidth
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  error={!!formErrors.teamName}
                  helperText={formErrors.teamName}
                  size="small"
                  sx={{ mt: 0.5 }}
                  placeholder={t('auth.register.teamNamePlaceholder')}
                />
              </div>
              <div>
                <Label>{t('auth.register.category')}</Label>
                <TextField
                  fullWidth
                  select
                  value={teamCategory}
                  onChange={(e) => setTeamCategory(e.target.value as Category)}
                  size="small"
                  sx={{ mt: 0.5 }}
                >
                  <MenuItem value="CAR">{t('auth.register.categoryCar')}</MenuItem>
                  <MenuItem value="MOTORCYCLE">{t('auth.register.categoryBike')}</MenuItem>
                </TextField>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              marginTop: 22,
              background: isLoading ? colors.surface3 : colors.accent,
              color: isLoading ? colors.textMute : colors.bg,
              border: `1px solid ${colors.accent}`,
              borderRadius: 0,
              fontFamily: fonts.mono,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 100ms ease',
            }}
          >
            {isLoading ? (
              <CircularProgress size={16} sx={{ color: colors.textMute }} />
            ) : (
              <>{t('auth.register.submit')}</>
            )}
          </button>

          <Mono
            style={{
              display: 'block',
              fontSize: 11,
              color: colors.textDim,
              textAlign: 'center',
              marginTop: 16,
              letterSpacing: '0.4px',
            }}
          >
            {t('auth.register.haveAccount')}{' '}
            <Link
              to="/login"
              style={{
                color: colors.accent,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              {t('auth.register.signIn')}
            </Link>
          </Mono>
        </form>
      </div>
    </div>
  );
};

export default Register;
