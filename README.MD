# CashMate

CashMate adalah aplikasi pengelolaan kas yang terdiri dari frontend menggunakan Next.js dan backend menggunakan Express.js dengan database PostgreSQL.


## Struktur Project

```text
CashMate/
├── server/           # Backend Express.js
├── client_cashmate/  # Frontend Next.js
└── README.md
```

## Persyaratan

Pastikan sudah menginstal:

- Node.js dan npm
- PostgreSQL atau akses database PostgreSQL

## Cara Menjalankan Project

Frontend dan backend dijalankan melalui dua terminal terpisah.

### 1. Menjalankan Backend

Buka terminal dan masuk ke folder backend:

```bash
cd server
npm install
npm run dev
```

Backend berjalan di:

```text
http://localhost:3000
```

### 2. Menjalankan Frontend

Buka terminal baru dan masuk ke folder frontend:

```bash
cd client_cashmate
npm install
npx next dev -p 3001
```

Frontend dapat dibuka melalui:

```text
http://localhost:3001
```

## API Endpoint

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/v1/transactions` | Mengambil data transaksi |
| POST | `/api/v1/transactions` | Menambahkan transaksi |
| GET | `/api/v1/dashboard` | Mengambil ringkasan dashboard |

## Menjalankan Frontend dan Backend

1. Jalankan backend pada terminal pertama.
2. Jalankan frontend pada terminal kedua.
3. Buka `http://localhost:3001` di browser.
4. Pastikan backend dan database sudah aktif agar fitur aplikasi dapat digunakan.
