import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  Income, 
  IncomeFormData,
  Expense,
  ExpenseFormData,
  Budget,
  BudgetFormData,
  BudgetComparison,
  SavingsGoal,
  SavingsGoalFormData
} from '../types';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication APIs
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<AxiosResponse<User>> => 
    api.post('/users/login', credentials),
  
  register: (userData: RegisterData): Promise<AxiosResponse<User>> => 
    api.post('/users', userData),
  
  getProfile: (): Promise<AxiosResponse<User>> => 
    api.get('/users/profile'),
  
  updateProfile: (userData: Partial<User>): Promise<AxiosResponse<User>> => 
    api.put('/users/profile', userData),
};

// Income APIs
export const incomeAPI = {
  getAll: (params?: { startDate?: string; endDate?: string }): Promise<AxiosResponse<Income[]>> => 
    api.get('/income', { params }),
  
  getById: (id: number): Promise<AxiosResponse<Income>> => 
    api.get(`/income/${id}`),
  
  create: (incomeData: IncomeFormData): Promise<AxiosResponse<Income>> => 
    api.post('/income', incomeData),
  
  update: (id: number, incomeData: Partial<IncomeFormData>): Promise<AxiosResponse<Income>> => 
    api.put(`/income/${id}`, incomeData),
  
  delete: (id: number): Promise<AxiosResponse<{ message: string }>> => 
    api.delete(`/income/${id}`),
};

// Expense APIs
export const expenseAPI = {
  getAll: (params?: { startDate?: string; endDate?: string; category?: string }): Promise<AxiosResponse<Expense[]>> => 
    api.get('/expenses', { params }),
  
  getById: (id: number): Promise<AxiosResponse<Expense>> => 
    api.get(`/expenses/${id}`),
  
  getSummary: (params?: { month?: number; year?: number }): Promise<AxiosResponse<{ category: string; total: number }[]>> => 
    api.get('/expenses/summary', { params }),
  
  create: (expenseData: ExpenseFormData): Promise<AxiosResponse<Expense>> => 
    api.post('/expenses', expenseData),
  
  update: (id: number, expenseData: Partial<ExpenseFormData>): Promise<AxiosResponse<Expense>> => 
    api.put(`/expenses/${id}`, expenseData),
  
  delete: (id: number): Promise<AxiosResponse<{ message: string }>> => 
    api.delete(`/expenses/${id}`),
};

// Budget APIs
export const budgetAPI = {
  getAll: (params?: { month?: number; year?: number }): Promise<AxiosResponse<Budget[]>> => 
    api.get('/budgets', { params }),
  
  createOrUpdate: (budgetData: BudgetFormData): Promise<AxiosResponse<Budget>> => 
    api.post('/budgets', budgetData),
  
  getComparison: (params?: { month?: number; year?: number }): Promise<AxiosResponse<BudgetComparison[]>> => 
    api.get('/budgets/comparison', { params }),
  
  delete: (id: number): Promise<AxiosResponse<{ message: string }>> => 
    api.delete(`/budgets/${id}`),
};

// Savings Goal APIs
export const goalAPI = {
  getAll: (): Promise<AxiosResponse<SavingsGoal[]>> => 
    api.get('/goals'),
  
  getById: (id: number): Promise<AxiosResponse<SavingsGoal>> => 
    api.get(`/goals/${id}`),
  
  create: (goalData: SavingsGoalFormData): Promise<AxiosResponse<SavingsGoal>> => 
    api.post('/goals', goalData),
  
  update: (id: number, goalData: Partial<SavingsGoalFormData>): Promise<AxiosResponse<SavingsGoal>> => 
    api.put(`/goals/${id}`, goalData),
  
  updateAmount: (id: number, amount: number): Promise<AxiosResponse<SavingsGoal & { isGoalReached: boolean }>> => 
    api.patch(`/goals/${id}/amount`, { amount }),
  
  delete: (id: number): Promise<AxiosResponse<{ message: string }>> => 
    api.delete(`/goals/${id}`),
};

export default api; 