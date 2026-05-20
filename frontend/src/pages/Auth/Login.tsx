import React, { useState } from 'react';
import {
  TextField,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { colors, fonts } from '../../theme/tokens';
import { Label, Mono } from '../../components/apex';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'El email no es válido';
    }
    if (!password) {
      errors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validateForm()) return;
    try {
      await login(email, password);
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
      {/* Decorative grid background */}
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
          width: 480,
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
          maxWidth: 440,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Brand header */}
        <div
          style={{
            padding: '28px 28px 22px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 10,
              height: 40,
              background: colors.accent,
            }}
          />
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
                marginTop: 8,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
              }}
            >
              v1.0 · See every lap
            </Mono>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px' }}>
          <Label>Acceso · pit wall</Label>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: colors.text,
              marginTop: 6,
              marginBottom: 22,
            }}
          >
            Iniciar sesión
          </div>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
              {error}
            </Alert>
          )}

          <div style={{ marginBottom: 14 }}>
            <Label>Email</Label>
            <TextField
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              size="small"
              sx={{ mt: 0.5 }}
              placeholder="ingeniero@equipo.com"
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <Label>Contraseña</Label>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
              size="small"
              sx={{ mt: 0.5 }}
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

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
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
              <>→ Entrar</>
            )}
          </button>

          <Mono
            style={{
              display: 'block',
              fontSize: 10,
              color: colors.textMute,
              textAlign: 'center',
              marginTop: 18,
              letterSpacing: '0.6px',
            }}
          >
            ¿Problemas para acceder? Contacta al administrador.
          </Mono>
        </form>
      </div>
    </div>
  );
};

export default Login;
