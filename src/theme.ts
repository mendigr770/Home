import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#49a078',
      light: '#9cc5a1',
      dark: '#216869',
    },
    secondary: {
      main: '#dce1de',
      light: '#ffffff',
      dark: '#aab0ad',
    },
    background: {
      default: '#dce1de',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2421',
      secondary: '#216869',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ffa000',
    },
    info: {
      main: '#1976d2',
    },
    success: {
      main: '#388e3c',
    },
  },
  typography: {
    fontFamily: [
      'Rubik',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          background-color: #dce1de;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#49a078',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;