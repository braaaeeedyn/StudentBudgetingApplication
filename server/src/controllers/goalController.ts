import { Request, Response } from 'express';
import { SavingsGoal } from '../models';

// @desc    Create a new savings goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req: Request, res: Response) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, description } = req.body;
    
    const goal = await SavingsGoal.create({
      userId: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      description
    });
    
    res.status(201).json(goal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error creating savings goal' });
  }
};

// @desc    Get all savings goals for a user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req: Request, res: Response) => {
  try {
    const goals = await SavingsGoal.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error retrieving savings goals' });
  }
};

// @desc    Get a savings goal by ID
// @route   GET /api/goals/:id
// @access  Private
export const getGoalById = async (req: Request, res: Response) => {
  try {
    const goal = await SavingsGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('Get goal by ID error:', error);
    res.status(500).json({ message: 'Server error retrieving savings goal' });
  }
};

// @desc    Update a savings goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req: Request, res: Response) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, description } = req.body;
    
    const goal = await SavingsGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    // Update goal
    goal.name = name || goal.name;
    if (targetAmount !== undefined) goal.targetAmount = targetAmount;
    if (currentAmount !== undefined) goal.currentAmount = currentAmount;
    if (targetDate) goal.targetDate = new Date(targetDate);
    goal.description = description || goal.description;
    
    const updatedGoal = await goal.save();
    
    res.json(updatedGoal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error updating savings goal' });
  }
};

// @desc    Update current amount of a savings goal
// @route   PATCH /api/goals/:id/amount
// @access  Private
export const updateGoalAmount = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    
    if (amount === undefined) {
      return res.status(400).json({ message: 'Amount is required' });
    }
    
    const goal = await SavingsGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    // Update current amount
    goal.currentAmount = amount;
    
    const updatedGoal = await goal.save();
    
    // Check if goal has been reached
    const isGoalReached = goal.currentAmount >= goal.targetAmount;
    
    res.json({
      ...updatedGoal.toJSON(),
      isGoalReached
    });
  } catch (error) {
    console.error('Update goal amount error:', error);
    res.status(500).json({ message: 'Server error updating savings goal amount' });
  }
};

// @desc    Delete a savings goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const goal = await SavingsGoal.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    
    await goal.destroy();
    
    res.json({ message: 'Savings goal removed' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ message: 'Server error deleting savings goal' });
  }
}; 