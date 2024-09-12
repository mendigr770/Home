import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Dashboard from './components/Dashboard';
import ExpensesTable from './components/ExpensesTable';
import ShoppingLists from './components/ShoppingLists';
import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import { FilterProvider } from './contexts/FilterContext';
import { addExpense, Expense } from './services/googleSheetsService'; // הוספנו ייבוא של Expense
import { useNavigate } from 'react-router-dom';

const AddExpenseWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async (expense: Omit<Expense, 'id'>) => {
    setIsUpdating(true);
    try {
      const newId = await addExpense(expense.amount, expense.description, expense.category);
      navigate('/expenses');
    } catch (error) {
      console.error('Error adding expense:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate('/expenses');
  };

  const handleDelete = () => {
    // This function is not needed for adding a new expense, but we need to provide it
    console.log('Delete function called in add expense context');
  };

  return (
    <ExpenseForm 
      onSave={handleSave} 
      onCancel={handleCancel} 
      isUpdating={isUpdating}
      onDelete={handleDelete}
    />
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FilterProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-expense" element={<AddExpenseWrapper />} />
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