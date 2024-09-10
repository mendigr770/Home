import React, { useState, useEffect } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Typography, Snackbar, Alert, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCategories, addExpense } from '../services/googleSheetsService';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ExpenseForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addExpense(parseFloat(amount), description, category);
      setSubmitStatus('success');
      setSnackbarOpen(true);
      setAmount('');
      setDescription('');
      setCategory('');
    } catch (error) {
      setSubmitStatus('error');
      setSnackbarOpen(true);
    }
    setIsSubmitting(false);
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ 
      maxWidth: 400, 
      margin: 'auto', 
      mt: 4,
      px: isMobile ? 2 : 0,
      direction: 'rtl'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom align="right">
          הוסף הוצאה חדשה
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="סכום"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              style: { textAlign: 'right' }
            }}
          />
          <TextField
            label="תיאור"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              style: { textAlign: 'right' }
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-select-label">קטגוריה</InputLabel>
            <Select
              labelId="category-select-label"
              value={category}
              onChange={(e) => setCategory(e.target.value as string)}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'מוסיף...' : 'הוסף הוצאה'}
          </Button>
        </form>
      </motion.div>
      <AnimatePresence>
        {submitStatus && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {submitStatus === 'success' ? (
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40 }} />
              ) : (
                <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={submitStatus === 'success' ? 'success' : 'error'} sx={{ width: '100%' }}>
          {submitStatus === 'success' ? 'ההוצאה נוספה בהצלחה!' : 'אירעה שגיאה בהוספת ההוצאה. נסה שוב.'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExpenseForm;