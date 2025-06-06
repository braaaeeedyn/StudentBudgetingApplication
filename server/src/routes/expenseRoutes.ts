import express from 'express';
import { createExpense, getExpenses, getExpenseSummary, getExpenseById, updateExpense, deleteExpense } from '../controllers/expenseController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect as express.RequestHandler);

router.route('/')
  .post(createExpense as express.RequestHandler)
  .get(getExpenses as express.RequestHandler);

router.get('/summary', getExpenseSummary as express.RequestHandler);

router.route('/:id')
  .get(getExpenseById as express.RequestHandler)
  .put(updateExpense as express.RequestHandler)
  .delete(deleteExpense as express.RequestHandler);

export default router; 