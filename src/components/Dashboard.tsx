import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Paper, Tooltip, useTheme, useMediaQuery, Fab, Skeleton, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Tabs, Tab, Menu } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Doughnut, Pie } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBudgetData } from '../services/googleSheetsService';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, ChartData } from 'chart.js';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import { Link, useNavigate } from 'react-router-dom';
import { useFilter, DateRange } from '../contexts/FilterContext';
import { startOfMonth, endOfMonth, subMonths, parseISO, isWithinInterval, format, parse, isValid } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface BudgetData {
  category: string;
  budget: number;
  spent: number;
  date: string;
}

const encouragingMessages = [
  "כל צעד קטן הוא התקדמות גדולה!",
  "אתה בדרך הנכונה, המשך כך!",
  "ההתמדה שלך מרשימה, תמשיך להתקדם!",
  "אתה עושה עבודה נהדרת, תהיה גאה בעצמך!",
  "זכור, ההצלחה היא סכום של מאמצים קטנים יום-יומיים.",
  "אל תוותר, אתה קרוב יותר ממה שאתה חושב!",
  "כל אתגר הוא הזדמנות לצמיחה, המשך להתפתח!",
  "אתה חזק יותר ממה שאתה מאמין, תמשיך להילחם!",
  "ההשקעה שלך היום תניב פירות מחר, המשך כך!",
  "זכור, גם הצעד הקטן ביותר מקרב אותך למטרה!"
];

const Dashboard: React.FC = () => {
  const { startDate, endDate, dateRange, setDateRange } = useFilter();
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [filteredBudgetData, setFilteredBudgetData] = useState<BudgetData[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDateMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDateMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDateRangeChangeAndClose = (newRange: DateRange) => {
    handleDateRangeChange(newRange);
    handleDateMenuClose();
  };

  const fetchData = async () => {
    console.log('Dashboard: Fetching budget data...');
    setLoading(true);
    try {
      const data = await fetchBudgetData();
      console.log('Dashboard: Fetched budget data:', data);
      setBudgetData(data);
    } catch (error) {
      console.error('Dashboard: Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
    setMessage(encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseDate = (dateString: string) => {
    console.log('Dashboard: Parsing date:', dateString);
    const [day, month, year] = dateString.split('.');
    const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    console.log('Dashboard: Parsed date:', parsedDate);
    return parsedDate;
  };

  useEffect(() => {
    console.log('Dashboard: Filtering budget data...');
    console.log('Dashboard: Current filters:', { startDate, endDate });
    console.log('Dashboard: All budget data:', budgetData);
    const filtered = budgetData.filter(item => {
      const itemDate = parseDate(item.date);
      console.log('Dashboard: Checking item:', item);
      console.log('Dashboard: Item date:', itemDate);
      
      if (!isValid(itemDate)) {
        console.error('Invalid date:', item.date);
        return false;
      }
      
      const dateMatch = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
      console.log('Dashboard: Date match:', dateMatch);
      return dateMatch;
    });
    console.log('Dashboard: Filtered budget data:', filtered);
    setFilteredBudgetData(filtered);
  }, [budgetData, startDate, endDate]);

  const handleDateRangeChange = (newRange: DateRange) => {
    console.log('Dashboard: Date range changed to:', newRange);
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
  };

  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return '';
    return `${format(start, 'dd/MM/yy')} - ${format(end, 'dd/MM/yy')}`;
  };

  const renderSkeletonLoader = () => (
    <Grid container spacing={isMobile ? 2 : 3}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="circular" width={200} height={200} sx={{ my: 2 }} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="60%" />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const handleStartDateChange = (newValue: Date | null) => {
    setDateRange(dateRange, newValue ? format(newValue, 'yyyy-MM-dd') : null, endDate ? format(endDate, 'yyyy-MM-dd') : null);
  };

  const handleEndDateChange = (newValue: Date | null) => {
    setDateRange(dateRange, startDate ? format(startDate, 'yyyy-MM-dd') : null, newValue ? format(newValue, 'yyyy-MM-dd') : null);
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/expenses?category=${encodeURIComponent(category)}`);
  };

  const renderCurrentDashboard = () => (
    <Grid container spacing={isMobile ? 2 : 3}>
      <AnimatePresence>
        {filteredBudgetData.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={item.category}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: 'text.primary', // שימוש בצבע טקסט רגיל
                    textDecoration: 'none', // הסרת קו תחתון
                    '&:hover': {
                      color: 'primary.main', // שינוי צבע בעת ריחוף
                    },
                  }}
                  onClick={() => handleCategoryClick(item.category)}
                >
                  <AccountBalanceWalletIcon sx={{ mr: 1 }} /> {item.category}
                </Typography>
                <Box sx={{ position: 'relative', height: 200, width: '100%' }}>
                  <Doughnut
                    data={{
                      labels: ['הוצאות', 'נותר'],
                      datasets: [{
                        data: [item.spent, Math.max(0, item.budget - item.spent)],
                        backgroundColor: ['#216869', '#9cc5a1'],
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            color: '#1f2421',
                          },
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              let label = context.label || '';
                              if (label) {
                                label += ': ';
                              }
                              if (context.parsed !== undefined) {
                                label += new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(context.parsed);
                              }
                              return label;
                            }
                          }
                        }
                      }
                    }}
                  />
                </Box>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography>
                    תקציב: {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(item.budget)}
                  </Typography>
                  <Typography>
                    הוצאות: {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(item.spent)}
                  </Typography>
                  {item.budget - item.spent >= 0 ? (
                    <Tooltip title="כל שקל שנשאר הוא ניצחון קטן!">
                      <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <EmojiEventsIcon sx={{ mr: 1, color: 'gold' }} />
                        נותר: {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(item.budget - item.spent)}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Tooltip title="זה הזמן לחשוב על דרכים לחסוך!">
                      <Typography sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'error.main' }}>
                        <WarningIcon sx={{ mr: 1 }} />
                        חריגה: {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(Math.abs(item.budget - item.spent))}
                      </Typography>
                    </Tooltip>
                  )}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </AnimatePresence>
    </Grid>
  );

  const renderOverallPieChart = () => {
    const totalSpent = filteredBudgetData.reduce((sum, item) => sum + item.spent, 0);
  
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.primary.light,
      theme.palette.secondary.light,
      theme.palette.info.light,
      theme.palette.success.light,
      theme.palette.warning.light,
      theme.palette.error.light,
    ];

    const data = {
      labels: filteredBudgetData.map(item => item.category),
      datasets: [{
        data: filteredBudgetData.map(item => item.spent),
        backgroundColor: filteredBudgetData.map((_, index) => colors[index % colors.length]),
      }],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            color: theme.palette.text.primary,
          },
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.raw || 0;
              const percentage = ((value / totalSpent) * 100).toFixed(2);
              return `${label}: ${percentage}% (${new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(value)})`;
            }
          },
          bodyColor: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          borderWidth: 1,
        }
      }
    };

    return (
      <Box sx={{ 
        height: isMobile ? '50vh' : '66vh', 
        width: isMobile ? '100%' : '66%',
        margin: 'auto',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        padding: 2,
        boxShadow: theme.shadows[3],
      }}>
        <Typography variant="h6" gutterBottom color="textPrimary">
          סך כל ההוצאות: {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalSpent)}
        </Typography>
        <Box sx={{ width: '100%', height: '100%' }}>
          <Pie data={data} options={options} />
        </Box>
      </Box>
    );
  };

  const renderDateFilter = () => {
    if (isMobile) {
      return (
        <>
          <IconButton onClick={handleDateMenuClick}>
            <CalendarTodayIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleDateMenuClose}
          >
            <MenuItem onClick={() => handleDateRangeChangeAndClose('currentMonth')}>חודש נוכחי</MenuItem>
            <MenuItem onClick={() => handleDateRangeChangeAndClose('lastMonth')}>חודש קודם</MenuItem>
            <MenuItem onClick={() => handleDateRangeChangeAndClose('lastThreeMonths')}>שלושה חודשים</MenuItem>
            <MenuItem onClick={() => handleDateRangeChangeAndClose('lastSixMonths')}>חצי שנה</MenuItem>
            <MenuItem onClick={() => { setOpenDatePicker(true); handleDateMenuClose(); }}>טווח מותאם</MenuItem>
          </Menu>
        </>
      );
    } else {
      return (
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
      );
    }
  };

  return (
    <Box sx={{ 
      width: '100%',
      margin: 'auto', 
      mt: 4,
      px: isMobile ? 2 : 3,
      direction: 'rtl',
      position: 'relative',
      paddingBottom: '70px' // Add padding to the bottom to avoid overlap with FAB
    }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ ml: 1 }} /> דשבורד הוצאות
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {renderDateFilter()}
            {!isMobile && (
              <Typography variant="body2">
                {formatDateRange(startDate, endDate)}
              </Typography>
            )}
            <Tooltip title="רענן נתונים">
              <IconButton onClick={fetchData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} centered sx={{ mb: 2 }}>
          <Tab label="דשבורד מפורט" />
          <Tab label="סיכום כללי" />
        </Tabs>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Typography variant="h6" gutterBottom align="center" color="primary">
            {message}
          </Typography>
        </motion.div>
        {loading ? renderSkeletonLoader() : (
          activeTab === 0 ? renderCurrentDashboard() : renderOverallPieChart()
        )}
      </motion.div>
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
      <Dialog open={openDatePicker} onClose={() => setOpenDatePicker(false)}>
        <DialogTitle>בחר טווח תאריכים</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="מתאריך"
              value={customStartDate}
              onChange={(newValue) => setCustomStartDate(newValue)}
            />
            <DatePicker
              label="עד תאריך"
              value={customEndDate}
              onChange={(newValue) => setCustomEndDate(newValue)}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDatePicker(false)}>ביטול</Button>
          <Button onClick={handleCustomDateConfirm}>אישור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;