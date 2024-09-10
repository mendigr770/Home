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
      main: '#263238', // כחול-אפור כהה מאוד
    },
    secondary: {
      main: '#546e7a', // כחול-אפור בינוני
    },
    background: {
      default: '#eceff1', // אפור בהיר עם גוון כחלחל
      paper: '#ffffff',
    },
    text: {
      primary: '#263238',
      secondary: '#455a64',
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
          borderRadius: 0,
        },
      },
    },
    MuiPaper: {
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