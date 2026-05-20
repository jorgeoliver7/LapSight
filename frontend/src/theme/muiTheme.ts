import { createTheme, type Shadows } from '@mui/material/styles';
import { colors, fonts } from './tokens';

const noShadows = Array(25).fill('none') as unknown as Shadows;

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.accent,
      light: colors.accent,
      dark: colors.accentDim,
      contrastText: colors.bg,
    },
    secondary: {
      main: colors.textDim,
      light: colors.text,
      dark: colors.textMute,
      contrastText: colors.bg,
    },
    background: {
      default: colors.bg,
      paper: colors.surface,
    },
    text: {
      primary: colors.text,
      secondary: colors.textDim,
      disabled: colors.textMute,
    },
    divider: colors.border,
    success: { main: colors.green, contrastText: colors.bg },
    warning: { main: colors.yellow, contrastText: colors.bg },
    error: { main: colors.red, contrastText: colors.bg },
    info: { main: colors.accent, contrastText: colors.bg },
  },
  typography: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: { fontWeight: 300, fontSize: '44px', letterSpacing: 0 },
    h2: { fontWeight: 600, fontSize: '36px', letterSpacing: 0 },
    h3: { fontWeight: 600, fontSize: '28px', letterSpacing: 0 },
    h4: { fontWeight: 500, fontSize: '22px', letterSpacing: 0 },
    h5: { fontWeight: 500, fontSize: '18px', letterSpacing: 0 },
    h6: { fontWeight: 500, fontSize: '14px', letterSpacing: 0 },
    body1: { fontSize: '14px', fontWeight: 500 },
    body2: { fontSize: '13px', fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    overline: {
      fontFamily: fonts.mono,
      fontSize: '10px',
      fontWeight: 500,
      letterSpacing: '1.4px',
      textTransform: 'uppercase',
      lineHeight: 1.2,
    },
    caption: {
      fontFamily: fonts.mono,
      fontSize: '11px',
      fontWeight: 500,
      letterSpacing: '0.4px',
    },
  },
  shape: {
    borderRadius: 0,
  },
  shadows: noShadows,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.bg,
          color: colors.text,
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0, square: true },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 0,
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0, square: true },
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 0,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          backgroundImage: 'none',
          borderBottom: `1px solid ${colors.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surface,
          borderRight: `1px solid ${colors.border}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: false },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 0,
          boxShadow: 'none',
          letterSpacing: 0,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        outlined: {
          borderColor: colors.border,
          '&:hover': { borderColor: colors.borderHi, backgroundColor: colors.surface2 },
        },
        text: {
          '&:hover': { backgroundColor: colors.surface2 },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          color: colors.textDim,
          '&:hover': { backgroundColor: colors.surface2, color: colors.text },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: colors.surface2,
          border: `1px solid ${colors.border}`,
          color: colors.text,
          fontFamily: fonts.mono,
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          height: 22,
        },
        outlined: {
          borderColor: colors.border,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: colors.surface2,
          '& fieldset': { borderColor: colors.border },
          '&:hover fieldset': { borderColor: colors.borderHi },
          '&.Mui-focused fieldset': { borderColor: colors.accent, borderWidth: 1 },
        },
        input: {
          fontFamily: fonts.sans,
          fontSize: 14,
          color: colors.text,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: fonts.mono,
          fontSize: 11,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          color: colors.textMute,
          '&.Mui-focused': { color: colors.accent },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { borderRadius: 0 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surface2,
          border: `1px solid ${colors.border}`,
          borderRadius: 0,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: fonts.sans,
          fontSize: 13,
          borderRadius: 0,
          '&:hover': { backgroundColor: colors.surface3 },
          '&.Mui-selected': {
            backgroundColor: colors.surface3,
            '&:hover': { backgroundColor: colors.surface3 },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.surface3,
          border: `1px solid ${colors.borderHi}`,
          borderRadius: 0,
          color: colors.text,
          fontFamily: fonts.mono,
          fontSize: 11,
          letterSpacing: '0.4px',
          padding: '6px 8px',
        },
        arrow: { color: colors.surface3 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 0,
          backgroundImage: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: colors.border },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: colors.border,
          fontFamily: fonts.sans,
          fontSize: 12,
          color: colors.text,
        },
        head: {
          fontFamily: fonts.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          color: colors.textMute,
          backgroundColor: colors.surface2,
          borderBottom: `1px solid ${colors.borderHi}`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: colors.accent,
          height: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: fonts.mono,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '1.4px',
          textTransform: 'uppercase',
          color: colors.textDim,
          minHeight: 44,
          padding: '0 16px',
          '&.Mui-selected': { color: colors.text },
          '&:hover': { color: colors.text, backgroundColor: colors.surface2 },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-track': { borderRadius: 0, backgroundColor: colors.surface3 },
          '& .MuiSwitch-thumb': { borderRadius: 0 },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.textMute,
          '&.Mui-checked': { color: colors.accent },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: colors.textMute,
          '&.Mui-checked': { color: colors.accent },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 0, height: 4, backgroundColor: colors.surface2 },
        bar: { backgroundColor: colors.accent },
      },
    },
  },
});
