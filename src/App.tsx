import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import Dashboard from './components/Dashboard';
import ExpensesTable from './components/ExpensesTable';
import ShoppingLists from './components/ShoppingLists';
import { FilterProvider } from './contexts/FilterContext';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#216869',
    },
    secondary: {
      main: '#9cc5a1',
    },
    error: {
      main: '#ff6b6b',
    },
    text: {
      primary: '#1f2421',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FilterProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-expense" element={<ExpenseForm />} />
            <Route path="/expenses" element={<ExpensesTable />} />
            <Route path="/shopping-lists" element={<ShoppingLists />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </FilterProvider>
    </ThemeProvider>
  );
}

export default App;