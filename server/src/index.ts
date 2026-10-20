
import express from 'express';
import cors from 'cors';

import transactionsRouter from './routes/transaction.routes';
import dashboardRouter from './routes/dashboard.routes';
import { createTransactionsTable } from './config/schema';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/transactions', transactionsRouter);
app.use('/api/v1/dashboard', dashboardRouter);

app.get('/', (req, res) => {
    res.send('CashMate API is running!');
});

const startServer = async () => {
    try {
        await createTransactionsTable();

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Gagal menjalankan server:', error);
    }
};

startServer();
