import { Request, Response } from 'express';
import { Budget, Expense } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/database';

// @desc    Create or update a budget
// @route   POST /api/budgets
// @access  Private
export const createOrUpdateBudget = async (req: Request, res: Response) => {
  try {
    const { category, amount, month, year } = req.body;
    
    // Check if budget already exists for this category/month/year
    const existingBudget = await Budget.findOne({
      where: {
        userId: req.user.id,
        category,
        month,
        year
      }
    });
    
    if (existingBudget) {
      // Update existing budget
      existingBudget.amount = amount;
      const updatedBudget = await existingBudget.save();
      return res.json(updatedBudget);
    }
    
    // Create new budget
    const budget = await Budget.create({
      userId: req.user.id,
      category,
      amount,
      month,
      year
    });
    
    res.status(201).json(budget);
  } catch (error) {
    console.error('Create/update budget error:', error);
    res.status(500).json({ message: 'Server error creating/updating budget' });
  }
};

// @desc    Get all budgets for a month
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    
    let whereClause: any = { userId: req.user.id };
    
    if (month && year) {
      whereClause.month = month;
      whereClause.year = year;
    } else {
      // Default to current month/year if not specified
      const now = new Date();
      whereClause.month = now.getMonth() + 1; // JavaScript months are 0-indexed
      whereClause.year = now.getFullYear();
    }
    
    const budgets = await Budget.findAll({
      where: whereClause,
    });
    
    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error retrieving budgets' });
  }
};

// @desc    Get budget vs actual spending for a month
// @route   GET /api/budgets/comparison
// @access  Private
export const getBudgetComparison = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    
    let monthNum, yearNum;
    
    if (month && year) {
      monthNum = parseInt(month.toString());
      yearNum = parseInt(year.toString());
    } else {
      // Default to current month/year
      const now = new Date();
      monthNum = now.getMonth() + 1; // JavaScript months are 0-indexed
      yearNum = now.getFullYear();
    }
    
    // Get start and end date for the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    
    // Get all budgets for the month
    const budgets = await Budget.findAll({
      where: {
        userId: req.user.id,
        month: monthNum,
        year: yearNum
      },
      attributes: ['category', 'amount']
    });
    
    // Get all expenses for the month grouped by category
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('amount')), 'actual']],
      group: ['category']
    });
    
    // Create comparison object
    const comparison = budgets.map(budget => {
      const budgetObj = budget.toJSON() as any;
      const expense = expenses.find((e: any) => e.category === budgetObj.category);
      const actual = expense ? parseFloat(expense.get('actual') as string) : 0;
      
      return {
        category: budgetObj.category,
        budgeted: parseFloat(budgetObj.amount),
        actual,
        remaining: parseFloat(budgetObj.amount) - actual,
        percentUsed: actual / parseFloat(budgetObj.amount) * 100
      };
    });
    
    res.json(comparison);
  } catch (error) {
    console.error('Get budget comparison error:', error);
    res.status(500).json({ message: 'Server error retrieving budget comparison' });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    await budget.destroy();
    
    res.json({ message: 'Budget removed' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Server error deleting budget' });
  }
}; 