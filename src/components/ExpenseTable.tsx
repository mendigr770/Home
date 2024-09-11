import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Skeleton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { fetchAllExpenses } from '../services/googleSheetsService';

interface Expense {
  date: string;
  category: string;
  description: string;
  amount: number;
}

interface ExpenseTableProps {
  onEditExpense: (expense: Expense) => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({ onEditExpense }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const fetchedExpenses = await fetchAllExpenses();
      setExpenses(fetchedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (date: string, description: string) => {
    // Implement delete functionality here
    console.log('Delete expense:', date, description);
    // You might want to call an API to delete the expense from the server
    // Then update the local state:
    setExpenses(expenses.filter(expense => !(expense.date === date && expense.description === description)));
  };

  const renderSkeletonLoader = () => (
    <TableBody>
      {[1, 2, 3, 4, 5].map((item) => (
        <TableRow key={item}>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>תאריך</TableCell>
            <TableCell>קטגוריה</TableCell>
            <TableCell>תיאור</TableCell>
            <TableCell>סכום</TableCell>
            <TableCell>פעולות</TableCell>
          </TableRow>
        </TableHead>
        {loading ? (
          renderSkeletonLoader()
        ) : (
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={`${expense.date}-${expense.description}`}>
                <TableCell>{expense.date}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.amount}</TableCell>
                <TableCell>
                  <IconButton onClick={() => onEditExpense(expense)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(expense.date, expense.description)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </TableContainer>
  );
};

export default ExpenseTable;