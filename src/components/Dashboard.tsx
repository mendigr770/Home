import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Tooltip, useTheme, useMediaQuery, Fab } from '@mui/material';
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
  "אתה בדרך הנכונה!",
  "כל חיסכון קטן מוביל להצלחה גדולה!",
  "ניהול תקציב חכם מוביל לעתיד בטוח יותר!",
  "אתה שולט בכספך, לא להפך!",
  "צעד אחר צעד, אתה בונה את העתיד הפיננסי שלך!",
  "מנדי, כל שקל שאתה חוסך מקרב אותך לחופשה בחו\"ל!",
  "מיכל, את בדרך הנכונה לרכישת השואב השוטף החלומי!",
  "חיסכון היום, רכב חדש מחר - אתם מתקרבים!",
  "מנדי, הפאה החדשה כבר ממתינה לך בקצה דרך החיסכון!",
  "מיכל, את מכסחת את המינוס בצעדי ענק!",
  "כל הוצאה שנמנעת היא צעד קטן לקראת החופשה הגדולה בחו\"ל!",
  "חסכו היום, שאבו ושטפו בקלות מחר עם השואב החדש!",
  "מנדי, אתה בדרך לנהוג ברכב החדש שלך - המשך כך!",
  "מיכל, הפאה החדשה שלך מחכה בסוף מסלול החיסכון המוצלח הזה!",
  "המינוס נסוג, החיסכון עולה - אתם מנצחים!",
  "כל שקל שנחסך הוא עוד קילומטר בטיול הבא שלכם בחו\"ל!",
  "מנדי, אתה מנקה את הדרך לעתיד פיננסי בריא כמו שואב שוטף חדש!",
  "מיכל, את נוהגת בבטחה לעבר היעדים הפיננסיים שלך!",
  "הפאה החדשה תהיה סמל להצלחה הפיננסית שלכם!",
  "אתם מכסחים את החובות כמו מכסחת דשא מקצועית!",
  "מנדי ומיכל, החיסכון שלכם הוא כרטיס הטיסה לעתיד טוב יותר!",
  "שואבים את ההזדמנויות ושוטפים את הדאגות - אתם בדרך הנכונה!",
  "הרכב החדש כבר מחמם מנועים בחניה של העתיד שלכם!",
  "מנדי, הפאה החדשה תהיה הכתר על הצלחתך הפיננסית!",
  "מיכל, את מובילה את המשפחה להצלחה פיננסית - המינוס בורח ממך!",
  "החופשה בחו\"ל כבר לא נראית כמו חלום רחוק - אתם מתקרבים!",
  "מנדי, אתה שוטף את הדרך להצלחה כמו שואב מקצועי!",
  "מיכל, הנהיגה שלך בדרך החיסכון מובילה אותך ישר לרכב החדש!",
  "הפאה החדשה תהיה סמל לצמיחה הפיננסית המרשימה שלכם!",
  "אתם לא רק מכסחים את המינוס, אתם בונים עתיד פיננסי פורח!"
];

const Dashboard: React.FC = () => {
  const [budgetData, setBudgetData] = useState<BudgetData[]>([]);
  const [message, setMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchBudgetData().then(setBudgetData);
    setMessage(encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]);
  }, []);

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
                            backgroundColor: ['#ff6384', '#36a2eb'],
                          }],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
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