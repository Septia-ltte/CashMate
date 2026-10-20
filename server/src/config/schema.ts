import db from './db';

export const createTransactionsTable = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS transactions (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
            type VARCHAR(10) NOT NULL
                CHECK (type IN ('income', 'expense')),
            description TEXT,
            transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};