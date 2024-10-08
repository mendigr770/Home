import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  TextField, Select, MenuItem, FormControl, InputLabel, Fab, Tooltip, IconButton, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  useMediaQuery, useTheme, CircularProgress, List, ListItem, ListItemText, Popover
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fetchAllExpenses, fetchCategories, Expense, deleteExpense, updateExpense, addExpense } from '../services/googleSheetsService';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFilter, DateRange } from '../contexts/FilterContext';
import { startOfMonth, endOfMonth, subMonths, parseISO, format, isValid, parse } from 'date-fns';
import ExpenseForm from './ExpenseForm';

const ExpensesTable: React.FC = () => {
  const { dateRange, setDateRange, startDate, endDate, categoryFilter, setCategoryFilter } = useFilter();
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditExpense, setCurrentEditExpense] = useState<Expense | null>(null);
  const [addExpenseAnchorEl, setAddExpenseAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setCategoryFilter(categoryFromUrl);
    }
  }, [location, setCategoryFilter]);

  const fetchData = async () => {
    console.log('ExpensesTable: Fetching data...');
    setLoading(true);
    try {
      const [fetchedExpenses, fetchedCategories] = await Promise.all([
        fetchAllExpenses(),
        fetchCategories()
      ]);
      console.log('ExpensesTable: Fetched expenses:', fetchedExpenses);
      console.log('ExpensesTable: Fetched categories:', fetchedCategories);
      setAllExpenses(fetchedExpenses);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('ExpensesTable: Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('ExpensesTable: Filtering expenses...');
    console.log('ExpensesTable: Current filters:', { categoryFilter, searchTerm, startDate, endDate });
    console.log('ExpensesTable: All expenses:', allExpenses);
    const filtered = allExpenses.filter(expense => {
      const expenseDate = parseDate(expense.date);
      console.log('ExpensesTable: Checking expense:', expense);
      console.log('ExpensesTable: Expense date:', expenseDate);
      const categoryMatch = !categoryFilter || expense.category === categoryFilter;
      const searchMatch = !searchTerm || expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const dateMatch = (!startDate || expenseDate >= startDate) && (!endDate || expenseDate <= endDate);
      console.log('ExpensesTable: Matches:', { categoryMatch, searchMatch, dateMatch });
      return categoryMatch && searchMatch && dateMatch;
    });
    console.log('ExpensesTable: Filtered expenses:', filtered);
    setFilteredExpenses(filtered);
  }, [allExpenses, categoryFilter, searchTerm, startDate, endDate]);

  const handleDateRangeChange = (newRange: DateRange) => {
    console.log('ExpensesTable: Date range changed to:', newRange);
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (newRange) {
      case 'currentMonth':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case 'lastThreeMonths':
        start = startOfMonth(subMonths(now, 2));
        end = endOfMonth(now);
        break;
      case 'lastSixMonths':
        start = startOfMonth(subMonths(now, 5));
        end = endOfMonth(now);
        break;
      case 'custom':
        setCustomStartDate(startDate);
        setCustomEndDate(endDate);
        setOpenDatePicker(true);
        return; // Don't set the date range yet
    }

    if (start && end) {
      setDateRange(newRange, format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
    }
  };

  const handleCustomDateConfirm = () => {
    if (customStartDate && customEndDate) {
      setDateRange('custom', format(customStartDate, 'yyyy-MM-dd'), format(customEndDate, 'yyyy-MM-dd'));
    }
    setOpenDatePicker(false);
    if (isMobile) {
      setDateRangeDialogOpen(false); // סגירת הדיאלוג הראשי של בחירת טווח במובייל
    }
  };

  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return '';
    return `${format(start, 'dd/MM/yy')} - ${format(end, 'dd/MM/yy')}`;
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const parseDate = (dateString: string) => {
    console.log('ExpensesTable: Parsing date:', dateString);
    const [day, month, year] = dateString.split('.');
    const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    console.log('ExpensesTable: Parsed date:', parsedDate);
    return parsedDate;
  };

  const formatDate = (dateString: string) => {
    const date = parseDate(dateString);
    return format(date, 'dd/MM'); // Changed to day/month format
  };

  const renderSkeletonRow = (key: number) => (
    <TableRow key={key}>
      <TableCell><Skeleton variant="text" /></TableCell>
      <TableCell><Skeleton variant="text" /></TableCell>
      <TableCell><Skeleton variant="text" /></TableCell>
      <TableCell><Skeleton variant="text" /></TableCell>
    </TableRow>
  );

  const setStartDate = (date: Date | null) => {
    setDateRange(dateRange, date ? format(date, 'yyyy-MM-dd') : null, endDate ? format(endDate, 'yyyy-MM-dd') : null);
  };

  const setEndDate = (date: Date | null) => {
    setDateRange(dateRange, startDate ? format(startDate, 'yyyy-MM-dd') : null, date ? format(date, 'yyyy-MM-dd') : null);
  };

  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  const handleRowClick = (expense: Expense) => {
    setCurrentEditExpense(expense);
    setEditDialogOpen(true);
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveEdit = async (editedExpense: Expense) => {
    setIsUpdating(true);
    try {
      // עדכון מקומי
      const updatedExpenses = allExpenses.map(exp => 
        exp.id === editedExpense.id ? editedExpense : exp
      );
      setAllExpenses(updatedExpenses);
      setEditDialogOpen(false);

      // סנכרון עם הגיליון
      await updateExpense(editedExpense);
    } catch (error) {
      console.error('Error updating expense:', error);
      // במקרה של שגיאה, נחזיר את המצב הקודם
      await fetchData();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (currentEditExpense && window.confirm('האם אתה בטוח שברצונך למחוק הוצאה זו?')) {
      try {
        // מחיקה מקומית
        const updatedExpenses = allExpenses.filter(exp => exp.id !== currentEditExpense.id);
        setAllExpenses(updatedExpenses);
        setEditDialogOpen(false);

        // סנכרון עם הגיליון
        await deleteExpense(currentEditExpense.id);
      } catch (error) {
        console.error('Error deleting expense:', error);
        // במקרה של שגיאה, נחזיר את המצב הקודם
        await fetchData();
      }
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [dateRangeDialogOpen, setDateRangeDialogOpen] = useState(false);

  const renderMobileFilters = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <IconButton onClick={() => setSearchDialogOpen(true)}>
        <SearchIcon />
      </IconButton>
      <IconButton onClick={() => setDateRangeDialogOpen(true)}>
        <CalendarTodayIcon />
      </IconButton>
      <IconButton onClick={fetchData} disabled={loading}>
        <RefreshIcon />
      </IconButton>
    </Box>
  );

  const renderDesktopFilters = () => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 2, 
      flexWrap: 'wrap',
      gap: 2
    }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="date-range-label">מציג נתונים של</InputLabel>
          <Select
            labelId="date-range-label"
            value={dateRange}
            onChange={(e) => handleDateRangeChange(e.target.value as DateRange)}
            label="מציג נתונים של"
          >
            <MenuItem value="currentMonth">חודש נוכחי</MenuItem>
            <MenuItem value="lastMonth">חודש קודם</MenuItem>
            <MenuItem value="lastThreeMonths">שלושה חודשים</MenuItem>
            <MenuItem value="lastSixMonths">חצי שנה</MenuItem>
            <MenuItem value="custom">טווח מותאם</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={fetchData} disabled={loading}>
          <RefreshIcon />
        </IconButton>
        <Tooltip title="הורד כקובץ CSV">
          <IconButton onClick={handleDownloadCSV} disabled={loading || filteredExpenses.length === 0}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  const handleSearchConfirm = () => {
    setSearchDialogOpen(false);
  };

  const handleSearchCancel = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSearchDialogOpen(false);
  };

  const handleDateRangeConfirm = () => {
    setDateRangeDialogOpen(false);
    if (isMobile) {
      setOpenDatePicker(false); // סגירת הדיאלוג של בחירת טווח התאריכים במובייל
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['תאריך', 'תיאור', 'סכום', 'קטגוריה'];
    const bom = '\uFEFF'; // הוספת BOM לתמיכה בתווים בעברית
    const csvContent = bom + [
      headers.join(','),
      ...filteredExpenses.map(expense => 
        [
          formatDate(expense.date), // שימוש בפונקציית formatDate
          `"${expense.description.replace(/"/g, '""')}"`, // מטפל במקרה של פסיקים בתיאור
          expense.amount,
          expense.category
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAddExpenseClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAddExpenseAnchorEl(event.currentTarget);
  };

  const handleAddExpenseClose = () => {
    setAddExpenseAnchorEl(null);
  };

  const handleAddExpenseSave = async (expense: Omit<Expense, 'id'>) => {
    setIsAddingExpense(true);
    try {
      // יצירת מזהה זמני
      const tempId = `temp_${Date.now()}`;
      const newExpense = { ...expense, id: tempId };

      // הוספה מקומית
      setAllExpenses(prev => [...prev, newExpense]);
      handleAddExpenseClose();

      // סנכרון עם הגיליון
      const newId = await addExpense(expense.amount, expense.description, expense.category);
      
      // עדכון המזהה הקבוע
      setAllExpenses(prev => prev.map(exp => 
        exp.id === tempId ? { ...exp, id: newId } : exp
      ));
    } catch (error) {
      console.error('Error adding expense:', error);
      // במקרה של שגיאה, נחזיר את המצב הקודם
      await fetchData();
    } finally {
      setIsAddingExpense(false);
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      padding: isMobile ? '8px' : 3,
      direction: 'rtl',
      position: 'relative',
      paddingBottom: '70px'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: isMobile ? 2 : 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"}>טבלת הוצאות</Typography>
      </Box>
      
      {isMobile ? renderMobileFilters() : renderDesktopFilters()}

      <TableContainer component={Paper} sx={{ 
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        boxShadow: isMobile ? '0px 2px 4px -1px rgba(0,0,0,0.2)' : 'none',
      }}>
        <Table size={isMobile ? "small" : "medium"} sx={{ minWidth: isMobile ? 'auto' : 650 }}>
          <TableHead>
            <TableRow>
              <TableCell align="right" sx={{ 
                padding: isMobile ? '6px 8px' : '16px', 
                fontWeight: 'bold', 
                fontSize: isMobile ? '0.75rem' : '0.875rem' 
              }}>תאריך</TableCell>
              <TableCell align="right" sx={{ 
                padding: isMobile ? '6px 8px' : '16px', 
                fontWeight: 'bold', 
                fontSize: isMobile ? '0.75rem' : '0.875rem' 
              }}>תיאור</TableCell>
              <TableCell align="right" sx={{ 
                padding: isMobile ? '6px 8px' : '16px', 
                fontWeight: 'bold', 
                fontSize: isMobile ? '0.75rem' : '0.875rem' 
              }}>סכום</TableCell>
              <TableCell align="right" sx={{ 
                padding: isMobile ? '6px 8px' : '16px', 
                fontWeight: 'bold', 
                fontSize: isMobile ? '0.75rem' : '0.875rem' 
              }}>קטגוריה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => renderSkeletonRow(index))
            ) : filteredExpenses.length > 0 ? (
              <>
                {filteredExpenses.map((expense) => (
                  <TableRow 
                    key={expense.id} 
                    onClick={() => handleRowClick(expense)}
                    sx={{ 
                      cursor: 'pointer', 
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                      '& > .MuiTableCell-root': { 
                        padding: isMobile ? '6px 8px' : '16px',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        height: isMobile ? '36px' : 'auto'
                      }
                    }}
                  >
                    <TableCell align="right">{formatDate(expense.date)}</TableCell>
                    <TableCell align="right">{expense.description}</TableCell>
                    <TableCell align="right">{new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(expense.amount)}</TableCell>
                    <TableCell align="right">{expense.category}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} align="right" sx={{ 
                    fontWeight: 'bold', 
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    padding: isMobile ? '6px 8px' : '16px'
                  }}>
                    סך הכל:
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    fontWeight: 'bold', 
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    padding: isMobile ? '6px 8px' : '16px'
                  }}>
                    {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalAmount)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </>
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">אין נתונים להצגה</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Tooltip title="הוסף הוצאה חדשה" arrow>
        <Fab 
          color="primary" 
          aria-label="הוסף הוצאה חדשה" 
          onClick={handleAddExpenseClick}
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

      <Popover
        open={Boolean(addExpenseAnchorEl)}
        anchorEl={addExpenseAnchorEl}
        onClose={handleAddExpenseClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <ExpenseForm
            onSave={handleAddExpenseSave}
            onCancel={handleAddExpenseClose}
            isUpdating={isAddingExpense}
            onDelete={() => {}} // לא רלוונטי להוספת הוצאה חדשה
          />
        </Box>
      </Popover>

      <Dialog open={dateRangeDialogOpen} onClose={() => setDateRangeDialogOpen(false)}>
        <DialogTitle>בחר טווח תאריכים</DialogTitle>
        <DialogContent>
          <List>
            <ListItem button onClick={() => { handleDateRangeChange('currentMonth'); handleDateRangeConfirm(); }}>
              <ListItemText primary="חודש נוכחי" />
            </ListItem>
            <ListItem button onClick={() => { handleDateRangeChange('lastMonth'); handleDateRangeConfirm(); }}>
              <ListItemText primary="חודש קודם" />
            </ListItem>
            <ListItem button onClick={() => { handleDateRangeChange('lastThreeMonths'); handleDateRangeConfirm(); }}>
              <ListItemText primary="שלושה חודשים" />
            </ListItem>
            <ListItem button onClick={() => { handleDateRangeChange('lastSixMonths'); handleDateRangeConfirm(); }}>
              <ListItemText primary="חצי שנה" />
            </ListItem>
            <ListItem button onClick={() => { setOpenDatePicker(true); if (!isMobile) setDateRangeDialogOpen(false); }}>
              <ListItemText primary="טווח מותאם" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDateRangeDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleDateRangeConfirm} color="primary">אישור</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDatePicker} onClose={() => setOpenDatePicker(false)}>
        <DialogTitle>בחר טווח תאריכים מותאם</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="מתאריך"
              value={customStartDate || startDate}
              onChange={(newValue) => setCustomStartDate(newValue)}
            />
            <DatePicker
              label="עד תאריך"
              value={customEndDate || endDate}
              onChange={(newValue) => setCustomEndDate(newValue)}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDatePicker(false)}>ביטול</Button>
          <Button onClick={handleCustomDateConfirm} color="primary">אישור</Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>ערוך הוצאה</DialogTitle>
        <DialogContent>
          {currentEditExpense && (
            <ExpenseForm
              initialExpense={currentEditExpense}
              onSave={handleSaveEdit}
              onCancel={() => setEditDialogOpen(false)}
              isUpdating={isUpdating}
              onDelete={handleDeleteExpense}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)}>
        <DialogTitle>חיפוש הוצאות</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="חיפוש לפי תיאור"
            type="text"
            fullWidth
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSearchCancel}>נקה</Button>
          <Button onClick={handleSearchConfirm} color="primary">אישור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpensesTable;