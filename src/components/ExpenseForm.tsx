import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fetchCategories, Expense } from '../services/googleSheetsService';
import { format } from 'date-fns';

interface ExpenseFormProps {
  initialExpense?: Expense;
  onSave: (expense: Expense) => void;
  onCancel: () => void;
  isUpdating: boolean;
  onDelete: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialExpense, onSave, onCancel, isUpdating, onDelete }) => {
  const [date, setDate] = useState<Date | null>(initialExpense ? new Date(initialExpense.date) : new Date());
  const [amount, setAmount] = useState(initialExpense?.amount.toString() || '');
  const [description, setDescription] = useState(initialExpense?.description || '');
  const [category, setCategory] = useState(initialExpense?.category || '');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && amount && description && category) {
      const expense: Expense = {
        id: initialExpense?.id || '',
        date: initialExpense ? initialExpense.date : format(date, 'dd.MM.yyyy, HH:mm:ss'),
        amount: parseFloat(amount),
        description,
        category,
      };
      onSave(expense);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!initialExpense && (
            <DatePicker
              label="תאריך"
              value={date}
              onChange={(newValue) => setDate(newValue)}
            />
          )}
          <TextField
            label="סכום"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <TextField
            label="תיאור"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <FormControl fullWidth>
            <InputLabel>קטגוריה</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              onClick={onCancel} 
              variant="outlined" 
              disabled={isUpdating}
            >
              ביטול
            </Button>
            {initialExpense && (
              <Button 
                onClick={onDelete} 
                variant="outlined" 
                color="error" 
                disabled={isUpdating}
              >
                מחק
              </Button>
            )}
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isUpdating}
            >
              {isUpdating ? <CircularProgress size={24} /> : initialExpense ? 'עדכן' : 'הוסף'}
            </Button>
          </Box>
        </Box>
      </form>
    </LocalizationProvider>
  );
};

export default ExpenseForm;