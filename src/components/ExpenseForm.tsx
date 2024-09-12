import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, Typography, Snackbar, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { addExpense, fetchCategories } from '../services/googleSheetsService';
import { useNavigate } from 'react-router-dom';

const ExpenseForm: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) {
      setError('כל השדות הם חובה');
      return;
    }
    try {
      await addExpense(parseFloat(amount), description, category);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError('אירעה שגיאה בהוספת ההוצאה');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        הוספת הוצאה חדשה
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="סכום"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="תיאור"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>קטגוריה</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value as string)}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            הוסף הוצאה
          </Button>
        </Box>
      </form>
      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <Snackbar
              open={true}
              autoHideDuration={2000}
              onClose={() => {
                setError(null);
                setSuccess(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Alert severity={error ? "error" : "success"} sx={{ width: '100%' }}>
                  {error || "ההוצאה נוספה בהצלחה!"}
                </Alert>
              </motion.div>
            </Snackbar>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ExpenseForm;