import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  TextField, Select, MenuItem, FormControl, InputLabel, Fab, Tooltip
} from '@mui/material';
import { fetchAllExpenses, fetchCategories, Expense } from '../services/googleSheetsService';
import AddIcon from '@mui/icons-material/Add';
import { Link, useLocation } from 'react-router-dom';

const ExpensesTable: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const location = useLocation();

  useEffect(() => {
    fetchAllExpenses().then(setExpenses);
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    }
  }, [location]);

  useEffect(() => {
    const filtered = expenses.filter(expense => 
      (categoryFilter === '' || expense.category === categoryFilter) &&
      (searchTerm === '' || expense.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredExpenses(filtered);
  }, [expenses, categoryFilter, searchTerm]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${month}/${day}`; // שינוי הסדר כאן
  };

  return (
    <Box sx={{ 
      width: '100%', 
      padding: 3, 
      direction: 'rtl',
      position: 'relative',
      paddingBottom: '70px'
    }}>
      <Typography variant="h4" gutterBottom align="right">טבלת הוצאות</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'flex-start' }}>
        <TextField
          label="חיפוש לפי תיאור"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            style: { textAlign: 'right' }
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="category-select-label">קטגוריה</InputLabel>
          <Select
            labelId="category-select-label"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as string)}
            label="קטגוריה"
          >
            <MenuItem value="">הכל</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="right">תאריך</TableCell>
              <TableCell align="right">תיאור</TableCell>
              <TableCell align="right">סכום</TableCell>
              <TableCell align="right">קטגוריה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <Tooltip title={expense.date} arrow placement="top">
                  <TableCell align="right">{formatDate(expense.date)}</TableCell>
                </Tooltip>
                <TableCell align="right">{expense.description}</TableCell>
                <TableCell align="right">{new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(expense.amount)}</TableCell>
                <TableCell align="right">{expense.category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Tooltip title="הוסף הוצאה חדשה" arrow>
        <Fab 
          color="primary" 
          aria-label="הוסף הוצאה חדשה" 
          component={Link} 
          to="/add-expense"
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default ExpensesTable;