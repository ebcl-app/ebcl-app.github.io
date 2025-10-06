import { createTheme } from '@mui/material/styles';

// Central design system theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4A90E2' },
    secondary: { main: '#FF7A59' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        },
      },
    },
    MuiButton: {
      defaultProps: { variant: 'contained', color: 'primary' },
      styleOverrides: {
        root: { borderRadius: 999 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: { backgroundColor: '#F9FAFB' },
      },
    },
  },
});

export default theme;


