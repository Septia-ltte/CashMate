'use client';

import { useCallback, useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Transaction = {
  id: number;
  title: string;
  amount: number | string;
  type: 'income' | 'expense';
  description?: string;
  transaction_date: string;
};

type Dashboard = {
  balance: number;
  income: number;
  expense: number;
};

const emptyForm = {
  title: '',
  amount: '',
  type: 'income' as 'income' | 'expense',
  description: '',
  transactionDate: new Date().toLocaleDateString('en-CA'),
};

const rupiah = (value: number | string) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function Home() {
  const [dashboard, setDashboard] = useState<Dashboard>({
    balance: 0,
    income: 0,
    expense: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [dashboardResponse, transactionResponse] = await Promise.all([
        fetch(`${API_URL}/api/v1/dashboard`),
        fetch(`${API_URL}/api/v1/transactions`),
      ]);

      if (!dashboardResponse.ok || !transactionResponse.ok) {
        throw new Error('Gagal mengambil data dari server.');
      }

      const dashboardResult = await dashboardResponse.json();
      const transactionResult = await transactionResponse.json();

      setDashboard(dashboardResult.data);
      setTransactions(transactionResult.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat mengambil data.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.title.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setForm({
      title: transaction.title,
      amount: String(transaction.amount),
      type: transaction.type,
      description: transaction.description || '',
      transactionDate: transaction.transaction_date.slice(0, 10),
    });
    setShowForm(true);
  };


  const saveTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {
      const url = editingId
        ? `${API_URL}/api/v1/transactions/${editingId}`
        : `${API_URL}/api/v1/transactions`;

      const requestData = {
        title: form.title,
        amount: Number(form.amount),
        type: form.type,
        description: form.description,
        transactionDate: form.transactionDate,
      };

      console.log('URL API:', url);
      console.log('Data yang dikirim:', requestData);

      const response = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Status response:', response.status);

      const result = await response.json().catch(() => null);

      console.log('Response backend:', result);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Gagal menyimpan transaksi (HTTP ${response.status})`,
        );
      }

      console.log('Transaksi berhasil disimpan');

      setShowForm(false);
      setForm({
        ...emptyForm,
        transactionDate: new Date().toLocaleDateString('en-CA'),
      });

      await loadData();
    } catch (err) {
      console.error('Error menyimpan transaksi:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat menyimpan transaksi.',
      );
    } finally {
      setSaving(false);
    }
  };


  const deleteTransaction = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus transaksi ini?')) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus transaksi.');
      }

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menghapus transaksi.',
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F8F6] px-4 py-6 text-[#242820] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-[#627653]">
              CashMate
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard Kas XI RPL 5
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Kelola iuran, pantau saldo, dan catat pengeluaran kelas dengan mudah.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="rounded-xl bg-[#526747] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405438]"
          >
            + Tambah Transaksi
          </button>
        </header>

        {error && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <button onClick={loadData} className="font-semibold underline">
              Coba lagi
            </button>
          </div>
        )}

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard
            label="Total Saldo Kas"
            amount={dashboard.balance}
            symbol="Rp"
            color="text-[#526747]"
            loading={loading}
          />
          <SummaryCard
            label="Total Pemasukan"
            amount={dashboard.income}
            symbol="↗"
            color="text-emerald-600"
            loading={loading}
          />
          <SummaryCard
            label="Total Pengeluaran"
            amount={dashboard.expense}
            symbol="↘"
            color="text-rose-500"
            loading={loading}
          />
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-bold">Transaksi Kas</h2>
              <p className="mt-1 text-sm text-gray-500">
                Semua catatan pemasukan dan pengeluaran kas kelas.
              </p>
            </div>

            <input
              type="search"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#829474] sm:w-56"
            />
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-gray-500">
              Memuat transaksi...
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Transaksi</th>
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Tipe</th>
                    <th className="px-6 py-4 text-center font-semibold"> Nominal </th>
                    <th className="px-6 py-4 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">
                          {transaction.title}
                        </p>
                        {transaction.description && (
                          <p className="mt-1 max-w-52 truncate text-xs text-gray-500">
                            {transaction.description}
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                        {new Date(
                          transaction.transaction_date.slice(0, 10) +
                            'T00:00:00',
                        ).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {transaction.type === 'income'
                            ? 'Pemasukan'
                            : 'Pengeluaran'}
                        </span>
                      </td>

                      <td
                        className={`whitespace-nowrap px-6 py-4 text-center font-semibold ${
                          transaction.type === 'income'
                            ? 'text-emerald-600'
                            : 'text-gray-800'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {rupiah(transaction.amount)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => openEditForm(transaction)}
                            className="font-medium text-[#526747] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTransaction(transaction.id)}
                            className="font-medium text-rose-500 hover:underline"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        {search
                          ? 'Transaksi tidak ditemukan.'
                          : 'Belum ada transaksi.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-gray-100 px-6 py-4 text-xs text-gray-500">
            {filteredTransactions.length} transaksi ditampilkan
          </div>
        </section>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
            <form
              onSubmit={saveTransaction}
              className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-3 py-1 text-xl text-gray-400 hover:bg-gray-100"
                  aria-label="Tutup form"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Judul transaksi
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Contoh: Kas bulanan"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#829474]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nominal (Rp)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="any"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="Masukkan nominal"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#829474]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Jenis transaksi
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as 'income' | 'expense',
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#829474]"
                  >
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Tanggal
                  </label>
                  <input
                    required
                    type="date"
                    value={form.transactionDate}
                    onChange={(e) =>
                      setForm({ ...form, transactionDate: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#829474]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Deskripsi (opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Tambahkan catatan..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#829474]"
                  />
                </div>
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#526747] px-4 py-3 text-sm font-semibold text-white hover:bg-[#405438] disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  amount,
  symbol,
  color,
  loading,
}: {
  label: string;
  amount: number;
  symbol: string;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F4EE] text-lg font-bold ${color}`}
        >
          {symbol}
        </span>
      </div>
      {loading ? (
        <div className="mt-5 h-8 w-36 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <p className={`mt-5 break-words text-2xl font-bold tracking-tight sm:text-3xl ${color}`}>
          {rupiah(amount)}
        </p>
      )}
    </div>
  );
}
