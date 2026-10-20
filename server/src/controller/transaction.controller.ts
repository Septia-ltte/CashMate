
import { Request, Response } from 'express';
import db  from '../config/db';

export class TransactionController {
    // Create transaction
    createTransaction = async (req: Request, res: Response) => {
        try {
            const { title, amount, type, description, transactionDate } = req.body;

            if (!title || !amount || !type) {
                return res.status(400).json({
                    message: 'Title, amount, dan type wajib diisi',
                });
            }

            if (!['income', 'expense'].includes(type)) {
                return res.status(400).json({
                    message: 'Type harus income atau expense',
                });
            }

            if (Number(amount) <= 0) {
                return res.status(400).json({
                    message: 'Amount harus lebih dari 0',
                });
            }

            const result = await db.query(
                `INSERT INTO transactions
                (title, amount, type, description, transaction_date)
                VALUES ($1, $2, $3, $4, COALESCE($5::date, CURRENT_DATE))
                RETURNING *`,
                [title, amount, type, description ?? null, transactionDate ?? null]
            );

            return res.status(201).json({
                message: 'Transaksi berhasil ditambahkan',
                data: result.rows[0],
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Gagal menambahkan transaksi',
            });
        }
    };

    // Read all transactions
    getTransactions = async (req: Request, res: Response) => {
        try {
            const result = await db.query(
                `SELECT * FROM transactions
                 ORDER BY transaction_date DESC, id DESC`
            );

            return res.status(200).json({
                message: 'Berhasil mengambil data transaksi',
                data: result.rows,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Gagal mengambil data transaksi',
            });
        }
    };

    // Update transaction

    updateTransaction = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { title, amount, type, description, transactionDate } = req.body;

            const existing = await db.query(
                'SELECT * FROM transactions WHERE id = $1',
                [id]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json({
                    message: 'Transaksi tidak ditemukan',
                });
            }

            if (Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    message: 'Minimal satu field harus diisi',
                });
            }

            if (amount !== undefined && (!Number.isFinite(Number(amount)) || Number(amount) <= 0)) {
                return res.status(400).json({
                    message: 'Amount harus berupa angka lebih dari 0',
                });
            }

            if (type !== undefined && !['income', 'expense'].includes(type)) {
                return res.status(400).json({
                    message: 'Type harus income atau expense',
                });
            }

            const result = await db.query(
                `UPDATE transactions
                SET title = COALESCE($1, title),
                    amount = COALESCE($2, amount),
                    type = COALESCE($3, type),
                    description = CASE WHEN $4 THEN $5 ELSE description END,
                    transaction_date = COALESCE($6::date, transaction_date),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING *`,
                [
                    title ?? null,
                    amount ?? null,
                    type ?? null,
                    Object.hasOwn(req.body, 'description'),
                    description ?? null,
                    transactionDate ?? null,
                    id
                ]
            );

            return res.status(200).json({
                message: 'Transaksi berhasil diperbarui',
                data: result.rows[0],
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Gagal memperbarui transaksi',
            });
        }
    };

    // Delete transaction
    deleteTransaction = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const result = await db.query(
                `DELETE FROM transactions WHERE id = $1 RETURNING *`,
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    message: 'Transaksi tidak ditemukan',
                });
            }

            return res.status(200).json({
                message: 'Transaksi berhasil dihapus',
                data: result.rows[0],
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Gagal menghapus transaksi',
            });
        }
    };
}

export default new TransactionController();
