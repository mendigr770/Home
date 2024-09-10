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
          backgroundColor: '#49a078',
          borderRadius: 0,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: '#9cc5a1',
          color: '#1f2421',
          '&:hover': {
            backgroundColor: '#49a078',
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
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