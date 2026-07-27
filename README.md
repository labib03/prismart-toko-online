# 🛍️ Prismart - Toko Online E-Commerce Platform

Selamat datang di repositori **Prismart**, platform e-commerce modern berbasis web yang dibangun menggunakan **Next.js 14 (App Router)**, **Prisma ORM**, dan **PostgreSQL**. Dokumentasi ini memberikan panduan lengkap dan mendalam tentang cara mengonfigurasi, menjalankan, menguji, dan merilis aplikasi secara keseluruhan baik di lingkungan lokal (*development*) maupun lingkungan produksi (*production*).

---

## 📌 Daftar Isi

1. [Teknologi Utama (Tech Stack)](#-teknologi-utama-tech-stack)
2. [Prasyarat Sistem (Prerequisites)](#-prasyarat-sistem-prerequisites)
3. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
4. [Langkah Konfigurasi & Instalasi](#-langkah-konfigurasi--instalasi)
5. [Konfigurasi Environment Variables](#-konfigurasi-environment-variables)
6. [Pengaturan Database & Data Awal (Seeding)](#-pengaturan-database--data-awal-seeding)
7. [Akun Uji Coba (Seed Test Accounts)](#-akun-uji-coba-seed-test-accounts)
8. [Cara Menjalankan Aplikasi](#-cara-menjalankan-aplikasi)
9. [Panduan Deployment ke Vercel & Neon PostgreSQL](#-panduan-deployment-ke-vercel--neon-postgresql)
10. [Troubleshooting & Masalah Umum](#-troubleshooting--masalah-umum)

---

## 🛠️ Teknologi Utama (Tech Stack)

Aplikasi Prismart mengombinasikan berbagai teknologi modern untuk memberikan performa tinggi dan pengalaman pengguna yang optimal:

- **Frontend & App Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, API Routes)
- **UI & Styling**: [React 18](https://react.dev/), [Tailwind CSS 3](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (Icons)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **ORM & Database**: [Prisma ORM](https://www.prisma.io/) v7 dengan **PostgreSQL** (Dukungan PostgreSQL Lokal, Docker, atau Neon DB Cloud)
- **Otentikasi & Keamanan**: [JWT (JSON Web Token)](https://jwt.io/), [bcryptjs](https://github.com/dperini/bcrypt.js)
- **Monitoring & Analisis**: LogRocket, Google Analytics 4 (`@next/third-parties`)
- **Package Manager**: `pnpm` (direkomendasikan) atau `npm`

---

## 💻 Prasyarat Sistem (Prerequisites)

Sebelum menjalankan aplikasi ini di komputer Anda, pastikan perangkat Anda telah memenuhi prasyarat berikut:

1. **Node.js**: Versi `18.17.0` atau lebih tinggi (direkomendasikan Node.js v20 LTS).
   - Periksa versi Node.js:
     ```bash
     node -v
     ```
2. **Package Manager**: `pnpm` v10 (atau `npm` / `yarn`).
   - Instal pnpm secara global jika belum ada:
     ```bash
     npm install -g pnpm
     ```
3. **Database PostgreSQL**:
   - **Opsi A (Lokal/Docker)**: Server PostgreSQL lokal berjalan di port `5432` atau kontainer Docker PostgreSQL.
   - **Opsi B (Cloud Database - Rekomendasi)**: Akun [Neon PostgreSQL](https://neon.tech/) (Gratis & Cepat).

---

## 📂 Struktur Direktori Proyek

```text
Prismart/
├── docs/                        # Dokumentasi laporan QA & Analisis
├── prisma/
│   ├── schema.prisma            # Definisi model data Prisma & skema database
│   └── seed.ts                  # Script seeding data produk & pengguna dummy
├── src/
│   ├── app/                     # Route halaman & API (Next.js App Router)
│   ├── components/              # Komponen UI Reusable
│   ├── lib/                     # Utilitas pendukung (Koneksi Prisma, Helper)
│   ├── services/                # Logika bisnis & API Client
│   └── store/                   # State Management Zustand
├── .env.example                 # Template variabel lingkungan
├── DEPLOYMENT.md                # Panduan rilis produksi singkat di Vercel
├── next.config.mjs              # Konfigurasi Next.js
├── package.json                 # Daftar dependensi & npm scripts
├── pnpm-lock.yaml               # Lockfile dependensi pnpm
├── tailwind.config.js           # Konfigurasi Tailwind CSS
└── tsconfig.json                # Konfigurasi TypeScript
```

---

## 🚀 Langkah Konfigurasi & Instalasi

### 1. Clone Repositori
Buka terminal Anda dan jalankan perintah:
```bash
git clone git@github.com:labib03/prismart-toko-online.git
cd Prismart
```

### 2. Instal Dependensi Proyek
Jalankan perintah berikut untuk menginstal seluruh package yang dibutuhkan:
```bash
pnpm install
```
*(Atau `npm install` jika Anda menggunakan npm).*

---

## 🔑 Konfigurasi Environment Variables

Salin file `.env.example` menjadi file `.env` di root direktori proyek:

```bash
cp .env.example .env
```
*(Untuk sistem operasi Windows PowerShell, gunakan `copy .env.example .env`).*

Buka file `.env` dan sesuaikan nilainya:

```env
# URL Koneksi PostgreSQL (Sesuaikan dengan kredensial PostgreSQL lokal atau Neon DB)
DATABASE_URL="postgresql://postgres:password123@localhost:5432/prismart_db?schema=public"

# Secret key untuk enkripsi JWT Token (Ubah sesuai keinginan)
JWT_SECRET="prismart_super_secret_jwt_key_2026"

# Lingkungan Aplikasi (development / production)
NODE_ENV="development"

# Integrasi Analitik & Monitoring (Opsional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-E4TRBE0D34"
NEXT_PUBLIC_LOGROCKET_APP_ID="djek8v/prismart"
```

> [!IMPORTANT]
> Jika Anda menggunakan **Neon DB Cloud**, salin connection string dari dashboard Neon Anda dan pastikan menambahkan parameter `?sslmode=require` di akhir string. Contoh:
> `DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/prismart-db?sslmode=require"`

---

## 🗄️ Pengaturan Database & Data Awal (Seeding)

Setelah `.env` dikonfigurasi, jalankan alur berikut untuk menginisialisasi skema database dan memasukkan data sampel produk & akun pengguna:

### 1. Generasi Prisma Client
Menghasilkan kode TypeScript client Prisma berdasarkan `prisma/schema.prisma`:
```bash
pnpm prisma:generate
```

### 2. Synchronize Skema ke Database (Push Migration)
Membuat tabel-tabel database (`users`, `products`, `orders`, `order_items`, `reviews`):
```bash
pnpm prisma:push
```

### 3. Jalankan Script Seeding Data
Memasukkan produk-produk awal, kategori, dan akun pengguna bawaan:
```bash
pnpm prisma:seed
```

---

## 👤 Akun Uji Coba (Seed Test Accounts)

Script seed (`prisma/seed.ts`) telah menyediakan akun bawaan yang bisa langsung digunakan untuk login dan pengujian fitur:

| Role | Email | Password | Hak Akses / Keterangan |
|---|---|---|---|
| **ADMIN** | `admin@prismart.com` | `admin123` | Akses penuh ke Halaman Dashboard Admin & Manajemen Produk |
| **USER** | `budi@prismart.com` | `user123` | Akun Pembeli (Sudah memiliki riwayat pesanan dummy) |
| **USER** | `siti@prismart.com` | `user123` | Akun Pembeli Baru |

---

## 💻 Cara Menjalankan Aplikasi

### A. Mode Pengembangan (Development Mode)

Untuk menjalankan dev server dengan fitur *Hot-Reloading*:

```bash
pnpm dev
```

Buka peramban (browser) Anda dan akses:
👉 **`http://localhost:3000`**

### B. Mode Produksi Lokal (Production Build Test)

Sebelum melakukan deployment ke server, sangat disarankan untuk menguji *production build* di komputer lokal:

1. **Build Aplikasi**:
   ```bash
   pnpm build
   ```
   *(Perintah ini akan menjalankan `prisma generate` lalu mengkompilasi file Next.js).*

2. **Jalankan Production Server**:
   ```bash
   pnpm start
   ```
   Aplikasi akan berjalan pada `http://localhost:3000` dengan optimasi performa produksi.

---

## 📜 Daftar NPM Scripts Utama

| Perintah Script | Deskripsi Fungsi |
|---|---|
| `pnpm dev` | Memulai server pengembangan Next.js (`localhost:3000`). |
| `pnpm build` | Menghasilkan Prisma client dan mem-build bundel produksi Next.js. |
| `pnpm start` | Menjalankan server Next.js yang telah di-build untuk mode produksi. |
| `pnpm lint` | Mengidentifikasi kesalahan gaya kode / sintaks dengan Next.js ESLint. |
| `pnpm prisma:generate` | Men-generate instance Prisma Client TypeScript. |
| `pnpm prisma:push` | Memperbarui skema database PostgreSQL tanpa file migrasi fisik. |
| `pnpm prisma:seed` | Mengisi database dengan data sampel produk dan pengguna dummy. |

---

## 🌐 Panduan Deployment ke Vercel & Neon PostgreSQL

Aplikasi Prismart dirancang untuk siap di-deploy dalam 1-Klik ke Vercel:

### 1. Buat Database Cloud di Neon
1. Registrasi/Login ke [Neon.tech Console](https://console.neon.tech/).
2. Buat proyek baru (misal: `prismart-db`).
3. Salin **Connection String PostgreSQL** yang diberikan.

### 2. Jalankan Seeding di Database Cloud
Dari terminal lokal Anda:
```bash
# Ganti temporary DATABASE_URL di terminal atau .env ke URL Neon
pnpm prisma:push
pnpm prisma:seed
```

### 3. Deploy di Vercel
1. Login ke [Vercel Dashboard](https://vercel.com/dashboard).
2. Pilih **Add New Project** -> Impor repositori Git `labib03/prismart-toko-online`.
3. Pada bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL`: *(Connection string dari Neon)*
   - `JWT_SECRET`: *(Secret key JWT produksi Anda)*
4. Klik **Deploy**. Vercel akan otomatis mengeksekusi build `prisma generate && next build` dan mempublikasikan aplikasi Anda secara langsung.

---

## ❓ Troubleshooting & Masalah Umum

### 1. Error: `P1001: Can't reach database server`
- **Penyebab**: Server PostgreSQL tidak aktif atau `DATABASE_URL` di file `.env` salah.
- **Solusi**: Pastikan layanan PostgreSQL lokal Anda berjalan, atau pastikan parameter `?sslmode=require` terpasang jika menggunakan Neon DB Cloud.

### 2. Error: `@prisma/client did not initialize yet`
- **Penyebab**: Client Prisma belum di-generate.
- **Solusi**: Jalankan perintah `pnpm prisma:generate`.

### 3. Error saat login: `Invalid Credentials`
- **Penyebab**: Database belum diisi data awal.
- **Solusi**: Jalankan perintah `pnpm prisma:seed` untuk membuat akun `admin@prismart.com` dan `budi@prismart.com`.

---

## 📄 Lisensi & Kontribusi

Dokumentasi ini dibuat untuk proyek **Prismart E-Commerce Platform**. Jika Anda memiliki pertanyaan atau ingin berkontribusi, silakan buat *Pull Request* atau *Issue* di repositori ini.
