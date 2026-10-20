
import { Request, Response } from 'express';
import db from '../config/db';

export class DashboardController {
  getDashboard = async (req: Request, res: Response) => {
    try {
      const result = await db.query(`
        SELECT
          COALESCE(
            SUM(amount) FILTER (WHERE type = 'income'),
            0
          ) AS total_income,

          COALESCE(
            SUM(amount) FILTER (WHERE type = 'expense'),
            0
          ) AS total_expense

        FROM transactions
      `);

      const totalIncome = Number(result.rows[0].total_income);
      const totalExpense = Number(result.rows[0].total_expense);

      return res.status(200).json({
        message: 'Berhasil mengambil data dashboard',
        data: {
          balance: totalIncome - totalExpense,
          income: totalIncome,
          expense: totalExpense,
        },
      });
    } catch (error) {
      console.error('Dashboard error:', error);

      return res.status(500).json({
        message: 'Gagal mengambil data dashboard',
      });
    }
  };
}

export default new DashboardController();
