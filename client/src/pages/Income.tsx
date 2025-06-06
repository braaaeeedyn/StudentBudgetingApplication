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
  Card,
  CardContent,
  Grid as MuiGrid,
  useTheme,
  Divider
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Add as AddIcon, 
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  Info as InfoIcon,
  PieChart as ChartIcon
} from '@mui/icons-material';
import { incomeAPI } from '../services/api';
import { Income as IncomeType, IncomeFormData } from '../types';
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

const Income: React.FC = () => {
  const theme = useTheme();
  const [incomes, setIncomes] = useState<IncomeType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [editingIncome, setEditingIncome] = useState<IncomeType | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<IncomeFormData>({
    source: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    frequency: '',
    description: ''
  });

  // Frequency options
  const [frequencyOptions] = useState([
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' }
  ]);

  // Common income sources
  const incomeSources = [
    'Salary', 'Freelance', 'Investments', 'Rental', 'Business', 
    'Side Hustle', 'Gifts', 'Scholarship', 'Other'
  ];
  
  // Calculate summary data
  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const avgIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
  const recurringIncome = incomes
    .filter(income => income.isRecurring)
    .reduce((sum, income) => sum + Number(income.amount), 0);
  
  // Group by source for summary
  const incomeBySource = incomes.reduce((acc, income) => {
    acc[income.source] = (acc[income.source] || 0) + Number(income.amount);
    return acc;
  }, {} as Record<string, number>);
  
  const topSource = Object.entries(incomeBySource)
    .sort((a, b) => b[1] - a[1])[0] || ['None', 0];

  useEffect(() => {
    fetchIncomes();
  }, []);

  // Fetch all incomes
  const fetchIncomes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await incomeAPI.getAll();
      setIncomes(response.data);
    } catch (err: any) {
      console.error('Error fetching income data:', err);
      setError('Failed to load income data. Please try again.');
    } finally {
      setLoading(false);
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

  // Handle switch change for recurring income
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Open dialog for adding new income
  const handleOpenAddDialog = () => {
    setEditingIncome(null);
    setFormData({
      source: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      frequency: '',
      description: ''
    });
    setOpenDialog(true);
  };

  // Open dialog for editing income
  const handleOpenEditDialog = (income: IncomeType) => {
    setEditingIncome(income);
    setFormData({
      source: income.source,
      amount: Number(income.amount),
      date: new Date(income.date).toISOString().split('T')[0],
      isRecurring: income.isRecurring,
      frequency: income.frequency || '',
      description: income.description || ''
    });
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Submit form for adding/editing income
  const handleSubmit = async () => {
    try {
      if (editingIncome) {
        // Update existing income
        await incomeAPI.update(editingIncome.id, formData);
      } else {
        // Create new income
        await incomeAPI.create(formData);
      }
      
      // Refresh income list and close dialog
      fetchIncomes();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error saving income:', err);
      setError('Failed to save income. Please try again.');
    }
  };

  // Delete income
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) {
      return;
    }
    
    try {
      await incomeAPI.delete(id);
      fetchIncomes();
    } catch (err: any) {
      console.error('Error deleting income:', err);
      setError('Failed to delete income. Please try again.');
    }
  };

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
          Income Tracker
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={getButtonStyle(theme)}
        >
          Add Income
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%', m: 0 }} justifyContent="center">
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={getMetricCardStyle(theme)}>
            <CardContent>
              <AttachMoneyIcon color="primary" />
              <Typography variant="h6" component="h3">
                Total Income
              </Typography>
              <Typography variant="h4" component="p">
                ${totalIncome.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={getMetricCardStyle(theme)}>
            <CardContent>
              <TrendingUpIcon color="primary" />
              <Typography variant="h6" component="h3">
                Avg. Income
              </Typography>
              <Typography variant="h4" component="p">
                ${avgIncome.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={getMetricCardStyle(theme)}>
            <CardContent>
              <AccountBalanceIcon color="primary" />
              <Typography variant="h6" component="h3">
                Recurring
              </Typography>
              <Typography variant="h4" component="p">
                ${recurringIncome.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={getMetricCardStyle(theme)}>
            <CardContent>
              <InfoIcon color="primary" />
              <Typography variant="h6" component="h3">
                Top Source
              </Typography>
              <Typography variant="h6" component="p" noWrap>
                {topSource[0]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ${Number(topSource[1]).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : incomes.length === 0 ? (
        <Paper elevation={3} sx={{ 
          p: 4, 
          textAlign: 'center',
          ...getCardStyle(theme),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <AccountBalanceIcon color="action" sx={{ fontSize: 60, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            No income records found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start by adding your first income source to track your earnings.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            sx={getButtonStyle(theme)}
          >
            Add Income
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
                <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Recurring</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                  <TableCell>{income.source}</TableCell>
                  <TableCell>{income.description}</TableCell>
                  <TableCell align="right">${Number(income.amount).toFixed(2)}</TableCell>
                  <TableCell>{income.isRecurring ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenEditDialog(income)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(income.id)}
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

      {/* Add/Edit Income Dialog */}
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
            '& .MuiDialogContent-root': {
              p: { xs: 2, sm: 3 },
            },
            '& .MuiDialogActions-root': {
              p: { xs: 1, sm: 2 },
              '& > :not(:first-of-type)': {
                ml: 1,
              },
            },
          }),
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          },
        }}
      >
        <DialogTitle sx={{ ...getSectionHeadingStyle(theme), mb: 0, pb: 2, '&::after': { display: 'none' } }}>
          {editingIncome ? 'Edit Income' : 'Add New Income'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              select
              margin="normal"
              required
              fullWidth
              label="Income Source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              sx={getFormFieldStyle(theme)}
            >
              <MenuItem value="">Select a source</MenuItem>
              {incomeSources.map((source) => (
                <MenuItem key={source} value={source}>
                  {source}
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
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isRecurring}
                  onChange={handleSwitchChange}
                  name="isRecurring"
                  color="primary"
                />
              }
              label="Recurring Income"
              sx={{ mt: 2, mb: 1, display: 'block' }}
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
                disabled={!formData.isRecurring}
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
            onClick={handleCloseDialog}
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
            disabled={!formData.source || formData.amount <= 0}
            sx={getButtonStyle(theme)}
          >
            {editingIncome ? 'Update' : 'Add'} Income
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Income; 