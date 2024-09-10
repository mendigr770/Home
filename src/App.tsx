import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import Dashboard from './components/Dashboard';
import ExpensesTable from './components/ExpensesTable';
import ShoppingLists from './components/ShoppingLists';

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, Arial, sans-serif',
    fontWeightBold: 700,
  },
  palette: {
    primary: {
      main: '#94B49F', // פסטל ירוק
      light: '#B4CFB0',
      dark: '#789E87',
    },
    secondary: {
      main: '#FCB5AC', // פסטל ורוד-כתום
      light: '#FFC8C0',
      dark: '#E5A298',
    },
    background: {
      default: '#F5E6D3', // פסטל בז' בהיר
      paper: '#FFFFFF',
    },
    text: {
      primary: '#4A4A4A',
      secondary: '#6B6B6B',
    },
    error: {
      main: '#E57373', // פסטל אדום
    },
    warning: {
      main: '#FFD54F', // פסטל צהוב
    },
    info: {
      main: '#81D4FA', // פסטל כחול
    },
    success: {
      main: '#81C784', // פסטל ירוק בהיר
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          font-family: 'Rubik', Arial, sans-serif;
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#94B49F', // פסטל ירוק
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: '#FCB5AC', // פסטל ורוד-כתום
          '&:hover': {
            backgroundColor: '#E5A298',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Header />
        <Switch>
          <Route exact path="/" component={Dashboard} />
          <Route path="/add-expense" component={ExpenseForm} />
          <Route path="/expenses" component={ExpensesTable} />
          <Route path="/shopping-lists" component={ShoppingLists} />
          <Redirect from="*" to="/" />
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;