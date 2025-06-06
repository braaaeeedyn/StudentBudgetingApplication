// User related types
export interface User {
  id: number;
  username: string;
  email: string;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
}

// Income related types
export interface Income {
  id: number;
  userId: number;
  source: string;
  amount: number;
  date: string | Date;
  isRecurring: boolean;
  frequency?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeFormData {
  source: string;
  amount: number;
  date: string | Date;
  isRecurring: boolean;
  frequency?: string;
  description?: string;
}

// Expense related types
export interface Expense {
  id: number;
  userId: number;
  category: string;
  amount: number;
  date: string | Date;
  isRecurring: boolean;
  frequency?: string;
  description?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  category: string;
  amount: number;
  date: string | Date;
  isRecurring: boolean;
  frequency?: string;
  description?: string;
  paymentMethod?: string;
}

// Budget related types
export interface Budget {
  id: number;
  userId: number;
  category: string;
  amount: number;
  month: number;
  year: number;
  spent?: number;
  remaining?: number;
  percentUsed?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  category: string;
  amount: number;
  month: number;
  year: number;
}

export interface BudgetComparison {
  category: string;
  budgeted: number;
  actual: number;
  remaining: number;
  percentUsed: number;
}

// Savings Goal related types
export interface SavingsGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | Date;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoalFormData {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string | Date;
  description?: string;
}

// Dashboard related types
export interface IncomeVsExpense {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTotals {
  income: number;
  expense: number;
  savings: number;
  savingsPercentage: number;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
} 