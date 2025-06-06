import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Dialog,
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  CircularProgress,
  Alert,
  LinearProgress,
  Grid as MuiGrid,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Add as AddIcon,
  AccountBalance as BudgetIcon,
  ShowChart as TrendIcon,
  CompareArrows as CompareIcon
} from '@mui/icons-material';
import { budgetAPI } from '../services/api';
import { Budget as BudgetType, BudgetFormData, BudgetComparison } from '../types';
import { 
  getCardStyle, 
  getPageContainerStyle, 
  getSectionHeadingStyle, 
  getFormFieldStyle, 
  getButtonStyle, 
  getTableStyle,
  getMetricCardStyle 
} from '../styles/themeStyles';

// Create custom Grid component to work around TypeScript errors
const Grid = MuiGrid as any;

const Budget: React.FC = () => {
  const theme = useTheme();
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [comparisons, setComparisons] = useState<BudgetComparison[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<BudgetType | null>(null);
  
  // Selected month and year
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  
  // Form state
  const [formData, setFormData] = useState<BudgetFormData>({
    category: '',
    amount: 0,
    month: month,
    year: year
  });

  // Category options
  const categoryOptions = [
    'Housing', 'Transportation', 'Food', 'Utilities', 'Insurance', 
    'Healthcare', 'Education', 'Entertainment', 'Personal Care', 
    'Clothing', 'Savings', 'Debt Payments', 'Gifts/Donations', 'Miscellaneous'
  ];

  // Month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Year options (current year and next year)
  const yearOptions = [
    { value: year - 1, label: (year - 1).toString() },
    { value: year, label: year.toString() },
    { value: year + 1, label: (year + 1).toString() }
  ];

  useEffect(() => {
    fetchBudgets();
    fetchComparisons();
  }, [month, year]);

  // Fetch all budgets for the selected month/year
  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await budgetAPI.getAll({ month, year });
      setBudgets(response.data);
    } catch (err: any) {
      console.error('Error fetching budget data:', err);
      setError('Failed to load budget data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch budget vs actual comparisons
  const fetchComparisons = async () => {
    try {
      const response = await budgetAPI.getComparison({ month, year });
      setComparisons(response.data);
    } catch (err: any) {
      console.error('Error fetching budget comparison data:', err);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle month selection change
  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = parseInt(e.target.value);
    setMonth(newMonth);
    setFormData(prev => ({ ...prev, month: newMonth }));
  };

  // Handle year selection change
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newYear = parseInt(e.target.value);
    setYear(newYear);
    setFormData(prev => ({ ...prev, year: newYear }));
  };

  // Open dialog for adding new budget
  const handleOpenAddDialog = () => {
    setEditingBudget(null);
    setFormData({
      category: '',
      amount: 0,
      month: month,
      year: year
    });
    setOpenDialog(true);
  };

  // Open dialog for editing budget
  const handleOpenEditDialog = (budget: BudgetType) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: Number(budget.amount),
      month: budget.month,
      year: budget.year
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Submit form for adding/editing budget
  const handleSubmit = async () => {
    try {
      await budgetAPI.createOrUpdate(formData);
      
      // Refresh budget list and comparisons
      fetchBudgets();
      fetchComparisons();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving budget:', err);
      setError('Failed to save budget. Please try again.');
    }
  };

  // Delete budget
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    
    try {
      await budgetAPI.delete(id);
      fetchBudgets();
      fetchComparisons();
    } catch (err: any) {
      console.error('Error deleting budget:', err);
      setError('Failed to delete budget. Please try again.');
    }
  };

  // Format month name
  const getMonthName = (monthNum: number) => {
    return monthOptions.find(m => m.value === monthNum)?.label || '';
  };

  // Get progress color
  const getProgressColor = (percent: number) => {
    if (percent > 100) return 'error';
    if (percent > 75) return 'warning';
    return 'primary';
  };

  return (
    <Box sx={getPageContainerStyle(theme)}>
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={4} gap={2}>
        <Typography variant="h4" component="h1" sx={getSectionHeadingStyle(theme)}>
          Budget Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={getButtonStyle(theme)}
        >
          Add Budget
        </Button>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} mb={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={getMetricCardStyle(theme)}>
            <CardContent>
              <BudgetIcon color="primary" />
              <Typography variant="h6" component="h3">
                Total Budget
              </Typography>
              <Typography variant="h4" component="p">
                ${budgets.reduce((sum, budget) => sum + budget.amount, 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={getMetricCardStyle(theme)}>
            <CardContent>
              <TrendIcon color="primary" />
              <Typography variant="h6" component="h3">
                Categories
              </Typography>
              <Typography variant="h4" component="p">
                {new Set(budgets.map(b => b.category)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={getMetricCardStyle(theme)}>
            <CardContent>
              <CompareIcon color="primary" />
              <Typography variant="h6" component="h3">
                Comparisons
              </Typography>
              <Typography variant="h4" component="p">
                {comparisons.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Month/Year Selector */}
      <Paper sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1" sx={{ mr: 2 }}>
          Budget Period:
        </Typography>
        <TextField
          select
          label="Month"
          value={month}
          onChange={handleMonthChange}
          sx={{ minWidth: 140, mr: 2 }}
        >
          {monthOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Year"
          value={year}
          onChange={handleYearChange}
          sx={{ minWidth: 100 }}
        >
          {yearOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : budgets.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You haven't set any budgets for {getMonthName(month)} {year}.
          </Typography>
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create Your First Budget
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* Budget Table */}
          <Grid item xs={12} lg={6}>
            <Paper elevation={3} sx={{ ...getCardStyle(theme), mb: 4, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Budget Overview</Typography>
              </Box>
              <TableContainer>
                <Table sx={getTableStyle(theme)}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Budgeted</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Spent</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Remaining</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Progress</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgets.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell>{budget.category}</TableCell>
                        <TableCell>${Number(budget.amount).toFixed(2)}</TableCell>
                        <TableCell>${Number(budget.spent || 0).toFixed(2)}</TableCell>
                        <TableCell>${Number(budget.remaining || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(budget.percentUsed || 0, 100)}
                            color={getProgressColor(budget.percentUsed || 0)}
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenEditDialog(budget)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(budget.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Budget vs Actual */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Budget vs Actual
              </Typography>
              {comparisons.length === 0 ? (
                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                  No spending data available for this period yet.
                </Typography>
              ) : (
                <Box>
                  {comparisons.map((comparison) => (
                    <Box key={comparison.category} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body1">{comparison.category}</Typography>
                        <Typography variant="body2">
                          ${Number(comparison.actual).toFixed(2)} / ${Number(comparison.budgeted).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(comparison.percentUsed, 100)}
                            color={getProgressColor(comparison.percentUsed)}
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(comparison.percentUsed)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography 
                        variant="body2" 
                        color={comparison.remaining < 0 ? 'error' : 'success.main'}
                        sx={{ mt: 0.5 }}
                      >
                        {comparison.remaining < 0 
                          ? `Over by $${Math.abs(comparison.remaining).toFixed(2)}` 
                          : `${comparison.remaining.toFixed(2)} remaining`}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Add/Edit Budget Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            ...getCardStyle(theme),
            m: 2,
            width: '100%',
            maxWidth: '600px',
          }
        }}
      >
        <DialogTitle sx={{ ...getSectionHeadingStyle(theme), mb: 0, pb: 2, '&::after': { display: 'none' } }}>
          {editingBudget ? 'Edit Budget' : 'Add New Budget'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              select
              margin="normal"
              required
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              sx={getFormFieldStyle(theme)}
            >
              {categoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Budget Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>
              }}
              sx={getFormFieldStyle(theme)}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                select
                fullWidth
                label="Month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                sx={getFormFieldStyle(theme)}
              >
                {monthOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                fullWidth
                label="Year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                sx={getFormFieldStyle(theme)}
              >
                {yearOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ ...getButtonStyle(theme), mr: 1, backgroundColor: 'transparent', color: 'text.primary', border: `1px solid ${theme.palette.divider}` }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.category || formData.amount <= 0}
            sx={getButtonStyle(theme)}
          >
            {editingBudget ? 'Update' : 'Add'} Budget
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Budget; 