# 🚀 Prismart E-Commerce - Panduan Deployment Vercel (Next.js App Router)

Dokumen ini berisi panduan deployment **Super Simpel & Terpadu (1-Click Deployment)** ke **Vercel** dengan database cloud **Neon PostgreSQL**.

---

## 📋 Repositori Git
* **URL Git**: `git@github.com:labib03/prismart-toko-online.git`

---

## 🗄️ Langkah 1: Setup Database Cloud (Neon PostgreSQL)

1. **Buat Project di Neon:**
   - Buka [Neon Console](https://console.neon.tech/) dan login.
   - Buat Project baru bernama `prismart-db`.

2. **Dapatkan Connection String (DATABASE_URL):**
   - Salin Connection String PostgreSQL dari Neon Dashboard:
     ```env
     postgresql://<username>:<password>@<ep-hostname>.neon.tech/prismart-db?sslmode=require
     ```

3. **Inisialisasi Skema Database:**
   - Dari terminal komputer lokal Anda:
     ```bash
     # Set DATABASE_URL di file .env lokal ke URL Neon Anda
     pnpm prisma:push
     pnpm prisma:seed
     ```

---

## 🌐 Langkah 2: Deployment 1-Klik di Vercel

1. **Import Repositori di Vercel:**
   - Login ke [Vercel Dashboard](https://vercel.com/dashboard).
   - Klik **Add New...** -> **Project**.
   - Pilih repositori `labib03/prismart-toko-online`.

2. **Konfigurasi Project di Vercel:**
   - **Framework Preset**: `Next.js` (Otomatis terdeteksi).
   - **Root Directory**: `./` (Biarkan di root directory).

3. **Set Environment Variables di Vercel:**
   Tambahkan variabel lingkungan berikut:
   | Key | Example Value | Description |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://user:pass@ep-xyz.neon.tech/prismart-db?sslmode=require` | Connection string dari Neon |
   | `JWT_SECRET` | `prismart_super_secret_production_key_2026` | Secret key JWT |

4. **Klik Deploy!**
   - Vercel akan otomatis menjalankan `prisma generate && next build` dan mempublikasikan situs web Anda secara gratis tanpa kendala CORS atau server tambahan.
