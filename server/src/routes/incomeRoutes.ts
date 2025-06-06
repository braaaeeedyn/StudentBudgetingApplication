import express from 'express';
import { createIncome, getIncomes, getIncomeById, updateIncome, deleteIncome } from '../controllers/incomeController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect as express.RequestHandler);

router.route('/')
  .post(createIncome as express.RequestHandler)
  .get(getIncomes as express.RequestHandler);

router.route('/:id')
  .get(getIncomeById as express.RequestHandler)
  .put(updateIncome as express.RequestHandler)
  .delete(deleteIncome as express.RequestHandler);

export default router; 