import { Request, Response } from 'express';
import { Expense } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/database';

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req: Request, res: Response) => {
  try {
    const { category, amount, date, isRecurring, frequency, description, paymentMethod } = req.body;
    
    const expense = await Expense.create({
      userId: req.user.id,
      category,
      amount,
      date: new Date(date),
      isRecurring: isRecurring || false,
      frequency,
      description,
      paymentMethod
    });
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error creating expense' });
  }
};

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, category } = req.query;
    let whereClause: any = { userId: req.user.id };
    
    // Add date filter if provided
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate.toString()), new Date(endDate.toString())]
      };
    }
    
    // Add category filter if provided
    if (category) {
      whereClause.category = category;
    }
    
    const expenses = await Expense.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });
    
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error retrieving expenses' });
  }
};

// @desc    Get expense categories summary
// @route   GET /api/expenses/summary
// @access  Private
export const getExpenseSummary = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    
    let startDate, endDate;
    
    // If month and year are provided, filter for that month
    if (month && year) {
      const monthNum = parseInt(month.toString());
      const yearNum = parseInt(year.toString());
      
      startDate = new Date(yearNum, monthNum - 1, 1); // Month is 0-indexed in JavaScript
      endDate = new Date(yearNum, monthNum, 0); // Last day of the month
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
    
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['category'],
      order: [[sequelize.literal('total'), 'DESC']]
    });
    
    res.json(expenses);
  } catch (error) {
    console.error('Get expense summary error:', error);
    res.status(500).json({ message: 'Server error retrieving expense summary' });
  }
};

// @desc    Get an expense by ID
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({ message: 'Server error retrieving expense' });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { category, amount, date, isRecurring, frequency, description, paymentMethod } = req.body;
    
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Update expense
    expense.category = category || expense.category;
    expense.amount = amount || expense.amount;
    if (date) expense.date = new Date(date);
    expense.isRecurring = isRecurring !== undefined ? isRecurring : expense.isRecurring;
    expense.frequency = frequency || expense.frequency;
    expense.description = description || expense.description;
    expense.paymentMethod = paymentMethod || expense.paymentMethod;
    
    const updatedExpense = await expense.save();
    
    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error updating expense' });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const expense = await Expense.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    await expense.destroy();
    
    res.json({ message: 'Expense removed' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error deleting expense' });
  }
}; 