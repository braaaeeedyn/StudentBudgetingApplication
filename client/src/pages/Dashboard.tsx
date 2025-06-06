import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid as MuiGrid, 
  Paper, 
  Divider,
  LinearProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  Container,
  useTheme,
  Theme,
  Tooltip,
  alpha,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  AddCircleOutline as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  AccountBalance as BudgetIcon,
  MoneyOff as SpentIcon,
  Savings as RemainingIcon,
  ShowChart as TrendIcon,
  CreditCard as CreditCardIcon,
  Today as TodayIcon,
  CalendarMonth as MonthIcon,
  ArrowUpward as IncomeArrowIcon,
  ArrowDownward as ExpenseArrowIcon,
  PlaylistAdd as QuickAddIcon
} from '@mui/icons-material';
import { incomeAPI, expenseAPI, budgetAPI, goalAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AnimatedBox from '../components/AnimatedBox';
import AnimatedPage from '../components/AnimatedPage';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, ChartOptions, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { motion } from 'framer-motion';
import { BudgetFormData } from '../types';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

// Create custom Grid components to work around TypeScript errors
const Grid = MuiGrid as any;

// Common button hover style
const buttonHoverStyle = {
  transition: 'all 0.3s ease',
  borderRadius: 1,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: (theme: Theme) => theme.palette.mode === 'dark' 
      ? '0 4px 12px rgba(0,0,0,0.3)' 
      : '0 4px 12px rgba(0,0,0,0.1)'
  }
};

// Enhanced card style
const enhancedCardStyle = {
  borderRadius: 2,
  background: (theme: Theme) => theme.palette.mode === 'dark' 
    ? 'rgba(30,30,40,0.7)' 
    : 'rgba(255,255,255,0.9)',
  boxShadow: (theme: Theme) => theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.3)'
    : '0 8px 32px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.1)',
  border: (theme: Theme) => theme.palette.mode === 'dark'
    ? '1px solid rgba(80,80,120,0.2)'
    : '1px solid rgba(220,220,255,0.3)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: (theme: Theme) => theme.palette.mode === 'dark'
      ? 'linear-gradient(90deg, #673AB7, #9C27B0)'
      : 'linear-gradient(90deg, primary.main, secondary.main)',
    opacity: 0.8
  }
};

// Small metric card style
const metricCardStyle = {
  p: 1.5,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  borderRadius: 2,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: (theme: Theme) => theme.palette.mode === 'dark'
      ? '0 6px 20px rgba(0,0,0,0.3)'
      : '0 6px 20px rgba(0,0,0,0.1)'
  }
};

// New styles for transaction items
const transactionItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard data states
  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
    savingsPercentage: 0
  });
  
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [recentIncomes, setRecentIncomes] = useState<any[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);

  // Calculate overview metrics
  const [overviewMetrics, setOverviewMetrics] = useState({
    totalBudgeted: 0,
    totalSpent: 0,
    totalRemaining: 0,
    biggestExpense: { category: '', amount: 0 },
    mostRecentTransaction: { type: '', amount: 0, date: new Date() },
    monthlySpendingTrend: 0,
    upcomingBills: 0
  });

  // --- State for Quick Add Budget Dialog ---
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState<BudgetFormData>({
    category: '',
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  // ---------------------------------------------

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get current month and year
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
        const currentYear = now.getFullYear();
        
        // Set date range for the current month
        const startDate = new Date(currentYear, currentMonth - 1, 1).toISOString();
        const endDate = new Date(currentYear, currentMonth, 0).toISOString();
        
        // Fetch income data for current month
        const incomeResponse = await incomeAPI.getAll({ 
          startDate, 
          endDate 
        });
        
        // Fetch expense data for current month
        const expenseResponse = await expenseAPI.getAll({ 
          startDate, 
          endDate 
        });
        
        // Fetch budget comparison
        const budgetResponse = await budgetAPI.getComparison({
          month: currentMonth,
          year: currentYear
        });
        
        // Process data
        const incomes = incomeResponse.data;
        const expenses = expenseResponse.data;
        const budgets = budgetResponse.data;
        
        // Calculate monthly totals
        const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const savings = totalIncome - totalExpenses;
        const savingsPercentage = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
        
        setMonthlyData({
          income: totalIncome,
          expenses: totalExpenses,
          savings,
          savingsPercentage
        });
        
        // Set recent expenses (last 5)
        setRecentExpenses(expenses.slice(0, 5));
        
        // Set recent incomes (last 5)
        setRecentIncomes(incomes.slice(0, 5));
        
        // Set budget status
        setBudgetStatus(budgets);
        
        // Calculate overview metrics
        const totalBudgeted = budgets.reduce((sum, budget) => sum + Number(budget.budgeted), 0);
        const totalSpent = budgets.reduce((sum, budget) => sum + Number(budget.actual), 0);
        const totalRemaining = totalBudgeted - totalSpent;
        
        // Find biggest expense category
        const expensesByCategory: Record<string, number> = {};
        expenses.forEach(expense => {
          if (!expensesByCategory[expense.category]) {
            expensesByCategory[expense.category] = 0;
          }
          expensesByCategory[expense.category] += Number(expense.amount);
        });
        
        let biggestExpense = { category: '', amount: 0 };
        Object.keys(expensesByCategory).forEach(category => {
          if (expensesByCategory[category] > biggestExpense.amount) {
            biggestExpense = { 
              category, 
              amount: expensesByCategory[category] 
            };
          }
        });
        
        // Get most recent transaction
        const allTransactions = [...expenses, ...incomes].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const mostRecentTransaction = allTransactions.length ? {
          type: 'amount' in allTransactions[0] ? 'Expense' : 'Income',
          amount: Number(allTransactions[0].amount),
          date: new Date(allTransactions[0].date)
        } : { type: '', amount: 0, date: new Date() };
        
        // Set overview metrics
        setOverviewMetrics({
          totalBudgeted,
          totalSpent,
          totalRemaining,
          biggestExpense,
          mostRecentTransaction,
          monthlySpendingTrend: 0, // This would be calculated with historical data
          upcomingBills: 0 // This would require recurring bills data
        });
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // --- Handlers for Quick Add Budget ---
  const handleBudgetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBudget({
      ...newBudget,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value 
    });
  };

  const handleAddBudget = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const budgetDataToSend: BudgetFormData = {
          ...newBudget,
          month: currentMonth,
          year: currentYear
      };

      await budgetAPI.createOrUpdate(budgetDataToSend);
      
      setBudgetDialogOpen(false);
      setNewBudget({ category: '', amount: 0, month: currentMonth, year: currentYear }); 
      // Consider adding a Snackbar message here for success or refreshing data

    } catch (err) {
      console.error('Error adding budget:', err);
      setError('Failed to add budget. Please try again.'); 
    }
  };
  // ----------------------------------------

  // Prepare bar chart data for expenses by day of week
  const getDayOfWeekExpenses = () => {
    // Initialize an object to hold total expenses for each day of the week
    const dayTotals: Record<string, number> = {
      'Monday': 0,
      'Tuesday': 0,
      'Wednesday': 0,
      'Thursday': 0,
      'Friday': 0,
      'Saturday': 0,
      'Sunday': 0
    };

    // Process all expenses and group by day of week
    recentExpenses.forEach(expense => {
      if (expense && expense.date) {
        const dayOfWeek = new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long' });
        dayTotals[dayOfWeek] = (dayTotals[dayOfWeek] || 0) + Number(expense.amount);
      }
    });

    return dayTotals;
  };

  const dayOfWeekExpenses = getDayOfWeekExpenses();
  const daysOfWeek = Object.keys(dayOfWeekExpenses);
  const expenseTotals = Object.values(dayOfWeekExpenses);
  const maxExpense = Math.max(...expenseTotals, 1); // Ensure at least 1 to avoid division by zero

  const barChartData = {
    labels: daysOfWeek,
    datasets: [
      {
        label: 'Expenses',
        data: expenseTotals,
        backgroundColor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.error.main, 0.7)
          : alpha(theme.palette.error.light, 0.8),
        borderColor: theme.palette.error.dark,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest', // Set to a valid interaction mode
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, // Disable tooltips
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: function(value: any) {
            return '$' + value;
          }
        },
      },
    },
    layout: {
      padding: theme.spacing(1)
    },
    // Disable animations
    animation: {
      duration: 0
    },
    // Disable hover effects
    hover: {
      animationDuration: 0
    },
    // Disable responsive animations
    responsiveAnimationDuration: 0
  } as ChartOptions<'bar'>;
  
  return (
    <AnimatedPage>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.username}!
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/expenses')}
            sx={{
              mr: 2,
              borderRadius: '12px',
              px: 3, 
              py: 1.2,
              fontWeight: 'bold',
              color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.primary.contrastText,
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(45deg, ${theme.palette.error.dark} 30%, ${theme.palette.error.main} 90%)` 
                : `linear-gradient(45deg, ${theme.palette.error.main} 30%, ${theme.palette.error.light} 90%)`,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 3px 5px 2px rgba(229, 57, 53, .3)' 
                : '0 3px 5px 2px rgba(211, 47, 47, .3)',
              transition: 'all 0.35s cubic-bezier(.25,.8,.25,1)',
              '&:hover': {
                transform: 'scale(1.05) translateY(-2px)',
                background: theme.palette.mode === 'dark' 
                  ? `linear-gradient(45deg, ${theme.palette.error.main} 30%, ${theme.palette.error.light} 90%)` 
                  : `linear-gradient(45deg, ${theme.palette.error.dark} 30%, ${theme.palette.error.main} 90%)`,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 5px 15px 3px rgba(229, 57, 53, .4)' 
                  : '0 5px 15px 3px rgba(211, 47, 47, .4)',
              },
            }}
          >
            Add Expense
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/income')}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.2,
              fontWeight: 'bold',
              color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.success.contrastText,
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(45deg, ${theme.palette.success.dark} 30%, ${theme.palette.success.main} 90%)` 
                : `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.light} 90%)`,
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 3px 5px 2px rgba(46, 125, 50, .3)' 
                : '0 3px 5px 2px rgba(56, 142, 60, .3)',
              transition: 'all 0.35s cubic-bezier(.25,.8,.25,1)',
              '&:hover': {
                transform: 'scale(1.05) translateY(-2px)',
                background: theme.palette.mode === 'dark' 
                  ? `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.light} 90%)` 
                  : `linear-gradient(45deg, ${theme.palette.success.dark} 30%, ${theme.palette.success.main} 90%)`,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 5px 15px 3px rgba(46, 125, 50, .4)' 
                  : '0 5px 15px 3px rgba(56, 142, 60, .4)',
              },
            }}
          >
            Add Income
          </Button>
        </Box>
      </Box>
      
      {isLoading ? (
        <LinearProgress />
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Box>
          {/* Financial Overview Section - Quick Metrics */}
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              mb: 2, 
              position: 'relative',
              display: 'inline-block',
              fontWeight: 600,
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '40%',
                height: '2px',
                backgroundColor: theme => theme.palette.mode === 'dark' ? '#9C27B0' : 'primary.main'
              }
            }}
          >
            Overview
          </Typography>
          <Grid container spacing={2} sx={{ 
            mb: 3, 
            justifyContent: 'center',
            '& .MuiGrid-item': {
              display: 'flex',
              justifyContent: 'center'
            }
          }}>
            <Grid item xs={6} sm={4} md={3}>
              <Tooltip title="Total amount budgeted for the current month">
                <Paper sx={{ 
                  ...metricCardStyle,
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(30,40,60,0.7)' : 'rgba(235,245,255,0.9)' 
                }}>
                  <BudgetIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Budgeted
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ${overviewMetrics.totalBudgeted.toFixed(2)}
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid>
            
            <Grid item xs={7} sm={4.4} md={3.3}>
              <Tooltip title="Total amount spent this month">
                <Paper sx={{ 
                  ...metricCardStyle,
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(60,30,30,0.7)' : 'rgba(255,240,240,0.9)' 
                }}>
                  <SpentIcon sx={{ fontSize: 36, color: 'error.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Spent
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ${overviewMetrics.totalSpent.toFixed(2)}
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid>
            
            <Grid item xs={6} sm={4} md={3}>
              <Tooltip title="Remaining budget for this month">
                <Paper sx={{ 
                  ...metricCardStyle,
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(30,60,30,0.7)' : 'rgba(240,255,240,0.9)' 
                }}>
                  <RemainingIcon sx={{ fontSize: 36, color: 'success.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Remaining
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: overviewMetrics.totalRemaining >= 0 ? 'success.main' : 'error.main' }}>
                    ${overviewMetrics.totalRemaining.toFixed(2)}
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid>
            
            <Grid item xs={6} sm={4} md={3}>
              <Tooltip title="Your spending trend compared to last month">
                <Paper sx={{ 
                  ...metricCardStyle,
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(40,40,50,0.7)' : 'rgba(245,245,255,0.9)' 
                }}>
                  <TrendIcon sx={{ fontSize: 36, color: 'info.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Spending Trend
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {overviewMetrics.monthlySpendingTrend > 0 ? '+' : ''}
                    {overviewMetrics.monthlySpendingTrend}%
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid>
            
            <Grid item xs={6} sm={4} md={3}>
              <Tooltip title="Your biggest expense category this month">
                <Paper sx={{ 
                  ...metricCardStyle,
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(60,30,60,0.7)' : 'rgba(255,240,255,0.9)' 
                }}>
                  <CreditCardIcon sx={{ fontSize: 36, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Biggest Expense
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {overviewMetrics.biggestExpense.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${overviewMetrics.biggestExpense.amount.toFixed(2)}
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid>
            
            <Grid item xs={6} sm={4} md={3}>
              <Tooltip title="Your most recent transaction">
                <Paper sx={{ 
                  ...metricCardStyle,
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(50,40,30,0.7)' : 'rgba(250,245,235,0.9)' 
                }}>
                  <TodayIcon sx={{ fontSize: 36, color: 'warning.main', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Latest Transaction
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ${overviewMetrics.mostRecentTransaction.amount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {overviewMetrics.mostRecentTransaction.type}
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid>
            

            
            <Grid item xs={6} sm={4} md={3}>
              <Tooltip title="Days left in current month">
                <Paper sx={{ 
                  ...metricCardStyle,
                  background: theme => theme.palette.mode === 'dark' ? 'rgba(40,30,50,0.7)' : 'rgba(245,240,255,0.9)' 
                }}>
                  <MonthIcon sx={{ fontSize: 36, color: 'info.dark', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Days Remaining
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    in {new Date().toLocaleString('default', { month: 'long' })}
                  </Typography>
                </Paper>
              </Tooltip>
            </Grid>
          </Grid>

          {/* Monthly Summary - with enhanced visual styling for both light and dark modes */}
          <Paper 
            sx={{ 
              p: 2, 
              mb: 4, 
              width: '100%',
              ...enhancedCardStyle
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mb: 1, 
                position: 'relative',
                display: 'inline-block',
                fontWeight: 600,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '40%',
                  height: '2px',
                  backgroundColor: theme => theme.palette.mode === 'dark' ? '#9C27B0' : 'primary.main'
                }
              }}
            >
              Monthly Summary
            </Typography>
            <Grid container spacing={3} alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={5}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <AnimatedBox 
                      animation="scaleUp" 
                      delay={0.2} 
                      sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        backgroundColor: theme => theme.palette.mode === 'dark'
                          ? 'rgba(30,50,30,0.4)'
                          : 'rgba(240,255,240,0.7)',
                        borderRadius: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: theme => theme.palette.mode === 'dark'
                            ? 'rgba(40,70,40,0.6)'
                            : 'rgba(230,255,230,0.9)',
                          transform: 'translateY(-4px)',
                          boxShadow: theme => theme.palette.mode === 'dark'
                            ? '0 4px 12px rgba(0,0,0,0.2)'
                            : '0 4px 12px rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                        Income
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                        ${monthlyData.income.toFixed(2)}
                      </Typography>
                    </AnimatedBox>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <AnimatedBox 
                      animation="scaleUp" 
                      delay={0.3} 
                      sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        backgroundColor: theme => theme.palette.mode === 'dark'
                          ? 'rgba(50,30,30,0.4)'
                          : 'rgba(255,240,240,0.7)',
                        borderRadius: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: theme => theme.palette.mode === 'dark'
                            ? 'rgba(70,40,40,0.6)'
                            : 'rgba(255,230,230,0.9)',
                          transform: 'translateY(-4px)',
                          boxShadow: theme => theme.palette.mode === 'dark'
                            ? '0 4px 12px rgba(0,0,0,0.2)'
                            : '0 4px 12px rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                        Expenses
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                        ${monthlyData.expenses.toFixed(2)}
                      </Typography>
                    </AnimatedBox>
                  </Grid>

                </Grid>
              </Grid>
              <Grid item xs={12} md={7} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    maxWidth: 600,
                    width: '100%',
                    py: 1
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(30,30,40,0.7)' 
                        : 'background.paper',
                      borderRadius: 2, 
                      p: 2, 
                      width: 450,
                      height: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: theme => theme.palette.mode === 'dark'
                        ? 'inset 0 0 20px rgba(0,0,0,0.2)'
                        : 'inset 0 0 20px rgba(0,0,0,0.03)',
                      border: theme => theme.palette.mode === 'dark'
                        ? '1px solid rgba(80,80,120,0.2)'
                        : '1px solid rgba(220,220,255,0.2)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '50%',
                        height: '20%',
                        background: 'transparent',
                        borderRadius: '50%',
                        transform: 'scale(2)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'absolute'
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          '&:hover': {
                            transform: 'scale(1.02)',
                          },
                          padding: theme.spacing(1)
                        }}
                      >
                        <Bar data={barChartData} options={barChartOptions} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Combined Sections: Recent Transactions, Budget Status */}
          <Grid container spacing={3} sx={{ mb: 3, justifyContent: "center" }}>
            {/* Recent Expenses Section */}
            <Grid item xs={12} sm={6} md={2.75}> {/* Adjusted md sizing */}
              <Paper sx={{ p: 2.5, height: '420px', ...enhancedCardStyle, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                  Recent Expenses
                </Typography>
                <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, mr: -1 }}>
                  {recentExpenses.length > 0 ? (
                    recentExpenses.map((expense, index) => (
                      <motion.div
                        key={expense.id || index}
                        custom={index}
                        variants={transactionItemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ 
                          scale: 1.02,
                          backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.error.dark, 0.2) : alpha(theme.palette.error.light, 0.15),
                          boxShadow: `0 4px 15px ${alpha(theme.palette.error.main, 0.2)}`
                        }}
                        style={{
                          marginBottom: theme.spacing(1.5),
                          padding: theme.spacing(1.5),
                          borderRadius: theme.shape.borderRadius * 1.5,
                          backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.3) : alpha(theme.palette.grey[100], 0.5),
                          cursor: 'pointer',
                          borderLeft: `4px solid ${theme.palette.error.main}`
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ExpenseArrowIcon sx={{ color: theme.palette.error.main, mr: 1.5, fontSize: '1.8rem' }} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>{expense.category}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(expense.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
                            -${Number(expense.amount).toFixed(2)}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4}}>
                      No recent expenses logged.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            {/* Recent Income Section */}
            <Grid item xs={12} sm={6} md={2.75}> {/* Adjusted md sizing */}
            <Paper sx={{ p: 2.5, height: '420px', ...enhancedCardStyle, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                  Recent Income
                </Typography>
                <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, mr: -1 }}>
                  {recentIncomes.length > 0 ? (
                    recentIncomes.map((income, index) => (
                      <motion.div
                        key={income.id || index}
                        custom={index}
                        variants={transactionItemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ 
                          scale: 1.02, 
                          backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.dark, 0.2) : alpha(theme.palette.success.light, 0.15),
                          boxShadow: `0 4px 15px ${alpha(theme.palette.success.main, 0.2)}`
                        }}
                        style={{
                          marginBottom: theme.spacing(1.5),
                          padding: theme.spacing(1.5),
                          borderRadius: theme.shape.borderRadius * 1.5,
                          backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.3) : alpha(theme.palette.grey[100], 0.5),
                          cursor: 'pointer',
                          borderLeft: `4px solid ${theme.palette.success.main}`
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IncomeArrowIcon sx={{ color: theme.palette.success.main, mr: 1.5, fontSize: '1.8rem' }} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>{income.source}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(income.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
                            +${Number(income.amount).toFixed(2)}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4}}>
                      No recent income logged.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Budget Status Section */}
            <Grid item xs={12} sm={6} md={3.5}> {/* Adjusted md sizing */}
              <AnimatedBox animation="slideIn" delay={0.7} sx={{ height: '100%' }}>
                <Paper sx={{ 
                  p: 3, 
                  height: '420px',
                  ...enhancedCardStyle,
                  display: 'flex', flexDirection: 'column'
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}> 
                    <Typography variant="h6" sx={{ fontWeight: 600, flexShrink: 0 }}>
                      Budget Status
                    </Typography>
                    <Box sx={{ flexShrink: 0 }}>
                      <Button 
                        size="small" 
                        startIcon={<QuickAddIcon fontSize="small"/>}
                        onClick={() => setBudgetDialogOpen(true)}
                        sx={{ 
                          mr: 1,
                          color: 'primary.main',
                          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(40,40,55,0.7)' : 'rgba(0, 0, 0, 0.05)',
                          ...buttonHoverStyle,
                          '&:hover': { 
                            ...buttonHoverStyle['&:hover'],
                            bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(60,60,80,0.9)' : 'rgba(0, 0, 0, 0.08)',
                          }
                        }}
                      >
                        Quick Add
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => navigate('/budget')}
                        sx={{ 
                          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(40,40,55,0.7)' : 'rgba(0, 0, 0, 0.08)',
                          ...buttonHoverStyle
                        }}
                      >
                        Manage Budgets
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, mr: -1 }}>
                    {budgetStatus.length > 0 ? (
                      budgetStatus.map((budget, index) => (
                        <AnimatedBox key={budget.id || index} animation="slideUp" delay={0.2 + (index * 0.1)} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{budget.category}</Typography>
                            <Typography variant="body2">
                              ${Number(budget.actual).toFixed(2)} / ${Number(budget.budgeted).toFixed(2)}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(budget.percentUsed, 100)}
                            color={budget.percentUsed > 100 ? 'error' : budget.percentUsed > 80 ? 'warning' : 'primary'}
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </AnimatedBox>
                      ))
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          No currently set budgets! Create one to get started!
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </AnimatedBox>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* --- Quick Add Budget Dialog --- */}
      <Dialog 
        open={budgetDialogOpen} 
        onClose={() => setBudgetDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { 
            ...enhancedCardStyle,
            background: theme.palette.background.paper,
            backdropFilter: 'none',
            m: 1, 
            p: 1 
        } }}
      >
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>Quick Add Budget</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              required
              fullWidth
              label="Category Name"
              name="category"
              value={newBudget.category}
              onChange={handleBudgetInputChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              label="Budget Amount"
              name="amount"
              type="number"
              value={newBudget.amount === 0 ? '' : newBudget.amount}
              onChange={handleBudgetInputChange}
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0.01, step: 0.01 }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1}}>
              This budget will be added for the current month ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}).
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button 
            onClick={() => setBudgetDialogOpen(false)}
            sx={{ ...buttonHoverStyle, color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddBudget} 
            variant="contained"
            disabled={!newBudget.category || newBudget.amount <= 0}
            sx={{ 
              ...buttonHoverStyle,
              background: theme.palette.primary.main 
            }}
          >
            Add Budget
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
};

export default Dashboard; 