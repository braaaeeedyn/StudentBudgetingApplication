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
  FormControlLabel,
  Switch,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Grid as MuiGrid,
  Card,
  CardContent,
  useTheme,
  Divider
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Add as AddIcon, 
  PieChart as ChartIcon,
  Receipt as ReceiptIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  CalendarMonth as CalendarIcon,
  Payment as PaymentIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { expenseAPI } from '../services/api';
import { Expense as ExpenseType, ExpenseFormData } from '../types';
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

const Expenses: React.FC = () => {
  const theme = useTheme();
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [categorySummary, setCategorySummary] = useState<{category: string, total: number}[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseType | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    frequency: '',
    description: '',
    paymentMethod: ''
  });

  // Category and payment method options
  const categoryOptions = [
    'Housing', 'Transportation', 'Food', 'Utilities', 'Insurance', 
    'Healthcare', 'Education', 'Entertainment', 'Personal Care', 
    'Clothing', 'Savings', 'Debt Payments', 'Gifts/Donations', 'Miscellaneous'
  ];

  const paymentMethodOptions = [
    'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Payment', 'Other'
  ];

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' }
  ];

  useEffect(() => {
    fetchExpenses();
    fetchCategorySummary();
  }, []);

  // Fetch all expenses
  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data);
    } catch (err: any) {
      console.error('Error fetching expense data:', err);
      setError('Failed to load expense data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch category summary
  const fetchCategorySummary = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1; // JavaScript months are 0-indexed
      const year = now.getFullYear();
      
      const response = await expenseAPI.getSummary({ month, year });
      setCategorySummary(response.data);
    } catch (err: any) {
      console.error('Error fetching category summary:', err);
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

  // Handle switch change for recurring expense
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Open dialog for adding new expense
  const handleOpenAddDialog = () => {
    setEditingExpense(null);
    setFormData({
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      frequency: '',
      description: '',
      paymentMethod: ''
    });
    setOpenDialog(true);
  };

  // Open dialog for editing expense
  const handleOpenEditDialog = (expense: ExpenseType) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: Number(expense.amount),
      date: new Date(expense.date).toISOString().split('T')[0],
      isRecurring: expense.isRecurring,
      frequency: expense.frequency || '',
      description: expense.description || '',
      paymentMethod: expense.paymentMethod || ''
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Submit form for adding/editing expense
  const handleSubmit = async () => {
    try {
      if (editingExpense) {
        // Update existing expense
        await expenseAPI.update(editingExpense.id, formData);
      } else {
        // Create new expense
        await expenseAPI.create(formData);
      }
      
      // Refresh expense list and close dialog
      fetchExpenses();
      fetchCategorySummary();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving expense:', err);
      setError('Failed to save expense. Please try again.');
    }
  };

  // Delete expense
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      await expenseAPI.delete(id);
      fetchExpenses();
      fetchCategorySummary();
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  // Toggle summary view
  const toggleSummaryView = () => {
    setShowSummary(!showSummary);
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Calculate summary data
  const topCategory = categorySummary[0]?.category || 'None';
  const avgExpense = expenses.length > 0 
    ? totalExpenses / expenses.length 
    : 0;

  return (
    <Box sx={{
      ...getPageContainerStyle(theme),
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    }}>
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        width="100%"
        gap={2}
      >
        <Typography variant="h4" component="h1" sx={getSectionHeadingStyle(theme)}>
          Expense Tracker
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={getButtonStyle(theme)}
        >
          Add Expense
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        px: { xs: 2, sm: 3 },
        '& > *': {
          width: '100%',
          maxWidth: '300px',
          justifySelf: 'center'
        }
      }}>
        <Card sx={getMetricCardStyle(theme)}>
          <CardContent>
            <ReceiptIcon color="primary" />
            <Typography variant="h6" component="h3">
              Total Spent
            </Typography>
            <Typography variant="h4" component="p">
              ${totalExpenses.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={getMetricCardStyle(theme)}>
          <CardContent>
            <CategoryIcon color="primary" />
            <Typography variant="h6" component="h3">
              Categories
            </Typography>
            <Typography variant="h4" component="p">
              {categorySummary.length}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={getMetricCardStyle(theme)}>
          <CardContent>
            <TrendingUpIcon color="primary" />
            <Typography variant="h6" component="h3">
              Avg. Expense
            </Typography>
            <Typography variant="h4" component="p">
              ${avgExpense.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={getMetricCardStyle(theme)}>
          <CardContent>
            <InfoIcon color="primary" />
            <Typography variant="h6" component="h3">
              Top Category
            </Typography>
            <Typography variant="h4" component="p" noWrap>
              {topCategory}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : expenses.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', ...getCardStyle(theme) }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You haven't added any expenses yet.
          </Typography>
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={getButtonStyle(theme)}
          >
            Add Your First Expense
          </Button>
        </Paper>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            ...getCardStyle(theme), 
            width: '100%',
            p: 0,
            '& .MuiTableContainer-root': {
              width: '100%',
              overflowX: 'auto',
            },
          }}
        >
        <Table sx={getTableStyle(theme)}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Payment Method</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Recurring</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  {new Date(expense.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip label={expense.category} size="small" />
                </TableCell>
                <TableCell>
                  {expense.description}
                </TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>
                  ${Number(expense.amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  {expense.paymentMethod}
                </TableCell>
                <TableCell>
                  {expense.isRecurring ? `Yes (${expense.frequency})` : 'No'}
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpenEditDialog(expense)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDelete(expense.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}

    <Dialog 
      open={openDialog} 
      onClose={handleCloseDialog} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: (theme) => ({
          ...getCardStyle(theme),
          m: { xs: 1, sm: 2 },
          width: '100%',
          maxWidth: { xs: 'calc(100% - 16px)', sm: '600px' },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          },
          '& .MuiDialogContent-root': {
            p: { xs: 2, sm: 3 },
          },
          '& .MuiDialogActions-root': {
            p: { xs: 1, sm: 2 },
            '& > :not(:first-of-type)': {
              ml: 1,
            },
          },
        })
      }}
    >
      <DialogTitle sx={{ ...getSectionHeadingStyle(theme), mb: 0, pb: 2, '&::after': { display: 'none' } }}>
        {editingExpense ? 'Edit Expense' : 'Add New Expense'}
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
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>
              }}
              sx={getFormFieldStyle(theme)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={getFormFieldStyle(theme)}
            />
            
            <TextField
              select
              margin="normal"
              fullWidth
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              sx={getFormFieldStyle(theme)}
            >
              {paymentMethodOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isRecurring}
                  onChange={handleSwitchChange}
                  name="isRecurring"
                  color="primary"
                />
              }
              label="Is this a recurring expense?"
              sx={{ mt: 2, mb: 1 }}
            />
            
            {formData.isRecurring && (
              <TextField
                select
                margin="normal"
                fullWidth
                label="Frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                sx={getFormFieldStyle(theme)}
              >
                {frequencyOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
            
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              sx={getFormFieldStyle(theme)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ 
              ...getButtonStyle(theme), 
              mr: 1, 
              backgroundColor: 'transparent', 
              color: 'text.primary', 
              border: `1px solid ${theme.palette.divider}` 
            }}
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
            {editingExpense ? 'Update' : 'Add'} Expense
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses; 