import { Request, Response } from 'express';
import { Income } from '../models';
import { Op } from 'sequelize';

// @desc    Create a new income entry
// @route   POST /api/income
// @access  Private
export const createIncome = async (req: Request, res: Response) => {
  try {
    const { source, amount, date, isRecurring, frequency, description } = req.body;
    
    const income = await Income.create({
      userId: req.user.id,
      source,
      amount,
      date: new Date(date),
      isRecurring: isRecurring || false,
      frequency,
      description
    });
    
    res.status(201).json(income);
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({ message: 'Server error creating income entry' });
  }
};

// @desc    Get all income entries for a user
// @route   GET /api/income
// @access  Private
export const getIncomes = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    let whereClause: any = { userId: req.user.id };
    
    // Add date filter if provided
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate.toString()), new Date(endDate.toString())]
      };
    }
    
    const incomes = await Income.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });
    
    res.json(incomes);
  } catch (error) {
    console.error('Get incomes error:', error);
    res.status(500).json({ message: 'Server error retrieving income entries' });
  }
};

// @desc    Get an income entry by ID
// @route   GET /api/income/:id
// @access  Private
export const getIncomeById = async (req: Request, res: Response) => {
  try {
    const income = await Income.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }
    
    res.json(income);
  } catch (error) {
    console.error('Get income by ID error:', error);
    res.status(500).json({ message: 'Server error retrieving income entry' });
  }
};

// @desc    Update an income entry
// @route   PUT /api/income/:id
// @access  Private
export const updateIncome = async (req: Request, res: Response) => {
  try {
    const { source, amount, date, isRecurring, frequency, description } = req.body;
    
    const income = await Income.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }
    
    // Update income entry
    income.source = source || income.source;
    income.amount = amount || income.amount;
    if (date) income.date = new Date(date);
    income.isRecurring = isRecurring !== undefined ? isRecurring : income.isRecurring;
    income.frequency = frequency || income.frequency;
    income.description = description || income.description;
    
    const updatedIncome = await income.save();
    
    res.json(updatedIncome);
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ message: 'Server error updating income entry' });
  }
};

// @desc    Delete an income entry
// @route   DELETE /api/income/:id
// @access  Private
export const deleteIncome = async (req: Request, res: Response) => {
  try {
    const income = await Income.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!income) {
      return res.status(404).json({ message: 'Income entry not found' });
    }
    
    await income.destroy();
    
    res.json({ message: 'Income entry removed' });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ message: 'Server error deleting income entry' });
  }
}; 