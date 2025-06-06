import express from 'express';
import { createGoal, getGoals, getGoalById, updateGoal, updateGoalAmount, deleteGoal } from '../controllers/goalController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect as express.RequestHandler);

router.route('/')
  .post(createGoal as express.RequestHandler)
  .get(getGoals as express.RequestHandler);

router.route('/:id')
  .get(getGoalById as express.RequestHandler)
  .put(updateGoal as express.RequestHandler)
  .delete(deleteGoal as express.RequestHandler);

router.patch('/:id/amount', updateGoalAmount as express.RequestHandler);

export default router; 