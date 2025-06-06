import express from 'express';
import { createOrUpdateBudget, getBudgets, getBudgetComparison, deleteBudget } from '../controllers/budgetController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect as express.RequestHandler);

router.route('/')
  .post(createOrUpdateBudget as express.RequestHandler)
  .get(getBudgets as express.RequestHandler);

router.get('/comparison', getBudgetComparison as express.RequestHandler);

router.delete('/:id', deleteBudget as express.RequestHandler);

export default router; 