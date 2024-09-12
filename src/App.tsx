import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Dashboard from './components/Dashboard';
import ExpensesTable from './components/ExpensesTable';
import ShoppingLists from './components/ShoppingLists';
import Header from './components/Header';
import { FilterProvider } from './contexts/FilterContext';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FilterProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<ExpensesTable />} />
            <Route path="/shopping-lists" element={<ShoppingLists />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </FilterProvider>
    </ThemeProvider>
  );
};

export default App;