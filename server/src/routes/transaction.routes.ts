import { Router } from 'express';
import TransactionController from '../controller/transaction.controller';


const router = Router();

router.post('/', TransactionController.createTransaction);
router.get('/', TransactionController.getTransactions);
router.patch('/:id', TransactionController.updateTransaction);
router.delete('/:id', TransactionController.deleteTransaction);

export default router;
