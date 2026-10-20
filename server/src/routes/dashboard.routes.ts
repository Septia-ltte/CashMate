import { Router } from 'express';
import dashboardController from '../controller/dashboard.controller';

const router = Router();

router.get('/', dashboardController.getDashboard);

export default router;