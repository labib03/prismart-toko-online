import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Ping DB to test connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      message: 'Prismart Backend API & PostgreSQL Database are healthy!',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Prismart Backend running on port http://localhost:${PORT}`);
});
