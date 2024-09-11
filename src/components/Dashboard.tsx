import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Tooltip, useTheme, useMediaQuery, Fab, Skeleton } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchBudgetData } from '../services/googleSheetsService';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, ChartData } from 'chart.js';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface BudgetData {
  category: string;
  budget: number;
  spent: number;
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
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setLoading(true);
    fetchBudgetData().then(data => {
      setBudgetData(data);
      setLoading(false);
    });
    setMessage(encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]);
  }, []);

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
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUpIcon sx={{ ml: 1 }} /> דשבורד הוצאות
        </Typography>
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
          <Grid container spacing={isMobile ? 2 : 3}>
            <AnimatePresence>
              {budgetData.map((item, index) => (
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
                        component={Link}
                        to={`/expenses?category=${encodeURIComponent(item.category)}`}
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
    </Box>
  );
};

export default Dashboard;