# 🚀 Prismart E-Commerce - Panduan Deployment Production (Neon, Render, Vercel)

Dokumen ini berisi panduan lengkap langkah demi langkah untuk mengonfigurasi dan menyebarkan (deploy) aplikasi Prismart E-Commerce ke lingkungan produksi menggunakan cloud service gratis: **Neon (Database)**, **Render (Backend)**, dan **Vercel (Frontend)**.

---

## 📋 Repositori Git
* **URL Git**: `git@github.com:labib03/prismart-toko-online.git`

---

## 🗄️ Langkah 1: Setup Database Cloud (Neon PostgreSQL)

1. **Buat Akun & Project di Neon:**
   - Buka [Neon Console](https://console.neon.tech/) dan login/daftar.
   - Buat Project baru, beri nama `prismart-db`.
   - Pilih region terdekat (misal: `ap-southeast-1` Singapore).

2. **Dapatkan Connection String (DATABASE_URL):**
   - Di dashboard project Neon, salin **Connection String** PostgreSQL.
   - Pastikan string berformat seperti ini:
     ```env
     postgresql://<username>:<password>@<ep-hostname>.neon.tech/prismart-db?sslmode=require
     ```

3. **Inisialisasi Skema Database (Lokal ke Neon / Render):**
   - Dari komputer lokal, Anda dapat menjalankan perintah push skema ke database Neon:
     ```bash
     cd prismart-backend
     # Set DATABASE_URL sementara di file .env lokal ke URL Neon Anda
     pnpm prisma:push
     # (Opsional) Jalankan seed data awal
     pnpm prisma:seed
     ```

---

## ⚡ Langkah 2: Deployment Backend API (Render)

1. **Buat Web Service Baru di Render:**
   - Login ke [Render Dashboard](https://dashboard.render.com/).
   - Klik **New +** -> **Web Service**.
   - Sambungkan akun GitHub dan pilih repositori `labib03/prismart-toko-online`.

2. **Konfigurasi Web Service:**
   - **Name**: `prismart-backend` (atau nama unik pilihan Anda).
   - **Region**: Singapore (atau region terdekat).
   - **Root Directory**: `prismart-backend` *(Sangat penting untuk struktur monorepo)*.
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`

3. **Set Environment Variables di Render:**
   Buka menu **Environment** pada dashboard service Render, lalu tambahkan variabel berikut:
   | Key | Example Value | Description |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://user:pass@ep-xyz.neon.tech/prismart-db?sslmode=require` | Connection string dari Neon |
   | `JWT_SECRET` | `prismart_super_secret_production_key_2026` | Secret key JWT |
   | `FRONTEND_URL` | `https://prismart-toko-online.vercel.app` | URL aplikasi Vercel Anda |
   | `NODE_ENV` | `production` | Environment mode |
   | `PORT` | `5000` | Port aplikasi |

4. **Deploy & Salin URL Backend:**
   - Klik **Create Web Service**.
   - Tunggu proses deployment selesai.
   - Salin URL API Backend Anda (contoh: `https://prismart-backend.onrender.com`).
   - Uji health check dengan mengakses: `https://prismart-backend.onrender.com/api/health`.

---

## 🌐 Langkah 3: Deployment Frontend React (Vercel)

1. **Buat Project Baru di Vercel:**
   - Login ke [Vercel Dashboard](https://vercel.com/dashboard).
   - Klik **Add New...** -> **Project**.
   - Import repositori `labib03/prismart-toko-online`.

2. **Konfigurasi Project di Vercel:**
   - **Framework Preset**: `Vite`
   - **Root Directory**: Klik **Edit** dan pilih folder `prismart-frontend`.

3. **Set Environment Variable di Vercel:**
   Di bagian **Environment Variables**, tambahkan:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_URL` | `https://prismart-backend.onrender.com/api` | Point ke endpoint API Backend Render |

4. **Deploy & Verifikasi Routing:**
   - Klik **Deploy**.
   - File `prismart-frontend/vercel.json` secara otomatis mengonfigurasi SPA routing fallback sehingga halaman katalog, login, checkout, dan admin dapat di-refresh tanpa error 404.

---

## ✅ Langkah 4: Pengujian Integrasi Akhir (Production Verification)

1. Buka URL aplikasi Vercel Anda di browser.
2. Coba mendaftar akun pengguna baru (Register) dan login.
3. Pastikan token tersimpan di `localStorage` dan profil dapat dibuka.
4. Buat pesanan baru / lihat katalog produk untuk memastikan koneksi ke database Neon berjalan cepat dan lancar.
